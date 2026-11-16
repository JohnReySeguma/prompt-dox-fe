import type { AuthSession, User as ApiUser } from "@/types";

declare module "next-auth" {
  interface User {
    /** Set by the credentials-style providers; read once by the `jwt` callback. */
    backend?: AuthSession;
  }

  interface Session {
    user: ApiUser & { image?: string | null };
    accessToken?: string;
    /** Epoch milliseconds. */
    accessTokenExpires?: number;
    /** `RefreshFailed` means the client must sign out. */
    error?: "RefreshFailed";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    /** Epoch milliseconds. */
    accessTokenExpires?: number;
    user?: ApiUser;
    error?: "RefreshFailed";
  }
}
