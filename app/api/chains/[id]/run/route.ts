import { NextResponse } from "next/server";
import { getSuperadminSession } from "@/lib/auth";
import { getChain } from "@/lib/data";
import { runChain } from "@/lib/runner";

export const runtime = "nodejs";

export async function POST(request: Request, context: RouteContext<"/api/chains/[id]/run">) {
  const session = await getSuperadminSession();
  if (!session.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (!session.isSuperadmin) return NextResponse.json({ error: "Superadmin access required." }, { status: 403 });
  const { id } = await context.params;
  const chain = await getChain(id);
  if (!chain) return NextResponse.json({ error: "Chain not found." }, { status: 404 });
  const form = await request.formData();
  const text = String(form.get("text") ?? "").trim().slice(0, 20000);
  const value = form.get("image");
  const file = value instanceof File && value.size > 0 ? value : null;
  if (file && (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024)) {
    return NextResponse.json({ error: "Upload a JPG, PNG, WebP, or GIF up to 10 MB." }, { status: 400 });
  }
  if ((chain.input_type === "text" || chain.input_type === "text_and_image") && !text) {
    return NextResponse.json({ error: "This chain requires text input." }, { status: 400 });
  }
  if ((chain.input_type === "image" || chain.input_type === "text_and_image") && !file) {
    return NextResponse.json({ error: "This chain requires an image." }, { status: 400 });
  }
  try {
    const runId = await runChain({ chain, userId: session.user.id, text, file });
    return NextResponse.json({ runId });
  } catch (error) {
    const runId = typeof error === "object" && error && "runId" in error ? String(error.runId) : undefined;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Chain execution failed.", runId }, { status: 500 });
  }
}
