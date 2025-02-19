import { json, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigate } from "@remix-run/react";
import {
  Card,
  Page,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Divider,
  Modal,
  Banner,
} from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";
import { getAuthor, deleteAuthor } from "~/services/author.service";
import { getAccessToken } from "~/utils/session.server";
import { formatDate } from "~/utils/date-formatter";
import { useState, useCallback } from "react";
import { deleteBook } from "~/services/book.service";
import BookList from "~/components/BookList";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const accessToken = await getAccessToken(request);
  if (!accessToken) {
    throw new Error("Authentication required");
  }

  const authorId = params.id;
  if (!authorId) {
    throw new Error("Author ID is required");
  }

  try {
    const author = await getAuthor(authorId, accessToken);
    return json({ author, success: true, error: null, bookDeleted: false });
  } catch (error) {
    console.error(`Failed to fetch author ${authorId}:`, error);
    return json({
      success: false,
      error: "Failed to fetch author details",
      author: null,
      bookDeleted: false,
    });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  const accessToken = await getAccessToken(request);
  if (!accessToken) {
    throw new Error("Authentication required");
  }

  const authorId = params.id;
  if (!authorId) {
    return json({ success: false, error: "Author ID is required" });
  }

  if (intent === "delete") {
    try {
      await deleteAuthor(authorId, accessToken);
      return redirect("/dashboard/authors?log=deleteAuthor");
    } catch (error) {
      console.error(`Failed to delete author ${authorId}:`, error);
      return json({
        success: false,
        error: "Failed to delete author. Make sure the author has no books.",
      });
    }
  }

  if (intent === "deleteBook") {
    const bookId = formData.get("bookId") as string;
    if (!bookId) {
      return json({ success: false, error: "Book ID is required" });
    }

    try {
      await deleteBook(bookId, accessToken);

      return redirect("/dashboard/authors?log=deleteBook");

    } catch (error) {
      console.error(`Failed to delete book ${bookId}:`, error);
      return json({
        success: false,
        error: "Failed to delete book.",
        authorId,
        bookDeleted: false,
      });
    }
  }

  return json({ success: false, error: "Invalid action" });
}

export default function AuthorDetailsPage() {
  const { author, success, error, bookDeleted } = useLoaderData<
    typeof loader & { bookDeleted: boolean }
  >();
  const submit = useSubmit();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const hasNoBooks = success && author?.books && author.books.length === 0;

  const handleDeleteClick = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    const formData = new FormData();
    formData.append("intent", "delete");
    submit(formData, { method: "post" });
  }, [submit]);

  const handleModalClose = useCallback(() => {
    setShowDeleteModal(false);
  }, []);

  return (
    <Page
      backAction={{ content: "Back to authors", url: "/dashboard/authors" }}
      title={
        success
          ? `${author?.first_name} ${author?.last_name}`
          : "Author Details"
      }
      primaryAction={
        hasNoBooks
          ? {
            content: "Delete Author",
            icon: DeleteIcon,
            destructive: true,
            onAction: handleDeleteClick,
          }
          : undefined
      }
    >
      <BlockStack gap="1000">
        {bookDeleted && (
          <Banner tone="success" onDismiss={() => { }}>
            Book was successfully deleted.
          </Banner>
        )}

        {!success && (
          <Card>
            <div className="p-4">
              <Text variant="bodyLg" as="p" tone="critical">
                {error || "Failed to fetch author details"}
              </Text>
            </div>
          </Card>
        )}

        {success && (
          <>
            <Card>
              <div className="p-6">
                <BlockStack gap="600">
                  <InlineStack align="space-between">
                    <BlockStack gap="200">
                      <Text variant="headingLg" as="h2">
                        {author?.first_name} {author?.last_name}
                      </Text>
                      <Text variant="bodyMd" as="p" tone="subdued">
                        ID: {author?.id}
                      </Text>
                    </BlockStack>
                  </InlineStack>

                  <Divider />

                  <BlockStack gap="1000">
                    <div>
                      <Text variant="bodyMd" as="p" fontWeight="semibold">
                        Birthday
                      </Text>
                      <Text variant="bodyMd" as="p">
                        {formatDate(author?.birthday)}
                      </Text>
                    </div>

                    <div>
                      <Text variant="bodyMd" as="p" fontWeight="semibold">
                        Gender
                      </Text>
                      <Text variant="bodyMd" as="p">
                        {author?.gender}
                      </Text>
                    </div>

                    <div>
                      <Text variant="bodyMd" as="p" fontWeight="semibold">
                        Place of Birth
                      </Text>
                      <Text variant="bodyMd" as="p">
                        {author?.place_of_birth}
                      </Text>
                    </div>

                    <div>
                      <Text variant="bodyMd" as="p" fontWeight="semibold">
                        Biography
                      </Text>
                      <Text variant="bodyMd" as="p">
                        {author?.biography || "No biography available"}
                      </Text>
                    </div>
                  </BlockStack>

                  <Divider />

                  <div>
                    <Text variant="headingMd" as="h3">
                      Books
                    </Text>
                    {hasNoBooks && (
                      <div className="mt-4">
                        <Banner tone="info">
                          <Text variant="bodyMd" as="p">
                            This author has no books. You can delete this
                            author.
                          </Text>
                        </Banner>
                      </div>
                    )}

                    {!hasNoBooks && (
                      <div className="mt-4">
                        <BookList
                          //@ts-ignore
                          books={author.books}
                          //@ts-ignore
                          authorId={author.id.toString()}
                          authorName={`${author?.first_name} ${author?.last_name}`}
                        />
                      </div>
                    )}
                  </div>
                </BlockStack>
              </div>
            </Card>

            <Modal
              open={showDeleteModal}
              onClose={handleModalClose}
              title="Delete author"
              primaryAction={{
                content: "Delete",
                destructive: true,
                onAction: handleDeleteConfirm,
              }}
              secondaryActions={[
                {
                  content: "Cancel",
                  onAction: handleModalClose,
                },
              ]}
            >
              <Modal.Section>
                <BlockStack gap="1000">
                  <Text as="p">
                    Are you sure you want to delete {author?.first_name}{" "}
                    {author?.last_name}? This action cannot be undone.
                  </Text>
                </BlockStack>
              </Modal.Section>
            </Modal>
          </>
        )}
      </BlockStack>
    </Page>
  );
}
