import { Link, useLocation } from "@remix-run/react";
import type { ReactNode } from "react";
import { Frame, Navigation, TopBar } from "@shopify/polaris";
import {
  HomeIcon,
  BookIcon,
  BlogIcon,
  ProfileIcon,
} from "@shopify/polaris-icons";
import { useState, useCallback } from "react";
import { Form } from "@remix-run/react";
import { Button } from "@shopify/polaris";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const [mobileNavigationActive, setMobileNavigationActive] = useState(false);

  const toggleMobileNavigationActive = useCallback(
    () => setMobileNavigationActive((previousState) => !previousState),
    []
  );

  const navigationMarkup = (
    <Navigation location={location.pathname}>
      <Navigation.Section
        items={[
          {
            url: "/dashboard/home",
            label: "Home",
            icon: HomeIcon,
            selected: location.pathname === "/dashboard/home",
          },
          {
            url: "/dashboard/author",
            label: "Authors",
            icon: BlogIcon,
            selected: location.pathname === "/dashboard/author",
          },
          {
            url: "/dashboard/books",
            label: "Books",
            icon: BookIcon,
            selected: location.pathname === "/dashboard/books",
          },
          {
            url: "/dashboard/profile",
            label: "Profile",
            icon: ProfileIcon,
            selected: location.pathname === "/dashboard/profile",
          },
        ]}
      />
    </Navigation>
  );

  const userMenuMarkup = (
    <div className="flex items-center">
      <Form method="post" action="/logout">
        <Button variant="plain" submit>
          Logout
        </Button>
      </Form>
    </div>
  );

  const logo = {
    topBarSource: "/logo.png",
    url: "/dashboard/home",
    accessibilityLabel: "Royal Apps Books",
  };

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      userMenu={userMenuMarkup}
      onNavigationToggle={toggleMobileNavigationActive}
    />
  );

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex overflow-hidden mt-10">
        <aside className="w-64 border-r border-gray-200 bg-white relative">
          <div className="absolute inset-0 overflow-hidden">
            <Frame
              topBar={topBarMarkup}
              logo={logo}
              navigation={navigationMarkup}
              showMobileNavigation={mobileNavigationActive}
              onNavigationDismiss={toggleMobileNavigationActive}
              skipToContentTarget={undefined}
            >
              <div style={{ display: "none" }}></div>
            </Frame>
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
