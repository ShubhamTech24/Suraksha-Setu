import { Home, Bell, Camera, MapPin, User } from "lucide-react";
import { Link, useLocation } from "wouter";

export function MobileNavigation() {
  const [location] = useLocation();

  const navigationItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Alerts",
      href: "/alerts",
      icon: Bell,
    },
    {
      name: "Report",
      href: "/reports",
      icon: Camera,
    },
    {
      name: "Safety",
      href: "/safety",
      icon: MapPin,
    },
    {
      name: "Learn",
      href: "/education",
      icon: User,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="grid grid-cols-5 h-16">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                active
                  ? "text-saffron"
                  : "text-gray-500 dark:text-gray-400 hover:text-saffron"
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
