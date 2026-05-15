import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Action = "list" | "set-admin";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const clientIp = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  req.headers.get("cf-connecting-ip") ||
  req.headers.get("x-real-ip") ||
  null;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: authData, error: authError } = await userClient.auth.getUser();
    if (authError || !authData.user) return json({ error: "Unauthorized" }, 401);

    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: roleRow } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", authData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    const actorEmail = authData.user.email || "";
    const { data: emailRoleRow } = actorEmail
      ? await adminClient
          .from("admin_email_roles")
          .select("role")
          .eq("role", "admin")
          .ilike("email", actorEmail)
          .maybeSingle()
      : { data: null } as any;

    if (!roleRow && !emailRoleRow) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const action = (body.action || "list") as Action;

    if (action === "list") {
      const page = Math.max(Number(body.page || 1), 1);
      const perPage = Math.min(Math.max(Number(body.perPage || 25), 1), 100);
      const search = String(body.search || "").trim().toLowerCase();
      const listPage = search ? 1 : page;
      const listPerPage = search ? 1000 : perPage;

      const { data, error } = await adminClient.auth.admin.listUsers({
        page: listPage,
        perPage: listPerPage,
      });
      if (error) throw error;

      const filteredUsers = (data.users || []).filter((user) => {
        if (!search) return true;
        return user.email?.toLowerCase().includes(search) || user.id.toLowerCase().includes(search);
      });
      const pagedUsers = search
        ? filteredUsers.slice((page - 1) * perPage, page * perPage)
        : filteredUsers;
      const ids = pagedUsers.map((user) => user.id);

      const { data: roles, error: rolesError } = ids.length
        ? await adminClient.from("user_roles").select("user_id, role").in("user_id", ids).eq("role", "admin")
        : { data: [], error: null };
      if (rolesError) throw rolesError;
      const adminIds = new Set((roles || []).map((role: any) => role.user_id));

      const { data: emailGrants, error: grantsError } = await adminClient
        .from("admin_email_roles")
        .select("email, role")
        .eq("role", "admin");
      if (grantsError) throw grantsError;
      const adminEmails = new Set((emailGrants || []).map((grant: any) => String(grant.email).toLowerCase()));

      return json({
        users: pagedUsers.map((user) => ({
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          email_confirmed_at: user.email_confirmed_at,
          is_admin: adminIds.has(user.id) || adminEmails.has(String(user.email || "").toLowerCase()),
          admin_source: adminIds.has(user.id) ? "user" : adminEmails.has(String(user.email || "").toLowerCase()) ? "email" : null,
        })),
        page,
        perPage,
        total: search ? filteredUsers.length : data.total,
        currentUserId: authData.user.id,
      });
    }

    if (action === "set-admin") {
      const targetUserId = String(body.userId || "");
      const makeAdmin = Boolean(body.isAdmin);
      if (!targetUserId) return json({ error: "User id is required" }, 400);
      if (!makeAdmin && targetUserId === authData.user.id) {
        return json({ error: "Você não pode remover seu próprio admin." }, 400);
      }

      const { data: targetUser, error: targetError } = await adminClient.auth.admin.getUserById(targetUserId);
      if (targetError || !targetUser?.user) return json({ error: "Usuário não encontrado" }, 404);
      const targetEmail = targetUser.user.email || null;

      if (makeAdmin) {
        const { error } = await adminClient
          .from("user_roles")
          .insert({ user_id: targetUserId, role: "admin" });
        if (error && error.code !== "23505") throw error;
      } else {
        const { error } = await adminClient
          .from("user_roles")
          .delete()
          .eq("user_id", targetUserId)
          .eq("role", "admin");
        if (error) throw error;
      }

      await adminClient.from("audit_logs").insert({
        function_name: "admin-users",
        user_id: authData.user.id,
        ip: clientIp(req),
        metadata: {
          action: makeAdmin ? "promote_admin" : "remove_admin",
          actor_email: actorEmail || null,
          target_user_id: targetUserId,
          target_email: targetEmail,
          result: "success",
        },
      });

      return json({ success: true });
    }

    return json({ error: "Invalid action" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("admin-users error", error);
    return json({ error: message }, 500);
  }
});
