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
  BlockStack,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import { getCurrentUser, updateUser } from "~/services/user.service";
import { getAccessToken, getUserId } from "~/utils/session.server";

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

export async function action({ request }: ActionFunctionArgs) {
  const accessToken = await getAccessToken(request);
  const userId = await getUserId(request);

  if (!accessToken || !userId) {
    throw new Error("Authentication required");
  }

  const formData = await request.formData();

  // Extract and validate data
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const gender = formData.get("gender") as string;

  const errors: Record<string, string> = {};

  if (!firstName) errors.firstName = "First name is required";
  if (!lastName) errors.lastName = "Last name is required";

  // If there are validation errors, return them
  if (Object.keys(errors).length > 0) {
    return json({ errors, values: Object.fromEntries(formData) });
  }

  try {
    const userData = {
      first_name: firstName,
      last_name: lastName,
      gender,
      active: true,
      email_confirmed: true,
    };

    const data = await updateUser(userId, userData, accessToken);

    console.log(data)

    // Redirect to profile with success message and log activity
    return redirect(
      "/dashboard/profile?updated=true&log=updateProfile",
    );
  } catch (error) {
    console.error("Failed to update profile:", error);
    return json({
      errors: {
        _form: "Failed to update profile. Please try again.",
      },
      values: Object.fromEntries(formData),
    });
  }
}

export default function EditProfilePage() {
  const { user, success, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const isSubmitting = navigation.state === "submitting";

  // Form state
  const [firstName, setFirstName] = useState<string>(
    (actionData?.values?.firstName as string) || user?.first_name || ""
  );
  const [lastName, setLastName] = useState<string>(
    (actionData?.values?.lastName as string) || user?.last_name || ""
  );
  const [gender, setGender] = useState<string>(
    (actionData?.values?.gender as string) || user?.gender || ""
  );

  // Gender options for select dropdown
  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
    { label: "Prefer not to say", value: "not_specified" },
  ];

  // Handlers
  const handleFirstNameChange = useCallback(
    (value: string) => setFirstName(value),
    []
  );
  const handleLastNameChange = useCallback(
    (value: string) => setLastName(value),
    []
  );
  const handleGenderChange = useCallback(
    (value: string) => setGender(value),
    []
  );

  const handleCancel = useCallback(() => {
    navigate("/dashboard/profile");
  }, [navigate]);

  return (
    <Page
      title="Edit Profile"
      backAction={{ content: "Profile", url: "/dashboard/profile" }}
    >
      <BlockStack gap="500">
        {!success && (
          <Banner tone="critical">
            <p>{error || "Failed to load profile data"}</p>
          </Banner>
        )}

        {actionData?.errors?._form && (
          <Banner tone="critical">
            <p>{actionData.errors._form}</p>
          </Banner>
        )}

        <Card>
          <Form method="post">
            <div className="p-6">
              <BlockStack gap="600">
                <Text variant="headingMd" as="h2">
                  Personal Information
                </Text>

                <FormLayout>
                  <TextField
                    label="First Name"
                    value={firstName}
                    onChange={handleFirstNameChange}
                    error={actionData?.errors?._form}
                    autoComplete="given-name"
                    disabled={isSubmitting || !success}
                    requiredIndicator
                    name="firstName"
                    autoFocus
                  />

                  <TextField
                    label="Last Name"
                    value={lastName}
                    onChange={handleLastNameChange}
                    error={actionData?.errors?._form}
                    autoComplete="family-name"
                    disabled={isSubmitting || !success}
                    requiredIndicator
                    name="lastName"
                  />

                  <Select
                    label="Gender"
                    options={genderOptions}
                    value={gender}
                    onChange={handleGenderChange}
                    disabled={isSubmitting || !success}
                    name="gender"
                  />

                  {user && (
                    <div className="py-2">
                      <BlockStack gap="200">
                        <Text variant="bodyMd" as="p" fontWeight="medium">
                          Email Address
                        </Text>
                        <Text variant="bodyMd" as="p" tone="subdued">
                          {user.email}
                          <span className="ml-2 text-sm text-gray-500">(Cannot be changed)</span>
                        </Text>
                      </BlockStack>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 mt-6">
                    <Button onClick={handleCancel} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button variant="primary" submit loading={isSubmitting}>
                      Save Changes
                    </Button>
                  </div>
                </FormLayout>
              </BlockStack>
            </div>
          </Form>
        </Card>
      </BlockStack>
    </Page>
  );
}
