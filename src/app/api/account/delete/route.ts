import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    console.error("Failed to delete user", user.id, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Clear the current session cookies on the client.
  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
