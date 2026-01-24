export interface IAuthUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
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
}

export interface IAuthData {
  user: IAuthUser;
  token: IAuthToken;
}
