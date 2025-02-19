import { Book, BookCreate, BookQueryParams, BookResponse } from "~/types/book";
import { getServerApiClient } from "../utils/api-server";

export async function deleteBook(
  id: string,
  accessToken: string
): Promise<void> {
  const apiClient = getServerApiClient(accessToken);
  const url = `/books/${id}`;
  return await apiClient.delete<void>(url);
}

export async function getBooks(
  params: BookQueryParams,
  accessToken: string
): Promise<BookResponse> {
  const apiClient = getServerApiClient(accessToken);

  const queryParams = new URLSearchParams();
  if (params.query) queryParams.append("query", params.query);
  queryParams.append("orderBy", params.orderBy);
  queryParams.append("direction", params.direction);
  queryParams.append("limit", params.limit.toString());
  queryParams.append("page", params.page.toString());

  const url = `/books?${queryParams.toString()}`;
  return await apiClient.get<BookResponse>(url);
}

export async function getBook(id: string, accessToken: string): Promise<Book> {
  const apiClient = getServerApiClient(accessToken);
  const url = `/books/${id}`;
  return await apiClient.get<Book>(url);
}

export async function createBook(
  book: BookCreate,
  accessToken: string
): Promise<Book> {
  const apiClient = getServerApiClient(accessToken);
  const url = `/books`;
  return await apiClient.post<Book>(url, book);
}

export async function updateBook(
  id: string,
  book: Partial<BookCreate>,
  accessToken: string
): Promise<Book> {
  const apiClient = getServerApiClient(accessToken);
  const url = `/books/${id}`;
  return await apiClient.put<Book>(url, book);
}
