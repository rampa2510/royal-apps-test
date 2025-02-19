import type { AuthorResponse, AuthorQueryParams, Author } from "~/types/author";
import { getServerApiClient } from "../utils/api-server";

export async function getAuthors(
  params: AuthorQueryParams,
  accessToken: string
): Promise<AuthorResponse> {
  const apiClient = getServerApiClient(accessToken);

  const queryParams = new URLSearchParams();
  if (params.query) queryParams.append("query", params.query);
  queryParams.append("orderBy", params.orderBy);
  queryParams.append("direction", params.direction);
  queryParams.append("limit", params.limit.toString());
  queryParams.append("page", params.page.toString());

  const url = `/authors?${queryParams.toString()}`;
  return await apiClient.get<AuthorResponse>(url);
}

export async function getAuthor(
  id: string,
  accessToken: string
): Promise<Author> {
  const apiClient = getServerApiClient(accessToken);
  const url = `/authors/${id}`;
  return await apiClient.get<Author>(url);
}
