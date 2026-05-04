import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ---- AuthN/AuthZ: require admin ----
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      const { name, description, price, tag, category, colors, sizes, image_url } = body;

      const { data: product, error } = await supabase
        .from("products")
        .insert({ name, description, price, tag: tag || null, category, image_url: image_url || null })
        .select()
        .single();

      if (error) throw error;

      if (colors?.length) {
        const colorRows = colors.map((c: any, i: number) => ({
          product_id: product.id,
          name: c.name,
          hex: c.hex,
          image_url: c.image_url || null,
          sort_order: i,
        }));
        await supabase.from("product_colors").insert(colorRows);
      }

      if (sizes?.length) {
        const sizeRows = sizes.map((s: any) => ({
          product_id: product.id,
          size: s.size,
          available: s.available ?? true,
        }));
        await supabase.from("product_sizes").insert(sizeRows);
      }

      return new Response(JSON.stringify({ product }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update") {
      const { productId, updates } = body;
      const { sizes, colors, ...productUpdates } = updates;

      if (Object.keys(productUpdates).length > 0) {
        const { error } = await supabase
          .from("products")
          .update(productUpdates)
          .eq("id", productId);
        if (error) throw error;
      }

      if (sizes) {
        // Delete existing sizes and re-insert to handle new custom sizes
        await supabase.from("product_sizes").delete().eq("product_id", productId);
        if (sizes.length > 0) {
          const sizeRows = sizes.map((s: any) => ({
            product_id: productId,
            size: s.size,
            available: s.available ?? true,
          }));
          await supabase.from("product_sizes").insert(sizeRows);
        }
      }

      // Update color image_urls
      if (colors) {
        // Delete existing colors and re-insert
        await supabase.from("product_colors").delete().eq("product_id", productId);
        if (colors.length > 0) {
          const colorRows = colors.map((c: any, i: number) => ({
            product_id: productId,
            name: c.name,
            hex: c.hex,
            image_url: c.image_url || null,
            sort_order: i,
          }));
          await supabase.from("product_colors").insert(colorRows);
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      const { productId } = body;
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
