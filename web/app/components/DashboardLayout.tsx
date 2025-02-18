import { BookIcon, HomeIcon, PersonIcon } from '@shopify/polaris-icons';
import { Link, useLocation } from '@remix-run/react';
import { Icon } from '@shopify/polaris';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navigationItems = [
    {
      label: 'Authors',
      icon: HomeIcon,
      url: '/authors',
    },
    {
      label: 'Books',
      icon: BookIcon,
      url: '/books',
    },
    {
      label: 'Profile',
      icon: PersonIcon,
      url: '/profile',
    },
  ];

  return (
    <div className="flex h-screen">
      <div className="w-64 border-r bg-white">
        <div className="h-16 flex items-center px-6 border-b">
          <h1 className="text-lg font-medium">Royal Apps Books</h1>
        </div>
        <nav className="p-4">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.url}
                to={item.url}
                className={`flex items-center space-x-2 px-4 py-2 rounded mb-1 ${isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <Icon source={item.icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
