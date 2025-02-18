import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { TextField, Button } from '@shopify/polaris';
import { useState, useCallback } from 'react';
import { login } from '~/services/auth.service';
import { checkAuth } from '~/utils/auth.server';
import { createUserSession } from '~/utils/session.server';

export async function loader({ request }: LoaderFunctionArgs) {
  return await checkAuth(request);
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const response = await login({ email, password });
    return createUserSession(
      response.user.id.toString(),
      response.token_key,
      '/dashboard'
    );
  } catch (error) {
    return { error: 'Invalid credentials' };
  }
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailChange = useCallback((value: string) => setEmail(value), []);
  const handlePasswordChange = useCallback((value: string) => setPassword(value), []);

  const isLoading = navigation.state === "submitting";

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <div className="w-full max-w-md">
        <h1 className="text-center text-2xl font-normal mb-8">
          Royal Apps Books
        </h1>

        <div className="bg-white p-6 border border-gray-200 rounded">
          <h2 className="text-xl mb-6">
            Sign in to your account
          </h2>

          {actionData?.error && (
            <div className="mb-4 text-red-600">
              {actionData.error}
            </div>
          )}

          <Form method="post" className="space-y-4">
            <div>
              <TextField
                label="Email"
                type="email"
                name="email"
                value={email}
                onChange={handleEmailChange}
                autoComplete="email"
                requiredIndicator
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div>
              <TextField
                label="Password"
                type="password"
                name="password"
                value={password}
                onChange={handlePasswordChange}
                autoComplete="current-password"
                requiredIndicator
                disabled={isLoading}
              />
            </div>

            <Button
              fullWidth
              submit
              loading={isLoading}
            >
              Sign in
            </Button>
          </Form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          By signing in, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}
