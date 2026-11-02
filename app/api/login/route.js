
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

const COOKIE_NAME = "dacheng_session";

export async function POST(request) {
  try {
    const { password } = await request.json();

    const expected = process.env.TEAM_PASSWORD;
    const secret = process.env.SESSION_SECRET;

    if (!expected || !secret) {
      return NextResponse.json(
        { error: "服务器尚未配置密码" },
        { status: 503 }
      );
    }

    const a = Buffer.from(String(password ?? ""));
    const b = Buffer.from(expected);

    if (
      a.length !== b.length ||
      !timingSafeEqual(a, b)
    ) {
      return NextResponse.json(
        { error: "密码错误" },
        { status: 401 }
      );
    }

    const expires = Date.now() + 8 * 60 * 60 * 1000;
    const payload = String(expires);

    const signature = createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    const response = NextResponse.json({ ok: true });

    response.cookies.set(
      COOKIE_NAME,
      `${payload}.${signature}`,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 8 * 60 * 60
      }
    );

    return response;
  } catch {
    return NextResponse.json(
      { error: "请求格式错误" },
      { status: 400 }
    );
  }
}
