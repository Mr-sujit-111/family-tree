"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect to main page if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const family_name = formData.get("family_name") as string;
    const password = formData.get("password") as string;

    const result = await login(family_name, password);
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Login failed");
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      family_name: formData.get("family_name") as string,
      password: formData.get("password") as string,
      root_member_name: formData.get("root_member_name") as string,
      root_member_gender: formData.get("root_member_gender") as
        | "male"
        | "female",
    };

    const result = await register(data);
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Registration failed");
    }
    setIsLoading(false);
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Family Tree</CardTitle>
          <CardDescription>
            Sign in to your family account or create a new one
          </CardDescription>
        </CardHeader>
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "login" | "register")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="login_family_name">Family Name</Label>
                  <Input
                    id="login_family_name"
                    name="family_name"
                    placeholder="Smith Family"
                    required
                    minLength={3}
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login_password">Password</Label>
                  <Input
                    id="login_password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    maxLength={50}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </CardContent>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4 pt-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="reg_family_name">Family Name</Label>
                  <Input
                    id="reg_family_name"
                    name="family_name"
                    placeholder="Smith Family"
                    required
                    minLength={3}
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg_password">Password</Label>
                  <Input
                    id="reg_password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="root_member_name">Root Member Name</Label>
                  <Input
                    id="root_member_name"
                    name="root_member_name"
                    placeholder="John"
                    required
                    minLength={1}
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="root_member_gender">Gender</Label>
                  <select
                    id="root_member_gender"
                    name="root_member_gender"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </CardContent>
            </form>
          </TabsContent>
        </Tabs>
        <CardFooter className="flex justify-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Go back home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
