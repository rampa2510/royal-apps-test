export interface Book {
  id: number;
  author: {
    id: number;
  };
  title: string;
  release_date?: string;
  description?: string;
  isbn?: string;
  format?: string;
  number_of_pages?: number;
}

export interface BookCreate {
  author: {
    id: number;
  };
  title: string;
  release_date?: string;
  description?: string;
  isbn?: string;
  format?: string;
  number_of_pages?: number;
}

export interface BookQueryParams {
  query?: string;
  orderBy: string;
  direction: string;
  limit: number;
  page: number;
}

export interface BookResponse {
  items: Book[];
  total_results: number;
  total_pages: number;
  current_page: number;
  limit: number;
  offset: number;
  order_by: string;
  direction: string;
}
