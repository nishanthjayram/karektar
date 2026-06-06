export type Session = {
  userId: string
  email: string
  name: string
  expiresAt: number
}

type JsonKvValue = string | ArrayBuffer | ArrayBufferView | ReadableStream

type KvPutOptions = {
  expirationTtl?: number
}

export type KVNamespace = {
  get<TValue = string>(
    key: string,
    type?: 'text' | 'json' | 'arrayBuffer' | 'stream',
  ): Promise<TValue | null>
  put(key: string, value: JsonKvValue, options?: KvPutOptions): Promise<void>
  delete(key: string): Promise<void>
}

export type Env = {
  MY_KV: KVNamespace
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
}

export type PagesFunctionContext = {
  request: Request
  env: Env
}

export type TokenResponse = Record<'access_token', string>

type GoogleUserInfoBase = {
  sub: string
  email: string
  name: string
}

export type GoogleUserInfo = GoogleUserInfoBase &
  Partial<Record<'email_verified', boolean>>

export type OAuthState = {
  uiOrigin: string
  stateToken: string
}
