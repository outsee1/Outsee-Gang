import { corsHeaders } from '@supabase/supabase-js/cors'

interface CartItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN is not configured')
    }

    const { items, payer, orderId } = await req.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Items are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const mpItems = items.map((item: CartItem) => ({
      title: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      currency_id: 'BRL',
    }))

    const origin = req.headers.get('origin') || 'https://outsee.lovable.app'

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
