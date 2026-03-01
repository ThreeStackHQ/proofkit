export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const widgetPath = path.join(process.cwd(), "../../packages/widget/dist/widget.js");
  try {
    const content = readFileSync(widgetPath, "utf-8");
    return new NextResponse(content, {
      headers: {
        "Content-Type": "application/javascript",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Widget not built" }, { status: 503 });
  }
}
