export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest extends LoginRequest {
  name: string;
}
