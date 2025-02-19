import { Page, Card } from "@shopify/polaris";

export default function HomePage() {
  return (
    <Page title="Home">
      <Card>
        <p>Welcome to the Royal Apps Books admin dashboard.</p>
        <p>
          Use the navigation menu to manage authors, books, and your profile.
        </p>
      </Card>
    </Page>
  );
}
