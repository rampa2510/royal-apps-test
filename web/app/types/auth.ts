export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  gender: string;
  active: boolean;
  email_confirmed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token_key: string;
  refresh_token_key: string;
  user: User;
  expires_at: string;
  refresh_expires_at: string;
}
