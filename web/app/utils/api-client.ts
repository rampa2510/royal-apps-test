type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const BASE_URL = `${process.env.API_URL}/api/v2`;

export async function apiRequest<T>(
	endpoint: string,
	method: RequestMethod = 'GET',
	data?: unknown
): Promise<T> {
	const url = `${BASE_URL}${endpoint}`;
	const accessToken = localStorage.getItem('accessToken');

	const headers: HeadersInit = {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	};

	if (accessToken) {
		headers.Authorization = `Bearer ${accessToken}`;
	}

	const config: RequestInit = {
		method,
		headers,
		body: data ? JSON.stringify(data) : undefined,
	};

	try {
		const response = await fetch(url, config);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = await response.json();
		return result as T;
	} catch (error) {
		console.error('API request failed:', error);
		throw error;
	}
}
