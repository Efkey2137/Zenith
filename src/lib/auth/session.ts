import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_SECONDS = 60 * 60 * 12;
export function equalSecrets(a: string, b: string) {
  return timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
}
export function signSession(secret: string, now = Date.now()) {
  const expires = String(now + SESSION_SECONDS * 1000);
  return `${expires}.${createHmac("sha256", secret).update(`zenith-admin:${expires}`).digest("hex")}`;
}
export function verifySession(
  token: string | undefined,
  secret: string,
  now = Date.now(),
) {
  if (!token || secret.length < 24) return false;
  const [expires, signature, extra] = token.split(".");
  if (
    extra ||
    !/^\d+$/.test(expires) ||
    !/^[a-f0-9]{64}$/.test(signature ?? "")
  )
    return false;
  if (Number(expires) <= now || Number(expires) > now + SESSION_SECONDS * 1000)
    return false;
  const expected = createHmac("sha256", secret)
    .update(`zenith-admin:${expires}`)
    .digest("hex");
  return equalSecrets(signature, expected);
}
