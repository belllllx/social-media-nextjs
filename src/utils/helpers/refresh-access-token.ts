import { ICommonResponse, IToken } from "../types";

export async function refreshAccessToken(token?: string | null) {
  if (!token) {
    return false;
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
      {
        method: "POST",
        headers: {
          Cookie: `refresh_token=${token}`,
        },
      }
    );
    if (!res.ok) {
      return false;
    }

    const data = (await res.json()) as ICommonResponse;
    if (!data.success) {
      return false;
    }

    return data.data as unknown as IToken;
  } catch (error) {
    console.error("Failed to refresh access token", error);
    return false;
  }
}
