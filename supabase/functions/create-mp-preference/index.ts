import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface IncomingItem { productId?: string; quantity?: number }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN is not configured')
    }

    // ---- Require authentication ----
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: userData, error: userErr } = await userClient.auth.getUser()
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const callerUserId = userData.user.id
    const callerIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('cf-connecting-ip')
      || null

    const { items, payer, orderId } = await req.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Items are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const cleanItems: { productId: string; quantity: number }[] = []
    for (const it of items as IncomingItem[]) {
      if (!it?.productId || typeof it.productId !== 'string') {
        return new Response(JSON.stringify({ error: 'productId required for each item' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const q = Math.floor(Number(it.quantity || 0))
      if (!q || q < 1 || q > 100) {
        return new Response(JSON.stringify({ error: 'invalid quantity' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      cleanItems.push({ productId: it.productId, quantity: q })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    const ids = cleanItems.map(i => i.productId)
    const { data: products, error: prodErr } = await supabase
      .from('products').select('id, name, price').in('id', ids)
    if (prodErr || !products || products.length !== ids.length) {
      return new Response(JSON.stringify({ error: 'Invalid product(s)' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const mpItems = cleanItems.map((it) => {
      const p = products.find((pp: any) => pp.id === it.productId)!
      return {
        title: p.name,
        quantity: it.quantity,
        unit_price: Number(p.price),
        currency_id: 'BRL',
      }
    })

    const ALLOWED_ORIGINS = [
      'https://outsee.lovable.app',
      'https://id-preview--ea8aad58-c070-491e-be9e-0710771201cd.lovable.app',
    ]
    const reqOrigin = req.headers.get('origin')
    const origin = reqOrigin && ALLOWED_ORIGINS.includes(reqOrigin)
      ? reqOrigin
      : ALLOWED_ORIGINS[0]

    const preference = {
      items: mpItems,
      payer: payer ? {
        name: payer.firstName,
        surname: payer.lastName,
        email: payer.email || '',
      } : undefined,
      back_urls: {
        success: `${origin}/pedido-confirmado?id=${orderId || 'mp'}`,
        failure: `${origin}/carrinho`,
        pending: `${origin}/pedido-confirmado?id=${orderId || 'mp'}&status=pending`,
      },
      auto_return: 'approved',
      external_reference: orderId || '',
    }

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Mercado Pago error:', data)
      throw new Error(`Mercado Pago API error [${response.status}]: ${JSON.stringify(data)}`)
    }

    return new Response(JSON.stringify({
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating preference:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
