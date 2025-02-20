export interface User {
	id: string;
	email: string;
	name: string;
	createdAt: number;
}

export interface Session {
	userId: string;
	expires: number;
}

export interface Env {
	MY_KV: KVNamespace;
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
	WORKER_ORIGIN?: string;
}

export interface TokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token?: string;
	id_token?: string;
}

export interface GoogleUserInfo {
	sub: string;
	email: string;
	name: string;
	email_verified?: boolean;
}
