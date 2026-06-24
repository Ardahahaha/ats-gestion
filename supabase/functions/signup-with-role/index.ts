// Admin-only: create a new user account and assign a role.
// No more hardcoded role passwords. Caller MUST be an authenticated admin.
import { requireAdmin, corsHeaders } from "../_shared/admin-auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.res;
  const { admin } = guard;

  try {
    const { email, password, role, pseudo } = await req.json();

    if (!email || !password || !role || !pseudo) {
      return new Response(JSON.stringify({ error: "Champs manquants" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!["admin", "technicien"].includes(role)) {
      return new Response(JSON.stringify({ error: "Rôle invalide" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (String(password).length < 8) {
      return new Response(JSON.stringify({ error: "Mot de passe trop court (min. 8)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existingPseudo } = await admin
      .from("profiles").select("id").eq("pseudo", String(pseudo).trim()).maybeSingle();
    if (existingPseudo) {
      return new Response(JSON.stringify({ error: "Ce pseudo est déjà pris" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
    });
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: authError?.message || "Création utilisateur échouée" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: roleError } = await admin
      .from("user_roles").insert({ user_id: authData.user.id, role });
    if (roleError) {
      return new Response(JSON.stringify({ error: roleError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: profileError } = await admin
      .from("profiles").insert({ user_id: authData.user.id, pseudo: String(pseudo).trim() });
    if (profileError) {
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, user_id: authData.user.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
