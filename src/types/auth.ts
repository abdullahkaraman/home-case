// types/auth.ts
export interface TokenResponse {
  ApiStatus: boolean
  ApiStatusCode: string
  ApiStatusMessage: string
  Data: {
    AccessToken: string
    RefreshToken: string
    TokenType: string
    ExpiresAt: string
  }
}

export interface LoginCredentials {
  Email: string
  Password: string
  GrantType: string
  Scope: string
  ClientId: string
  ClientSecret: string
  RedirectUri: string
}

export interface StoreInfo {
  storeId: string
  marketplaceName: string
}

export interface UserInfo {
  firstName?: string
  lastName?: string
  email?: string
  store?: StoreInfo[]
}

export interface UserInformationResponse {
  ApiStatus: boolean
  ApiStatusCode: string
  ApiStatusMessage: string
  Data: {
    token: string
    user: UserInfo
  }
}

export interface UserInformationCredentials {
  email: string
}
