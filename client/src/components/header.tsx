import { Shield, Menu, Phone, Moon, Sun, User, Bell, Activity, Zap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth-context";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const navigation = [
    { name: "Command Center", href: "/", icon: Activity },
    { name: "Live Alerts", href: "/alerts", icon: Bell },
    { name: "Intel Reports", href: "/reports", icon: Zap },
    { name: "Safety Center", href: "/safety-center", icon: Shield },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <header className="glass-card backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-0 border-b border-white/20 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Enhanced Logo and Brand */}
          <Link href="/" className="flex items-center space-x-4 group hover:scale-105 transition-all duration-300">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-blue-700 flex items-center justify-center shadow-lg">
                <Shield className="text-white drop-shadow-md" size={24} />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SurakshaSetu
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Advanced Security Platform</p>
            </div>
          </Link>

          {/* Modern Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 rounded-full px-3 py-2 backdrop-blur-md border border-white/20">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
                      : "text-gray-700 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-700/80 hover:scale-105"
                  }`}
                >
                  <Icon size={16} className={isActive(item.href) ? "text-white" : ""} />
                  <span className="hidden xl:inline">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Advanced Action Bar */}
          <div className="flex items-center space-x-3">
            {/* Status Indicator */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-green-500/10 rounded-full border border-green-500/20">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700 dark:text-green-400">System Online</span>
            </div>

            {/* Emergency Command Button */}
            <Button
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg transform hover:scale-105 transition-all duration-300 border-0"
              size="sm"
              onClick={() => window.open("tel:112", "_self")}
            >
              <Phone size={16} className="mr-2" />
              <span className="hidden sm:inline">Emergency</span>
              <div className="absolute inset-0 bg-red-400/20 rounded-md animate-ping"></div>
            </Button>

            {/* Notification Bell */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300"
            >
              <Bell size={18} />
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 bg-red-500 text-white text-xs flex items-center justify-center animate-pulse">
                3
              </Badge>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300 hover:scale-110"
            >
              {theme === "dark" ? (
                <Sun size={18} className="text-yellow-500" />
              ) : (
                <Moon size={18} className="text-blue-600" />
              )}
            </Button>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative overflow-hidden hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300 hover:scale-110"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium">{user?.fullName}</p>
                  <p className="text-xs text-gray-500">
                    {isAdmin ? 'Security Admin' : 'Civilian User'}
                  </p>
                </div>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="w-full cursor-pointer">
                      <Shield size={16} className="mr-2" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/" className="w-full cursor-pointer">
                    <Activity size={16} className="mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    logout();
                    window.location.href = '/login';
                  }}
                  className="text-red-600 cursor-pointer"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300"
                >
                  <Menu size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent className="glass-card backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-white/20">
                <div className="flex flex-col space-y-6 mt-12">
                  <div className="flex items-center space-x-4 pb-6 border-b border-white/20">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Shield className="text-white" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">SurakshaSetu</h2>
                      <p className="text-sm text-gray-500">Security Command</p>
                    </div>
                  </div>
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
                          isActive(item.href)
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                            : "text-gray-700 dark:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-700/60"
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
