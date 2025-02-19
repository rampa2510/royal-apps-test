import { User } from "~/types/user";
import { getServerApiClient } from "../utils/api-server";

export async function getCurrentUser(accessToken: string): Promise<User> {
  const apiClient = getServerApiClient(accessToken);
  const url = `/me`;
  return await apiClient.get<User>(url);
}

export async function updateUser(id: string, userData: Partial<User>, accessToken: string): Promise<User> {
  const apiClient = getServerApiClient(accessToken);
  const url = `/users/${id}`;
  return await apiClient.put<User>(url, userData);
}
