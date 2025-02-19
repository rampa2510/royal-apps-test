export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  gender: string;
  active: boolean;
  login_token: string | null;
  password_reset_token: string | null;
  email_confirmed: boolean;
  google_id?: string;
}
