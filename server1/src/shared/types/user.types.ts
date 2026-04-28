export interface UserDTO {
  id: number;
  email: string;
  name: string;
  workspacePath?: string | null;
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface JwtPayload {
  userId: number;
  email: string;
  jti: string;  // unique token id — used for blacklisting
  iat: number;
  exp: number;
}

