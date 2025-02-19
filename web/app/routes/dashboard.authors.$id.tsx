import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import {
  Card,
  Page,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Divider,
} from "@shopify/polaris";
import { ArrowLeftIcon } from "@shopify/polaris-icons";
import { getAuthor } from "~/services/author.service";
import { getAccessToken } from "~/utils/session.server";
import { formatDate } from "~/utils/date-formatter";

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
    return json({ author, success: true, error: null });
  } catch (error) {
    console.error(`Failed to fetch author ${authorId}:`, error);
    return json({
      author: null,
      success: false,
      error: "Failed to fetch author details",
    });
  }
}

export default function AuthorDetailsPage() {
  const { author, success, error } = useLoaderData<typeof loader>();

  return (
    <Page
      backAction={{ content: "Back to authors", url: "/dashboard/authors" }}
      title={
        success
          ? `${author?.first_name} ${author?.last_name}`
          : "Author Details"
      }
    >
      <BlockStack gap="400">
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

                <BlockStack gap="400">
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
                  {author?.books && author?.books?.length > 0 ? (
                    <ul className="mt-4 space-y-2">
                      {author.books.map((book) => (
                        <li key={book.id}>
                          {book.title} (
                          {book.release_date
                            ? formatDate(book.release_date)
                            : "Unknown date"}
                          )
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Text variant="bodyMd" as="p" tone="subdued">
                      No books available
                    </Text>
                  )}
                </div>
              </BlockStack>
            </div>
          </Card>
        )}
      </BlockStack>
    </Page>
  );
}
