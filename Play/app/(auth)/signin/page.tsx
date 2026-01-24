"use client";

import type React from "react";
import { Suspense } from "react";

import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import GoogleSignInButton from "@/components/button-google";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/auth-context";
import useCallbackUrl from "@/hooks/use-callback-url";
import Api from "@/lib/axios";
import Toast from "@/lib/toast";
import type { IApiResponse } from "@/types/api";
import type { IAuthData } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";

function SignInContent() {
  const router = useRouter();
  const { login } = useAuth();
  const { callbackUrl } = useCallbackUrl();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username_or_email: "",
    password: "",
    remember_me: true,
  });

  const signInMutation = useMutation({
    mutationKey: ["signInMutation"],
    mutationFn: async () => {
      const response = await Api.post<IApiResponse<IAuthData>>(
        "/public/auth/sign-in/",
        formData
      );
      return response.data;
    },
    onSuccess: ({ data, message }) => {
      login({ ...data, rememberMe: formData.remember_me });

      Toast.s({
        title: "You have successfully logged in!",
        description: message.en,
      });

      router.replace(callbackUrl.value ?? "/channels", { scroll: false });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-yaralex-green/20 blur-xl rounded-full" />
            <Image
              src="/images/logo.png"
              alt="Yaralex Studio Logo"
              width={100}
              height={100}
              priority
              className="relative z-10"
            />
          </div>
        </div>

        <Card className="w-full bg-white/5 backdrop-blur-sm border-white/10 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-white">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-white/50">
              Sign in to continue your language learning journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                signInMutation.mutate();
              }}
              className="relative space-y-4"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="username_or_email"
                  className="text-white/90 font-medium"
                >
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username_or_email"
                    name="username_or_email"
                    placeholder="Enter your email"
                    type="text"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={signInMutation.isPending}
                    value={formData.username_or_email}
                    onChange={handleInputChange}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-yaralex-green focus:ring-yaralex-green/20"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-white/90 font-medium"
                  >
                    Password
                  </Label>
                  <Link
                    href={`/forgot-password${callbackUrl.asParam}`}
                    className="text-xs text-yaralex-blue hover:text-yaralex-blue/80 hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoCapitalize="none"
                    autoComplete="current-password"
                    autoCorrect="off"
                    disabled={signInMutation.isPending}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-yaralex-green focus:ring-yaralex-green/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-muted-foreground"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember_me"
                  checked={formData.remember_me}
                  onClick={() => {
                    if (formData.remember_me) {
                      Toast.i({
                        title: "You will not be remembered!",
                        description:
                          "When you close this tab or browser, all your login information will be deleted.",
                      });
                    }

                    setFormData((pv) => ({
                      ...pv,
                      remember_me: !formData.remember_me,
                    }));
                  }}
                  className="border-white/30 data-[state=checked]:bg-yaralex-green data-[state=checked]:border-yaralex-green"
                />
                <Label
                  htmlFor="remember_me"
                  className="cursor-pointer text-white/90 font-medium"
                >
                  Remember me
                </Label>
              </div>
              <Button
                type="submit"
                className="w-full bg-yaralex-green hover:bg-yaralex-green/90 border-yaralex-green/50 text-white font-bold py-3 text-lg"
                disabled={signInMutation.isPending}
              >
                {signInMutation.isPending ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="flex flex-row items-center gap-3 my-6">
              <Separator className="flex-1 bg-white/10" />
              <div className="relative flex justify-center text-xs uppercase">
                <span className="text-white/60 font-medium">
                  Or continue with
                </span>
              </div>
              <Separator className="flex-1 bg-white/10" />
            </div>

            <GoogleSignInButton callbackUrl={callbackUrl.value} />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-white/70">
              Don't have an account?{" "}
              <Link
                className="text-yaralex-green hover:text-yaralex-green/80 font-medium hover:underline"
                href={`/signup${callbackUrl.asParam}`}
                replace
              >
                Sign Up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
