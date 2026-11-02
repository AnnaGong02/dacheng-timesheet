
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get("dacheng_session")?.value;
  const secret = process.env.SESSION_SECRET;

  if (!token || !secret) return false;

  const dot = token.indexOf(".");
  if (dot <= 0) return false;

  const expiresText = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  if (!/^\d{13}$/.test(expiresText)) return false;
  if (!/^[a-f0-9]{64}$/.test(signature)) return false;

  const expires = Number(expiresText);

  if (!Number.isSafeInteger(expires)) return false;
  if (Date.now() >= expires) return false;

  const expected = createHmac("sha256", secret)
    .update(expiresText)
    .digest("hex");

  const actualBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  return timingSafeEqual(actualBuffer, expectedBuffer);
}
