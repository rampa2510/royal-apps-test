import React, { useState, useCallback } from "react";
import { useSubmit } from "@remix-run/react";
import {
  IndexTable,
  Card,
  useIndexResourceState,
  Text,
  Badge,
  EmptyState,
  Modal,
  Button,
  BlockStack,
  Box,
} from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";
import { formatDate } from "~/utils/date-formatter";
import { Book } from "~/types/book";

interface BookListProps {
  books: Book[];
  authorId: string;
  authorName: string;
  onBooksChanged?: () => void;
}

export default function BookList({ books }: BookListProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const submit = useSubmit();

  const formattedBooks = books.map((book) => ({
    id: book.id.toString(),
    title: book.title,
    releaseDate: book.release_date
      ? formatDate(book.release_date)
      : "Unknown date",
    description: book.description || "No description available",
  }));

  const resourceName = {
    singular: "book",
    plural: "books",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(formattedBooks);

  const handleDeleteClick = useCallback((book: Book) => {
    setBookToDelete(book);
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!bookToDelete) return;

    const formData = new FormData();
    formData.append("intent", "deleteBook");
    formData.append("bookId", bookToDelete.id.toString());

    submit(formData, { method: "post" });
    setShowDeleteModal(false);
    setBookToDelete(null);
  }, [bookToDelete, submit]);

  const handleModalClose = useCallback(() => {
    setShowDeleteModal(false);
    setBookToDelete(null);
  }, []);

  // If no books are available
  if (books.length === 0) {
    return (
      <div className="mt-4">
        <EmptyState heading="No books available" image="">
          <p>This author doesn't have any books yet.</p>
        </EmptyState>
      </div>
    );
  }

  const rowMarkup = formattedBooks.map((book, index) => (
    <IndexTable.Row id={book.id} key={book.id} position={index}>
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {book.title}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>{book.releaseDate}</IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodyMd" as="span">
          {book.description.length > 100
            ? `${book.description.substring(0, 100)}...`
            : book.description}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Button
          icon={DeleteIcon}
          tone="critical"
          onClick={() =>
            handleDeleteClick(books.find((b) => b.id.toString() === book.id)!)
          }
          accessibilityLabel={`Delete book ${book.title}`}
        >
          Delete
        </Button>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Box paddingBlockEnd="1000">
      <Card>
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
            { title: "Description" },
            { title: "Actions" },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </Card>

      <Modal
        open={showDeleteModal}
        onClose={handleModalClose}
        title="Delete book"
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
              Are you sure you want to delete "{bookToDelete?.title}"? This
              action cannot be undone.
            </Text>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Box>
  );
}
