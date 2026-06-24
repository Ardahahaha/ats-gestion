// Admin-only: delete a user by email (cascades profile + role).
import { requireAdmin, corsHeaders } from "../_shared/admin-auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.res;
  const { admin } = guard;

  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email manquant" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listErr) throw listErr;
    const user = list.users.find((u) => u.email?.toLowerCase() === String(email).toLowerCase());
    if (!user) {
      return new Response(JSON.stringify({ error: "Utilisateur introuvable" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin.from("profiles").delete().eq("user_id", user.id);
    await admin.from("user_roles").delete().eq("user_id", user.id);
    const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
    if (delErr) throw delErr;

    return new Response(JSON.stringify({ success: true, deleted: user.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
