import { createCookieSessionStorage, redirect } from "@remix-run/node";

const sessionSecret = process.env.SESSION_SECRET || "default-secret";

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: "RB_session",
		secure: process.env.NODE_ENV === "production",
		secrets: [sessionSecret],
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 30, // 30 days
		httpOnly: true,
	},
});

export async function createUserSession(
	userId: string,
	accessToken: string,
	redirectTo: string
) {
	const session = await sessionStorage.getSession();
	session.set("userId", userId);
	session.set("accessToken", accessToken);

	return redirect(redirectTo, {
		headers: {
			"Set-Cookie": await sessionStorage.commitSession(session),
		},
	});
}

export async function getUserSession(request: Request) {
	return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
	const session = await getUserSession(request);
	const userId = session.get("userId");
	if (!userId || typeof userId !== "string") return null;
	return userId;
}

export async function requireUserId(
	request: Request,
	redirectTo: string = new URL(request.url).pathname
) {
	const session = await getUserSession(request);
	const userId = session.get("userId");
	if (!userId || typeof userId !== "string") {
		const searchParams = new URLSearchParams([
			["redirectTo", redirectTo],
		]);
		throw redirect(`/login?${searchParams}`);
	}
	return userId;
}

export async function getAccessToken(request: Request) {
	const session = await getUserSession(request);
	return session.get("accessToken");
}

export async function logout(request: Request) {
	const session = await getUserSession(request);
	return redirect("/login", {
		headers: {
			"Set-Cookie": await sessionStorage.destroySession(session),
		},
	});
}
