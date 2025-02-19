import type { ActionFunctionArgs } from "@remix-run/node";
import { logout } from "~/utils/session.server";

export async function action({ request }: ActionFunctionArgs) {
  return await logout(request);
}

export async function loader() {
  return null;
}

export default function LogoutPage() {
  return <p>Logging out...</p>;
}
