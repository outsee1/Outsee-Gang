import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // ---- Require authentication ----
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const callerUserId = userData.user.id;
    const callerIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('cf-connecting-ip')
      || null;

    const { items, orderId, successUrl, cancelUrl } = await req.json();

    // Allowlist origins to prevent open-redirect via successUrl/cancelUrl
    const ALLOWED_ORIGINS = [
      'https://outsee.lovable.app',
      'https://id-preview--ea8aad58-c070-491e-be9e-0710771201cd.lovable.app',
    ];
    const isAllowedUrl = (u: unknown): u is string => {
      if (!u || typeof u !== 'string') return false;
      try {
        const parsed = new URL(u);
        return ALLOWED_ORIGINS.includes(parsed.origin);
      } catch { return false; }
    };
    const safeSuccessUrl = isAllowedUrl(successUrl) ? successUrl : `${ALLOWED_ORIGINS[0]}/pedido-confirmado?id=${orderId || ''}&session_id={CHECKOUT_SESSION_ID}`;
    const safeCancelUrl = isAllowedUrl(cancelUrl) ? cancelUrl : `${ALLOWED_ORIGINS[0]}/carrinho`;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Items are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate items shape
    type IncomingItem = { productId?: string; quantity?: number };
    const cleanItems: { productId: string; quantity: number }[] = [];
    for (const it of items as IncomingItem[]) {
      if (!it?.productId || typeof it.productId !== 'string') {
        return new Response(JSON.stringify({ error: 'productId required for each item' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const q = Math.floor(Number(it.quantity || 0));
      if (!q || q < 1 || q > 100) {
        return new Response(JSON.stringify({ error: 'invalid quantity' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      cleanItems.push({ productId: it.productId, quantity: q });
    }

    // Fetch authoritative product data from DB (service role bypasses RLS for read)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const ids = cleanItems.map(i => i.productId);
    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('id, name, price, image_url')
      .in('id', ids);
    if (prodErr || !products || products.length !== ids.length) {
      return new Response(JSON.stringify({ error: 'Invalid product(s)' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const lineItems = cleanItems.map((it) => {
      const p = products.find((pp: any) => pp.id === it.productId)!;
      const isValidUrl = p.image_url && (String(p.image_url).startsWith('http://') || String(p.image_url).startsWith('https://'));
      return {
        price_data: {
          currency: 'brl',
          product_data: {
            name: p.name,
            ...(isValidUrl ? { images: [p.image_url] } : {}),
          },
          unit_amount: Math.round(Number(p.price) * 100),
        },
        quantity: it.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'pix', 'boleto'],
      line_items: lineItems,
      mode: 'payment',
      success_url: safeSuccessUrl,
      cancel_url: safeCancelUrl,
      metadata: {
        order_id: orderId || '',
      },
      payment_method_options: {
        boleto: {
          expires_after_days: 3,
        },
      },
    });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
