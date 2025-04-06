import { KVNamespace } from '@cloudflare/workers-types'

export type User = {
  id: string
  email: string
  name: string
  createdAt: number
}

export type Session = {
  userId: string
  email: string
  name: string
  expiresAt: number
}

export type Env = {
  MY_KV: KVNamespace
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
}

export type TokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  id_token?: string
}

export type GoogleUserInfo = {
  sub: string
  email: string
  name: string
  email_verified?: boolean
}
