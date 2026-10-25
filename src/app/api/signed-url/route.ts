import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");
  const bucket = request.nextUrl.searchParams.get("bucket") ?? "products";

  if (!path) {
    return NextResponse.json({ error: "path required" }, { status: 400 });
  }

  // Already a full URL (legacy / external)
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return NextResponse.redirect(path);
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60);

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { error: error?.message ?? "signed url failed" },
        { status: 404 }
      );
    }

    return NextResponse.redirect(data.signedUrl);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "error" },
      { status: 500 }
    );
  }
}
