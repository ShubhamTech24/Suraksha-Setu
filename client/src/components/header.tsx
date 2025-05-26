import { Shield, Menu, Phone, Moon, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Link, useLocation } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: "home" },
    { name: "Alerts", href: "/alerts", icon: "bell" },
    { name: "Reports", href: "/reports", icon: "camera" },
    { name: "Safety Zones", href: "/safety", icon: "map" },
    { name: "Education", href: "/education", icon: "book" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg border-b-2 border-saffron">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-saffron to-indian-green rounded-lg flex items-center justify-center">
              <Shield className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">SurakshaSetu</h1>
              <p className="text-xs text-gray-600 dark:text-gray-300">Bridge to Safety</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-saffron"
                    : "text-gray-700 dark:text-gray-200 hover:text-saffron"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {/* Emergency Button */}
            <Button
              className="bg-alert-red hover:bg-red-700 text-white pulse-urgent"
              size="sm"
              onClick={() => {
                // Handle emergency call
                window.open("tel:112", "_self");
              }}
            >
              <Phone size={16} className="mr-2" />
              Emergency
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="border-gray-200 dark:border-gray-700"
            >
              {theme === "dark" ? (
                <Sun size={16} />
              ) : (
                <Moon size={16} />
              )}
            </Button>

            {/* Profile */}
            <Button
              variant="outline"
              size="icon"
              className="border-gray-200 dark:border-gray-700"
            >
              <User size={16} />
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden border-gray-200 dark:border-gray-700"
                >
                  <Menu size={16} />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`text-lg font-medium p-2 rounded-lg transition-colors ${
                        isActive(item.href)
                          ? "bg-saffron text-white"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
