import { getServerApiClient } from "../utils/api-server";

export async function deleteBook(
  id: string,
  accessToken: string
): Promise<void> {
  const apiClient = getServerApiClient(accessToken);
  const url = `/books/${id}`;
  return await apiClient.delete<void>(url);
}
