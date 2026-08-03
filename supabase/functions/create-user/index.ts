import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ALLOWED_ROLES = [
  "director",
  "head_of_studies",
  "head_of_discipline",
  "teacher",
  "economist",
  "storekeeper",
  "nurse",
  "parent",
  "student",
];

const MANAGER_ROLES = ["director", "head_of_studies"];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse("Missing authorization header", 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData.user) {
      return errorResponse("Unauthorized", 401);
    }

    // Check the caller's role
    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (!callerProfile || !MANAGER_ROLES.includes(callerProfile.role)) {
      return errorResponse("Permission denied: only directors and heads of studies can create users", 403);
    }

    const body = await req.json();
    const { email, fullName, role } = body;

    if (!email || !fullName) {
      return errorResponse("Email and full name are required", 400);
    }

    const userRole = role || "student";
    if (!ALLOWED_ROLES.includes(userRole)) {
      return errorResponse(`Invalid role: ${userRole}`, 400);
    }

    // Create the auth user with a random password (user will use password reset)
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: userRole },
    });

    if (createError) {
      return errorResponse(createError.message, 400);
    }

    // Upsert the profile row
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: newUser.user.id,
      email,
      full_name: fullName,
      role: userRole,
      email_verified: true,
    });

    if (profileError) {
      return errorResponse(`User created but profile failed: ${profileError.message}`, 500);
    }

    return new Response(
      JSON.stringify({ id: newUser.user.id, email, full_name: fullName, role: userRole }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return errorResponse(err.message, 500);
  }
});

function errorResponse(message: string, status: number) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
