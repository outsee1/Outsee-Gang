import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

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

    const { items, orderId, successUrl, cancelUrl } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Items are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const lineItems = items.map((item: { name: string; price: number; quantity: number; image?: string }) => {
      const isValidUrl = item.image && (item.image.startsWith('http://') || item.image.startsWith('https://'));
      return {
        price_data: {
          currency: 'brl',
          product_data: {
            name: item.name,
            ...(isValidUrl ? { images: [item.image] } : {}),
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'pix', 'boleto'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || 'https://outsee.lovable.app/pedido-confirmado?id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl || 'https://outsee.lovable.app/',
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
