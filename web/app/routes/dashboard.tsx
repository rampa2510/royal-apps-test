import { Outlet, useLoaderData, useSearchParams } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import DashboardLayout from "~/components/DashboardLayout";
import { requireAuth } from "~/utils/auth.server";
import { useEffect } from "react";
import { logActivity } from "~/services/activityLog.service";

export async function loader({ request }: LoaderFunctionArgs) {

  // Check authentication for all dashboard routes
  return await requireAuth(request);
}

export default function Dashboard() {

  const [searchParams, setSearchParams] = useSearchParams();

  const userId = useLoaderData<typeof loader>()


  useEffect(() => {
    const log = searchParams.get("log")

    if (log && log.length && userId) {

      logActivity(userId, log, "succesfully logged")
    }

  }, [searchParams.get("log")])
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
