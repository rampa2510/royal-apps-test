import { redirect } from '@remix-run/node';
import { getUserId } from './session.server';

export async function requireAuth(request: Request) {
	const userId = await getUserId(request);
	if (!userId) {
		throw redirect('/login');
	}
	return userId;
}

export async function checkAuth(request: Request) {
	const userId = await getUserId(request);
	if (userId) {
		throw redirect('/dashboard');
	}
	return null;
}
