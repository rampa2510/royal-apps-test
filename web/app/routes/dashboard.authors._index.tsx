import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  useLoaderData,
  useSearchParams,
  useSubmit,
  useNavigate,
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
} from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import { useCallback, useState, useEffect } from "react";
import type { AuthorResponse, AuthorQueryParams } from "~/types/author";
import { getAuthors } from "~/services/author.service";
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

  const params: AuthorQueryParams = {
    query,
    orderBy,
    direction,
    limit,
    page,
  };

  try {
    const authors = await getAuthors(params, accessToken);
    return json({ authors, params, success: true });
  } catch (error) {
    console.error("Failed to fetch authors:", error);
    return json({
      authors: {
        items: [],
        total_results: 0,
        total_pages: 0,
        current_page: 1,
        limit: 12,
        offset: 0,
        order_by: orderBy,
        direction,
      },
      params,
      success: false,
    });
  }
}

export default function AuthorsPage() {
  const { authors, params, success } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState(params.query || "");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(
    params.query || ""
  );

  // Format authors for IndexTable
  const formattedAuthors = authors.items.map((author) => ({
    id: author.id.toString(),
    firstName: author.first_name,
    lastName: author.last_name,
    birthday: formatDate(author.birthday),
    gender: author.gender,
    placeOfBirth: author.place_of_birth,
  }));

  const resourceName = {
    singular: "author",
    plural: "authors",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(formattedAuthors);

  // Sort options
  const sortOptions = [
    { label: "ID", value: "id" },
    { label: "Birthday", value: "birthday" },
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

  // Handle row click
  const handleRowClick = (id: string) => {
    navigate(`/dashboard/authors/${id}`);
  };

  return (
    <Page title="Authors">
      <BlockStack>
        {!success && (
          <Card>
            <div className="p-4">
              <Text variant="bodyLg" as="p" tone="critical">
                Failed to fetch authors
              </Text>
            </div>
          </Card>
        )}

        <Card>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <InlineStack align="start" gap="1000">
                <div style={{ width: "240px" }}>
                  <TextField
                    label="Search"
                    labelHidden
                    value={searchValue}
                    onChange={handleSearchChange}
                    placeholder="Search authors..."
                    prefix={<SearchIcon />}
                    autoComplete="off"
                  />
                </div>
                <Button onClick={handleSearch}>Search</Button>
              </InlineStack>

              <InlineStack align="end" gap="1000">
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

            {formattedAuthors.length > 0 ? (
              <IndexTable
                resourceName={resourceName}
                itemCount={formattedAuthors.length}
                selectedItemsCount={
                  allResourcesSelected ? "All" : selectedResources.length
                }
                onSelectionChange={handleSelectionChange}
                selectable={false}
                headings={[
                  { title: "ID" },
                  { title: "First Name" },
                  { title: "Last Name" },
                  { title: "Birthday" },
                  { title: "Gender" },
                  { title: "Place of Birth" },
                ]}
                hasZebraStriping
              >
                {formattedAuthors.map((author, index) => (
                  <IndexTable.Row
                    id={author.id}
                    key={author.id}
                    position={index}
                    onClick={() => handleRowClick(author.id)}
                  >
                    <IndexTable.Cell>
                      <Text variant="bodyMd" as="span">
                        {author.id}
                      </Text>
                    </IndexTable.Cell>
                    <IndexTable.Cell>{author.firstName}</IndexTable.Cell>
                    <IndexTable.Cell>{author.lastName}</IndexTable.Cell>
                    <IndexTable.Cell>{author.birthday}</IndexTable.Cell>
                    <IndexTable.Cell>{author.gender}</IndexTable.Cell>
                    <IndexTable.Cell>{author.placeOfBirth}</IndexTable.Cell>
                  </IndexTable.Row>
                ))}
              </IndexTable>
            ) : (
              <div className="py-12">
                <EmptyState heading="No authors found" image="">
                  <p>Try adjusting your search or filters.</p>
                </EmptyState>
              </div>
            )}

            {authors.total_pages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <Text as="p" variant="bodyMd">
                  Showing {authors.items.length} of {authors.total_results}{" "}
                  authors
                </Text>
                <Pagination
                  hasPrevious={authors.current_page > 1}
                  onPrevious={() => handlePageChange(authors.current_page - 1)}
                  hasNext={authors.current_page < authors.total_pages}
                  onNext={() => handlePageChange(authors.current_page + 1)}
                />
              </div>
            )}
          </div>
        </Card>
      </BlockStack>
    </Page>
  );
}
