import { Book } from "./book";

export interface Author {
  id: number;
  first_name: string;
  last_name: string;
  birthday: string;
  biography: string;
  gender: string;
  place_of_birth: string;
  books: Book[];
}

export interface AuthorResponse {
  total_results: number;
  total_pages: number;
  current_page: number;
  limit: number;
  offset: number;
  order_by: string;
  direction: string;
  items: Author[];
}

export interface AuthorQueryParams {
  query?: string;
  orderBy: string;
  direction: string;
  limit: number;
  page: number;
}
