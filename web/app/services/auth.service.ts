import { AuthResponse, LoginCredentials } from "~/types/auth";

const API_URL = process.env.API_URL;

export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  try {
    const url = `${API_URL}/api/v2/token`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`Login failed with status: ${response.status}`);
    }

    return (await response.json()) as AuthResponse;
  } catch (error) {
    console.error("Server login failed:", error);
    throw error;
  }
}
