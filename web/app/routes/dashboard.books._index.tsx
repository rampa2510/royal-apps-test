import { json } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import {
  useLoaderData,
  useSearchParams,
  useSubmit,
  useNavigate,
  Form,
} from "@remix-run/react";
import {
  Card,
  Page,
  TextField,
  Button,
  Select,
  Pagination,
  EmptyState,
  Text,
  BlockStack,
  InlineStack,
  IndexTable,
  useIndexResourceState,
  Badge,
  ButtonGroup,
  Box,
  Modal,
  Banner,
} from "@shopify/polaris";
import {
  SearchIcon,
  DeleteIcon,
  EditIcon,
  PlusIcon,
} from "@shopify/polaris-icons";
import { useCallback, useState, useEffect } from "react";
import type { BookResponse, BookQueryParams } from "~/types/book";
import { getBooks, deleteBook } from "~/services/book.service";
import { getAccessToken } from "~/utils/session.server";
import { formatDate } from "~/utils/date-formatter";

export async function loader({ request }: LoaderFunctionArgs) {
  const accessToken = await getAccessToken(request);
  if (!accessToken) {
    throw new Error("Authentication required");
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("query") || undefined;
  const orderBy = url.searchParams.get("orderBy") || "id";
  const direction = url.searchParams.get("direction") || "ASC";
  const limit = parseInt(url.searchParams.get("limit") || "12");
  const page = parseInt(url.searchParams.get("page") || "1");
  const created = url.searchParams.get("created") || false;
  const edited = url.searchParams.get("edited") === "true";

  const params: BookQueryParams = {
    query,
    orderBy,
    direction,
    limit,
    page,
  };

  try {
    const books = await getBooks(params, accessToken);
    return json({
      books,
      params,
      success: true,
      deleteSuccess: url.searchParams.get("deleteSuccess") === "true",
      deleteError: url.searchParams.get("deleteError"),
      error: false,
      created,
      edited,
    });
  } catch (error) {
    console.error("Failed to fetch books:", error);
    return json({
      books: {
        items: [],
        total_results: 0,
        total_pages: 0,
        current_page: 1,
        limit: 12,
        offset: 0,
        order_by: orderBy,
        direction,
        edited: false,
      },
      params,
      success: false,
      error: "Failed to load books",
      deleteSuccess: false,
      deleteError: true,
      created: false,
      edited: false,
    });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const accessToken = await getAccessToken(request);
    if (!accessToken) {
      throw new Error("Authentication required");
    }

    const bookId = formData.get("bookId") as string;
    if (!bookId) {
      return json({ success: false, error: "Book ID is required" });
    }

    try {
      await deleteBook(bookId, accessToken);
      return json({ success: true });
    } catch (error) {
      console.error(`Failed to delete book ${bookId}:`, error);
      return json({
        success: false,
        error: "Failed to delete book.",
      });
    }
  }

  return json({ success: false, error: "Invalid action" });
}

export default function BooksPage() {
  const {
    books,
    params,
    success,
    error,
    deleteSuccess,
    deleteError,
    created,
    edited,
  } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState(params.query || "");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(
    params.query || ""
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Format books for IndexTable
  const formattedBooks = books.items.map((book) => ({
    id: book?.id.toString(),
    title: book?.title,
    releaseDate: book?.release_date ? formatDate(book.release_date) : "Unknown",
    description: book?.description || "No description",
    authorId: book?.author?.id,
    isbn: book?.isbn || "N/A",
    format: book?.format || "N/A",
    pages: book?.number_of_pages ? book.number_of_pages.toString() : "N/A",
  }));

  const resourceName = {
    singular: "book",
    plural: "books",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(formattedBooks);

  // Sort options
  const sortOptions = [
    { label: "ID", value: "id" },
    { label: "Title", value: "title" },
  ];

  const directionOptions = [
    { label: "Ascending", value: "ASC" },
    { label: "Descending", value: "DESC" },
  ];

  const limitOptions = [
    { label: "6 per page", value: "6" },
    { label: "12 per page", value: "12" },
    { label: "24 per page", value: "24" },
    { label: "48 per page", value: "48" },
  ];

  // Handle search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearchValue !== params.query) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [debouncedSearchValue]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    setDebouncedSearchValue(value);
  }, []);

  const handleSearch = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    if (searchValue) {
      newParams.set("query", searchValue);
    } else {
      newParams.delete("query");
    }
    newParams.set("page", "1"); // Reset to first page on new search
    setSearchParams(newParams);

    const formData = new FormData();
    if (searchValue) formData.append("query", searchValue);
    formData.append("orderBy", newParams.get("orderBy") || "id");
    formData.append("direction", newParams.get("direction") || "ASC");
    formData.append("limit", newParams.get("limit") || "12");
    formData.append("page", "1");
    submit(formData, { method: "get" });
  }, [searchValue, searchParams, submit, setSearchParams]);

  const handleSortChange = useCallback(
    (value: string) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("orderBy", value);
      setSearchParams(newParams);

      const formData = new FormData();
      if (searchParams.get("query"))
        formData.append("query", searchParams.get("query") || "");
      formData.append("orderBy", value);
      formData.append("direction", searchParams.get("direction") || "ASC");
      formData.append("limit", searchParams.get("limit") || "12");
      formData.append("page", searchParams.get("page") || "1");
      submit(formData, { method: "get" });
    },
    [searchParams, submit, setSearchParams]
  );

  const handleDirectionChange = useCallback(
    (value: string) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("direction", value);
      setSearchParams(newParams);

      const formData = new FormData();
      if (searchParams.get("query"))
        formData.append("query", searchParams.get("query") || "");
      formData.append("orderBy", searchParams.get("orderBy") || "id");
      formData.append("direction", value);
      formData.append("limit", searchParams.get("limit") || "12");
      formData.append("page", searchParams.get("page") || "1");
      submit(formData, { method: "get" });
    },
    [searchParams, submit, setSearchParams]
  );

  const handleLimitChange = useCallback(
    (value: string) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("limit", value);
      newParams.set("page", "1"); // Reset to first page when changing limit
      setSearchParams(newParams);

      const formData = new FormData();
      if (searchParams.get("query"))
        formData.append("query", searchParams.get("query") || "");
      formData.append("orderBy", searchParams.get("orderBy") || "id");
      formData.append("direction", searchParams.get("direction") || "ASC");
      formData.append("limit", value);
      formData.append("page", "1");
      submit(formData, { method: "get" });
    },
    [searchParams, submit, setSearchParams]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", newPage.toString());
      setSearchParams(newParams);

      const formData = new FormData();
      if (searchParams.get("query"))
        formData.append("query", searchParams.get("query") || "");
      formData.append("orderBy", searchParams.get("orderBy") || "id");
      formData.append("direction", searchParams.get("direction") || "ASC");
      formData.append("limit", searchParams.get("limit") || "12");
      formData.append("page", newPage.toString());
      submit(formData, { method: "get" });
    },
    [searchParams, submit, setSearchParams]
  );

  // Handle row actions
  const handleEditClick = useCallback(
    (id: string) => {
      navigate(`/dashboard/books/${id}/edit`);
    },
    [navigate]
  );

  const handleDeleteClick = useCallback((id: string, title: string) => {
    setBookToDelete({ id, title });
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!bookToDelete) return;

    const formData = new FormData();
    formData.append("intent", "delete");
    formData.append("bookId", bookToDelete.id);

    submit(formData, { method: "post" });

    // Close modal
    setShowDeleteModal(false);
    setBookToDelete(null);

    // Update URL params to show success message after the action completes
    const newParams = new URLSearchParams(searchParams);
    newParams.set("deleteSuccess", "true");
    newParams.set("log", "deleteBook");
    setSearchParams(newParams);
  }, [bookToDelete, submit, searchParams, setSearchParams]);

  const handleCloseModal = useCallback(() => {
    setShowDeleteModal(false);
    setBookToDelete(null);
  }, []);

  return (
    <Page
      title="Books"
      primaryAction={{
        content: "Add book",
        icon: PlusIcon,
        url: "/dashboard/books/new",
      }}
    >
      <BlockStack gap="500">
        {edited && (
          <Banner
            tone="success"
            onDismiss={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.delete("edited");
              setSearchParams(newParams);
            }}
          >
            Book updated successfully.
          </Banner>
        )}

        {created && (
          <Banner
            tone="success"
            onDismiss={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.delete("created");
              setSearchParams(newParams);
            }}
          >
            Book created successfully.
          </Banner>
        )}

        {deleteSuccess && (
          <Banner
            tone="success"
            onDismiss={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.delete("deleteSuccess");
              setSearchParams(newParams);
            }}
          >
            Book deleted successfully.
          </Banner>
        )}

        {deleteError && (
          <Banner
            tone="critical"
            onDismiss={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.delete("deleteError");
              setSearchParams(newParams);
            }}
          >
            {deleteError}
          </Banner>
        )}

        {!success && (
          <Banner tone="critical">
            <p>{error || "Failed to load books"}</p>
          </Banner>
        )}

        <Card>
          <div className="p-4">
            <BlockStack gap="500">
              {/* Search and filters */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <InlineStack align="start" gap="500">
                  <div style={{ width: "240px" }}>
                    <TextField
                      label="Search"
                      labelHidden
                      value={searchValue}
                      onChange={handleSearchChange}
                      placeholder="Search books..."
                      prefix={<SearchIcon />}
                      autoComplete="off"
                    />
                  </div>
                  <Button onClick={handleSearch}>Search</Button>
                </InlineStack>

                <InlineStack align="end" gap="300">
                  <Select
                    label="Sort by"
                    options={sortOptions}
                    value={params.orderBy}
                    onChange={handleSortChange}
                  />
                  <Select
                    label="Direction"
                    options={directionOptions}
                    value={params.direction}
                    onChange={handleDirectionChange}
                  />
                  <Select
                    label="Show"
                    options={limitOptions}
                    value={params.limit.toString()}
                    onChange={handleLimitChange}
                  />
                </InlineStack>
              </div>

              {/* Books table */}
              {formattedBooks.length > 0 ? (
                <IndexTable
                  resourceName={resourceName}
                  itemCount={formattedBooks.length}
                  selectedItemsCount={
                    allResourcesSelected ? "All" : selectedResources.length
                  }
                  onSelectionChange={handleSelectionChange}
                  selectable={false}
                  headings={[
                    { title: "Title" },
                    { title: "Release Date" },
                    { title: "ISBN" },
                    { title: "Format" },
                    { title: "Pages" },
                    { title: "Actions" },
                  ]}
                  hasZebraStriping
                >
                  {formattedBooks.map((book, index) => (
                    <IndexTable.Row
                      id={book.id!}
                      key={book.id}
                      position={index}
                    >
                      <IndexTable.Cell>
                        <Text variant="bodyMd" fontWeight="bold" as="span">
                          {book.title}
                        </Text>
                        <div className="mt-1">
                          <Text variant="bodySm" as="span" tone="subdued">
                            {book.description.length > 50
                              ? `${book.description.substring(0, 50)}...`
                              : book.description}
                          </Text>
                        </div>
                      </IndexTable.Cell>
                      <IndexTable.Cell>{book.releaseDate}</IndexTable.Cell>
                      <IndexTable.Cell>{book.isbn}</IndexTable.Cell>
                      <IndexTable.Cell>{book.format}</IndexTable.Cell>
                      <IndexTable.Cell>{book.pages}</IndexTable.Cell>
                      <IndexTable.Cell>
                        <ButtonGroup>
                          <Button
                            icon={EditIcon}
                            onClick={() => handleEditClick(book.id!)}
                            accessibilityLabel={`Edit book ${book.title}`}
                          />
                          <Button
                            icon={DeleteIcon}
                            tone="critical"
                            onClick={() =>
                              handleDeleteClick(book.id!, book.title!)
                            }
                            accessibilityLabel={`Delete book ${book.title}`}
                          />
                        </ButtonGroup>
                      </IndexTable.Cell>
                    </IndexTable.Row>
                  ))}
                </IndexTable>
              ) : (
                <EmptyState
                  heading="No books found"
                  image=""
                  action={{
                    content: "Add book",
                    url: "/dashboard/books/new",
                  }}
                >
                  <p>
                    Try adjusting your search or filters, or add a new book.
                  </p>
                </EmptyState>
              )}

              {/* Pagination */}
              {books.total_pages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <Text as="p" variant="bodyMd">
                    Showing {books.items.length} of {books.total_results} books
                  </Text>
                  <Pagination
                    hasPrevious={books.current_page > 1}
                    onPrevious={() => handlePageChange(books.current_page - 1)}
                    hasNext={books.current_page < books.total_pages}
                    onNext={() => handlePageChange(books.current_page + 1)}
                  />
                </div>
              )}
            </BlockStack>
          </div>
        </Card>
      </BlockStack>

      {/* Delete confirmation modal */}
      <Modal
        open={showDeleteModal}
        onClose={handleCloseModal}
        title="Delete book"
        primaryAction={{
          content: "Delete",
          destructive: true,
          onAction: handleDeleteConfirm,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: handleCloseModal,
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <Text as="p">
              Are you sure you want to delete "{bookToDelete?.title}"? This
              action cannot be undone.
            </Text>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
