import { apiRequest } from '~/utils/api-client';

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface User {
	id: number;
	email: string;
	first_name: string;
	last_name: string;
	gender: string;
	active: boolean;
	email_confirmed: boolean;
	created_at: string;
	updated_at: string;
}

export interface AuthResponse {
	token_key: string;
	refresh_token_key: string;
	user: User;
	expires_at: string;
	refresh_expires_at: string;
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
	try {
		const response = await apiRequest<AuthResponse>('/token', 'POST', credentials);
		return response;
	} catch (error) {
		console.error('Login failed:', error);
		throw error;
	}
}

// Client-side only functions
export const clientStorage = {
	setAuth: (response: AuthResponse) => {
		if (typeof window === 'undefined') return;

		localStorage.setItem('accessToken', response.token_key);
		localStorage.setItem('refreshToken', response.refresh_token_key);
		localStorage.setItem('expiresAt', response.expires_at);
		localStorage.setItem('user', JSON.stringify(response.user));
	},

	getUser: (): User | null => {
		if (typeof window === 'undefined') return null;

		const userStr = localStorage.getItem('user');
		return userStr ? JSON.parse(userStr) : null;
	},

	clearAuth: () => {
		if (typeof window === 'undefined') return;

		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		localStorage.removeItem('expiresAt');
		localStorage.removeItem('user');
	}
};
