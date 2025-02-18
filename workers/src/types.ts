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
