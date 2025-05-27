import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, User, Lock, Eye, EyeOff, UserCheck, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";

interface LoginCredentials {
  username: string;
  password: string;
  role: 'user' | 'admin';
}

interface LoginProps {
  onLoginSuccess: (user: { id: number; username: string; role: string; fullName: string }) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
    role: 'user'
  });
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginCredentials) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Login successful!",
        description: `Welcome ${data.user.fullName}`,
      });
      onLoginSuccess(data.user);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      toast({
        title: "Missing credentials",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(credentials);
  };

  const handleQuickLogin = (role: 'user' | 'admin') => {
    const quickCredentials = role === 'admin' 
      ? { username: 'admin', password: 'admin123', role: 'admin' as const }
      : { username: 'user', password: 'user123', role: 'user' as const };
    
    setCredentials(quickCredentials);
    loginMutation.mutate(quickCredentials);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SurakshaSetu
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Advanced Security Platform
          </p>
        </div>

        <Card className="glass-card backdrop-blur-xl border-0 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">
              Secure Access
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
              Sign in to your security dashboard
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="user" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800">
                <TabsTrigger 
                  value="user" 
                  onClick={() => setCredentials(prev => ({ ...prev, role: 'user' }))}
                  className="flex items-center space-x-2"
                >
                  <User size={16} />
                  <span>Civilian</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="admin" 
                  onClick={() => setCredentials(prev => ({ ...prev, role: 'admin' }))}
                  className="flex items-center space-x-2"
                >
                  <Settings size={16} />
                  <span>Admin</span>
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <UserCheck className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={credentials.username}
                      onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                      className="pl-10"
                      disabled={loginMutation.isPending}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={credentials.password}
                      onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10"
                      disabled={loginMutation.isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <>
                      <Lock size={16} className="mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>

              {/* Quick Access Demo Buttons */}
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 text-center">Quick Demo Access:</p>
                
                <TabsContent value="user" className="space-y-2 mt-0">
                  <Button
                    onClick={() => handleQuickLogin('user')}
                    variant="outline"
                    className="w-full border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900"
                    disabled={loginMutation.isPending}
                  >
                    <User size={16} className="mr-2" />
                    Demo Civilian Login
                  </Button>
                </TabsContent>

                <TabsContent value="admin" className="space-y-2 mt-0">
                  <Button
                    onClick={() => handleQuickLogin('admin')}
                    variant="outline"
                    className="w-full border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900"
                    disabled={loginMutation.isPending}
                  >
                    <Settings size={16} className="mr-2" />
                    Demo Admin Login
                  </Button>
                </TabsContent>
              </div>

              <div className="text-center">
                <Link href="/signup">
                  <Button variant="link" className="text-sm text-blue-600 hover:text-blue-700">
                    Don't have an account? Sign up
                  </Button>
                </Link>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            🔒 Your data is protected with end-to-end encryption
          </p>
        </div>
      </div>
    </div>
  );
}