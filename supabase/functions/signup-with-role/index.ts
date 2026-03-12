import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const ROLE_PASSWORDS: Record<string, string> = {
  admin: "MoteurPneu33!",
  technicien: "RS3sport33!",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { email, password, role, rolePassword, pseudo } = await req.json();

    if (!email || !password || !role || !rolePassword || !pseudo) {
      return new Response(JSON.stringify({ error: "Champs manquants" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    if (!ROLE_PASSWORDS[role]) {
      return new Response(JSON.stringify({ error: "Rôle invalide" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    if (ROLE_PASSWORDS[role] !== rolePassword) {
      return new Response(JSON.stringify({ error: "Mot de passe du rôle incorrect" }), {
        status: 403,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check pseudo uniqueness
    const { data: existingPseudo } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("pseudo", pseudo.trim())
      .maybeSingle();

    if (existingPseudo) {
      return new Response(JSON.stringify({ error: "Ce pseudo est déjà pris" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Create user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Assign role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: authData.user.id, role });

    if (roleError) {
      return new Response(JSON.stringify({ error: roleError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Create profile with pseudo
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({ user_id: authData.user.id, pseudo: pseudo.trim() });

    if (profileError) {
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
