export type TUserRole = "admin" | "creator" | "player";
export type TAuthProvider = "local" | "google";

export interface IAuthData {
  token: IAuthToken;
  user: IAuthUser;
}

export interface IGoogleAuthResponse {
  clientId: string;
  client_id: string;
  credential: string;
  select_by: string;
}

export interface IAuthToken {
  access_token: string;
  access_token_expires_at: string;
  refresh_token: string;
  refresh_token_expires_at: string;
  token_type: "bearer";
}

export interface IAuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  bio?: string | null;
  avatar_url?: string | null;
  role: TUserRole;
  provider: TAuthProvider;
  is_email_verified: boolean;
  subscribed_channels: Record<string, "full_access" | "limited">;
}
