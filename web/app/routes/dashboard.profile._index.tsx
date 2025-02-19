import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import {
  Card,
  Page,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Divider,
  EmptyState,
  Banner,
  Avatar,
} from "@shopify/polaris";
import { EditIcon } from "@shopify/polaris-icons";
import { useState, useEffect } from "react";
import { getCurrentUser } from "~/services/user.service";
import { getAccessToken, getUserId } from "~/utils/session.server";
import { Activity, getActivities } from "~/services/activityLog.service";
import { formatDate } from "~/utils/date-formatter";

export async function loader({ request }: LoaderFunctionArgs) {
  const accessToken = await getAccessToken(request);
  if (!accessToken) {
    throw new Error("Authentication required");
  }

  try {
    const user = await getCurrentUser(accessToken);
    return json({ user, success: true, error: null });
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return json({
      user: null,
      success: false,
      error: "Failed to load user profile",
    });
  }
}

export default function ProfilePage() {
  const { user, success, error } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activities, setActivities] = useState<Activity[]>([]);
  const profileUpdated = searchParams.get("updated") === "true";

  useEffect(() => {
    if (user) {
      const userActivities = getActivities(user.id.toString());
      setActivities(userActivities);
    }
  }, [user]);

  function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  function getActivityIcon(action: string): string {
    switch (action) {
      case "Book Added":
        return "📚";
      case "Book Updated":
        return "📝";
      case "Book Deleted":
        return "🗑️";
      case "Author Added":
        return "✍️";
      case "Author Updated":
        return "📝";
      case "Author Deleted":
        return "🗑️";
      case "Profile Updated":
        return "👤";
      case "Login":
        return "🔑";
      case "Logout":
        return "🚪";
      default:
        return "🔄";
    }
  }

  const handleEditClick = () => {
    navigate("/dashboard/profile/edit");
  };

  const dismissUpdateBanner = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("updated");
    setSearchParams(newParams);
  };

  return (
    <Page
      title="My Profile"
      primaryAction={{
        content: "Edit Profile",
        icon: EditIcon,
        onAction: handleEditClick,
      }}
    >
      <BlockStack gap="500">
        {profileUpdated && (
          <Banner tone="success" onDismiss={dismissUpdateBanner}>
            Your profile has been successfully updated.
          </Banner>
        )}

        {!success && (
          <Banner tone="critical">
            <p>{error || "Failed to load profile"}</p>
          </Banner>
        )}

        {success && user && (
          <BlockStack gap="1000">
            <Card>
              <div className="p-6">
                <BlockStack gap="1000">
                  <InlineStack align="center" gap="600">
                    <Avatar
                      customer
                      size="lg"
                      name={`${user.first_name} ${user.last_name}`}
                      initials={getInitials(user.first_name, user.last_name)}
                    />
                    <BlockStack>
                      <Text variant="headingLg" as="h2">
                        {user.first_name} {user.last_name}
                      </Text>
                      <Text variant="bodyMd" as="p" tone="subdued">
                        {user.email}
                      </Text>
                    </BlockStack>
                  </InlineStack>

                  <Divider />

                  <BlockStack gap="600">
                    <div>
                      <Text variant="bodyMd" as="p" fontWeight="semibold">
                        Account ID
                      </Text>
                      <Text variant="bodyMd" as="p">
                        {user.id}
                      </Text>
                    </div>

                    <div>
                      <Text variant="bodyMd" as="p" fontWeight="semibold">
                        Gender
                      </Text>
                      <Text variant="bodyMd" as="p">
                        {user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "Not specified"}
                      </Text>
                    </div>

                    <div>
                      <Text variant="bodyMd" as="p" fontWeight="semibold">
                        Account Status
                      </Text>
                      <div className="mt-1">
                        {user.active ? (
                          <div className="inline-flex items-center">
                            <span className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></span>
                            <Text variant="bodyMd" as="p">
                              Active
                            </Text>
                          </div>
                        ) : (
                          <div className="inline-flex items-center">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-500 mr-2"></span>
                            <Text variant="bodyMd" as="p">
                              Inactive
                            </Text>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Text variant="bodyMd" as="p" fontWeight="semibold">
                        Email Verification Status
                      </Text>
                      <div className="mt-1">
                        {user.email_confirmed ? (
                          <div className="inline-flex items-center">
                            <span className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></span>
                            <Text variant="bodyMd" as="p">
                              Verified
                            </Text>
                          </div>
                        ) : (
                          <div className="inline-flex items-center">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-500 mr-2"></span>
                            <Text variant="bodyMd" as="p">
                              Not Verified
                            </Text>
                          </div>
                        )}
                      </div>
                    </div>
                  </BlockStack>

                  <Divider />

                  <Form method="post" action="/logout">
                    <div className="flex justify-end">
                      <Button tone="critical" submit>Logout</Button>
                    </div>
                  </Form>
                </BlockStack>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <BlockStack gap="500">
                  <Text variant="headingMd" as="h3">
                    Recent Activities
                  </Text>

                  {activities.length > 0 ? (
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="border-b border-gray-200 pb-3 last:border-b-0"
                        >
                          <InlineStack gap="400" align="start">
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-lg">
                              {getActivityIcon(activity.action)}
                            </div>
                            <BlockStack>
                              <InlineStack gap="300">
                                <Text variant="bodyMd" as="span" fontWeight="semibold">
                                  {activity.action}
                                </Text>
                                <Text variant="bodySm" as="span" tone="subdued">
                                  {new Date(activity.timestamp).toLocaleString()}
                                </Text>
                              </InlineStack>
                              <Text variant="bodyMd" as="p">
                                {activity.details}
                              </Text>
                            </BlockStack>
                          </InlineStack>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      heading="No activities yet"
                      image=""
                    >
                      <p>Your recent activities will appear here once you start using the application.</p>
                    </EmptyState>
                  )}
                </BlockStack>
              </div>
            </Card>
          </BlockStack>
        )}
      </BlockStack>
    </Page>
  );
}
