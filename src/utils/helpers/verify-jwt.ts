import { jwtVerify, JWTPayload } from "jose";

export async function verifyJwt<T extends Record<string, any>>(
  token: string,
  secret: Uint8Array
): Promise<JWTPayload & T> {
  const { payload } = await jwtVerify(token, secret);
  return payload as JWTPayload & T;
}