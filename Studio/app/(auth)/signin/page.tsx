"use client";

import GoogleSignInButton from "@/components/button-google";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { InputPassword } from "@/components/ui/input-password";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import useCallbackUrl from "@/hooks/use-callback-url";
import Api from "@/lib/axios";
import { USER_ROLE } from "@/lib/constants";
import Toast from "@/lib/toast";
import { IApiResponse } from "@/types/api";
import { IAuthData } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import { LockIcon, MailIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { callbackUrl } = useCallbackUrl();
  const [formData, setFormData] = useState({
    username_or_email: "",
    password: "",
    role: USER_ROLE,
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/logo.png"
            alt="Yaralex Studio Logo"
            width={90}
            height={90}
            priority
          />
        </div>

        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Sign In
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
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
                <Label htmlFor="username_or_email">Email</Label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href={`/forgot-password${callbackUrl.asParam}`}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <InputPassword
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  autoCapitalize="none"
                  autoComplete="current-password"
                  autoCorrect="off"
                  disabled={signInMutation.isPending}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                >
                  <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </InputPassword>
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

                    setFormData((prev) => ({
                      ...prev,
                      remember_me: !formData.remember_me,
                    }));
                  }}
                />
                <Label htmlFor="remember_me" className="cursor-pointer">
                  Remember me!
                </Label>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={signInMutation.isPending}
              >
                {signInMutation.isPending ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <GoogleSignInButton callbackUrl={callbackUrl.value} />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                className="text-primary hover:underline"
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
