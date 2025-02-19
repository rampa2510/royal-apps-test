import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import {
  Page,
  Card,
  FormLayout,
  TextField,
  Select,
  Button,
  Banner,
  DatePicker,
  BlockStack,
  InlineStack,
  Text,
  SkeletonBodyText,
} from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { updateBook, getBook } from "~/services/book.service";
import { getAuthors } from "~/services/author.service";
import { getAccessToken } from "~/utils/session.server";
import type { Book, BookCreate } from "~/types/book";
import type { AuthorResponse } from "~/types/author";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const accessToken = await getAccessToken(request);
  if (!accessToken) {
    throw new Error("Authentication required");
  }

  const bookId = params.id;
  if (!bookId) {
    throw new Error("Book ID is required");
  }

  try {
    // Load book data and authors for the dropdown in parallel
    const [book, authors] = await Promise.all([
      getBook(bookId, accessToken),
      getAuthors(
        {
          orderBy: "id",
          direction: "ASC",
          limit: 100,
          page: 1,
        },
        accessToken
      ),
    ]);

    return json({
      book,
      authors,
      success: true,
      error: null,
    });
  } catch (error) {
    console.error(`Failed to load book ${bookId} or authors:`, error);
    return json({
      book: null,
      authors: {
        items: [],
        total_results: 0,
        total_pages: 0,
        current_page: 1,
        limit: 100,
        offset: 0,
        order_by: "first_name",
        direction: "ASC",
      },
      success: false,
      error: "Failed to load book data or authors for selection",
    });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const accessToken = await getAccessToken(request);
  if (!accessToken) {
    throw new Error("Authentication required");
  }

  const bookId = params.id;
  if (!bookId) {
    return json({
      success: false,
      error: "Book ID is required",
      errors: { _form: "Book ID is require" },
    });
  }

  const formData = await request.formData();

  console.log("Form data received:", Object.fromEntries(formData));

  // Extract and validate data
  const authorId = formData.get("authorId") as string;
  const title = formData.get("title") as string;
  const releaseDate = formData.get("releaseDate") as string;
  const description = formData.get("description") as string;
  const isbn = formData.get("isbn") as string;
  const format = formData.get("format") as string;
  const numberOfPages = formData.get("numberOfPages") as string;

  const errors: Record<string, string> = {};

  if (!authorId) errors.authorId = "Author is required";
  if (!title) errors.title = "Title is required";

  // If there are validation errors, return them
  if (Object.keys(errors).length > 0) {
    return json({ errors, values: Object.fromEntries(formData) });
  }

  try {
    const bookData: Partial<BookCreate> = {
      author: {
        id: parseInt(authorId),
      },
      title,
      release_date: releaseDate || undefined,
      description: description || undefined,
      isbn: isbn || undefined,
      format: format || undefined,
      number_of_pages: numberOfPages ? parseInt(numberOfPages) : undefined,
    };

    console.log("Updating book data:", { bookId, bookData });

    const updatedBook = await updateBook(bookId, bookData, accessToken);

    // Redirect to the books list page with success message
    return redirect("/dashboard/books?edited=true&log=editBook");
  } catch (error) {
    console.error(`Failed to update book ${bookId}:`, error);
    return json({
      errors: {
        _form: "Failed to update book. Please try again.",
      },
      values: Object.fromEntries(formData),
    });
  }
}

export default function EditBookPage() {
  const { book, authors, success, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const isSubmitting = navigation.state === "submitting";
  const isLoading = navigation.state === "loading";

  // Form state
  const [title, setTitle] = useState<string>("");
  const [authorId, setAuthorId] = useState<string>("");
  const [releaseDate, setReleaseDate] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isbn, setIsbn] = useState<string>("");
  const [format, setFormat] = useState<string>("");
  const [numberOfPages, setNumberOfPages] = useState<string>("");

  // Initialize form with book data once loaded
  useEffect(() => {
    if (book) {
      setTitle(book.title || "");
      setAuthorId(book.author?.id?.toString() || "");
      setReleaseDate(book.release_date || "");
      setDescription(book.description || "");
      setIsbn(book.isbn || "");
      setFormat(book.format || "");
      setNumberOfPages(book.number_of_pages?.toString() || "");
    }
  }, [book]);

  // Date picker state
  const [{ month, year }, setDate] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Initialize date picker with book release date once loaded
  useEffect(() => {
    if (book?.release_date) {
      const date = new Date(book.release_date);
      setSelectedDate(date);
      setDate({
        month: date.getMonth(),
        year: date.getFullYear(),
      });
    }
  }, [book]);

  // Format author options for select dropdown
  const authorOptions = authors.items.map((author) => ({
    label: `${author!.first_name} ${author!.last_name}`,
    value: author!.id.toString(),
  }));

  // Format options for book format
  const formatOptions = [
    { label: "Hardcover", value: "Hardcover" },
    { label: "Paperback", value: "Paperback" },
    { label: "E-book", value: "E-book" },
    { label: "Audiobook", value: "Audiobook" },
    { label: "Other", value: "Other" },
  ];

  // Handlers
  const handleTitleChange = useCallback((value: string) => setTitle(value), []);
  const handleAuthorChange = useCallback(
    (value: string) => setAuthorId(value),
    []
  );
  const handleDescriptionChange = useCallback(
    (value: string) => setDescription(value),
    []
  );
  const handleIsbnChange = useCallback((value: string) => setIsbn(value), []);
  const handleFormatChange = useCallback(
    (value: string) => setFormat(value),
    []
  );
  const handleNumberOfPagesChange = useCallback((value: string) => {
    // Only allow numbers
    if (value === "" || /^\d+$/.test(value)) {
      setNumberOfPages(value);
    }
  }, []);

  // Date picker handlers
  const handleMonthChange = useCallback(
    (month: number, year: number) => setDate({ month, year }),
    []
  );

  const handleDateChange = useCallback((value: { start: Date }) => {
    setSelectedDate(value.start);
    setReleaseDate(value.start.toISOString());
  }, []);

  const handleCancel = useCallback(() => {
    navigate("/dashboard/books");
  }, [navigate]);

  if (isLoading || !book) {
    return (
      <Page
        title="Edit Book"
        backAction={{ content: "Books", url: "/dashboard/books" }}
      >
        <Card>
          <div className="p-6">
            <SkeletonBodyText lines={10} />
          </div>
        </Card>
      </Page>
    );
  }

  return (
    <Page
      title={`Edit Book: ${book.title}`}
      backAction={{ content: "Books", url: "/dashboard/books" }}
    >
      <BlockStack gap="500">
        {!success && (
          <Banner tone="critical">
            <p>{error || "Failed to load book data"}</p>
          </Banner>
        )}

        {actionData?.errors._form && (
          <Banner tone="critical">
            <p>{actionData.errors._form}</p>
          </Banner>
        )}

        <Card>
          <Form method="post">
            <div className="p-6">
              <FormLayout>
                <Select
                  label="Author"
                  options={authorOptions}
                  value={authorId}
                  onChange={handleAuthorChange}
                  error={actionData?.errors?._form}
                  disabled={isSubmitting || !success}
                  requiredIndicator
                  name="authorId"
                />

                <TextField
                  label="Title"
                  value={title}
                  onChange={handleTitleChange}
                  error={actionData?.errors?._form}
                  autoComplete="off"
                  disabled={isSubmitting}
                  requiredIndicator
                  name="title"
                />

                <BlockStack gap="400">
                  <Text variant="bodyMd" as="p" fontWeight="medium">
                    Release Date
                  </Text>
                  <DatePicker
                    month={month}
                    year={year}
                    onChange={handleDateChange}
                    onMonthChange={handleMonthChange}
                    selected={selectedDate}
                  />
                  <input type="hidden" name="releaseDate" value={releaseDate} />
                </BlockStack>

                <TextField
                  label="Description"
                  value={description}
                  onChange={handleDescriptionChange}
                  multiline={4}
                  autoComplete="off"
                  disabled={isSubmitting}
                  name="description"
                />

                <TextField
                  label="ISBN"
                  value={isbn}
                  onChange={handleIsbnChange}
                  autoComplete="off"
                  disabled={isSubmitting}
                  helpText="International Standard Book Number"
                  name="isbn"
                />

                <Select
                  label="Format"
                  options={formatOptions}
                  value={format}
                  onChange={handleFormatChange}
                  disabled={isSubmitting}
                  name="format"
                />

                <TextField
                  label="Number of Pages"
                  type="text"
                  value={numberOfPages}
                  onChange={handleNumberOfPagesChange}
                  autoComplete="off"
                  disabled={isSubmitting}
                  name="numberOfPages"
                />

                <div className="flex justify-end space-x-2 mt-6">
                  <Button onClick={handleCancel} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button variant="primary" submit loading={isSubmitting}>
                    Save Changes
                  </Button>
                </div>
              </FormLayout>
            </div>
          </Form>
        </Card>
      </BlockStack>
    </Page>
  );
}
