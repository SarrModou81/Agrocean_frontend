import { User } from "./user.model";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string;
  type_role: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
}

export { User };
