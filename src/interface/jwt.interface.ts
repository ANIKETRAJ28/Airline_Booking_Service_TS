export interface IJWT {
  id: string;
  email: string;
  user_role: 'user' | 'admin';
  iat: number;
  exp: number;
}
