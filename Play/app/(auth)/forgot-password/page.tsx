"use client";

import type React from "react";
import { Suspense } from "react";

import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

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
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import useCallbackUrl from "@/hooks/use-callback-url";
import Api from "@/lib/axios";
import Toast from "@/lib/toast";
import type { IApiResponse } from "@/types/api";
import type { IAuthData } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

type TForgotPasswordState = "email" | "verify";

function ForgotPasswordContent() {
  const router = useRouter();
  const { callbackUrl } = useCallbackUrl();
  const { login } = useAuth();
  const [forgetPasswordState, setForgetPasswordState] =
    useState<TForgotPasswordState>("email");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formData, setFormData] = useState({
    username_or_email: "",
    verification_code: "",
    password: "",
    password_repeat: "",
  });

  const passwordRepeatError = useMemo(() => {
    if (formData.password !== formData.password_repeat) {
      return "Password and its repeat doesn't match!";
    }
    return null;
  }, [formData.password, formData.password_repeat]);

  const sendVerificationEmail = useMutation({
    mutationKey: ["sendVerificationEmail"],
    mutationFn: async () => {
      const response = await Api.post<IApiResponse>(
        "/public/auth/send-password-reset_code/",
        {
          username_or_email: formData.username_or_email,
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setForgetPasswordState("verify");

      Toast.s({
        title: "Verification code has been sent!",
        description: data.message.en,
      });
    },
  });

  const saveNewPasswordMutation = useMutation({
    mutationKey: ["saveNewPasswordMutation"],
    mutationFn: async () => {
      const response = await Api.post<IApiResponse<IAuthData>>(
        "/public/auth/update-password/",
        formData
      );
      return response.data;
    },
    onSuccess: ({ data, message }) => {
      login({ ...data, rememberMe });

      Toast.s({
        title: "Your new password has been set!",
        description: message.en,
      });

      router.replace(callbackUrl.value ?? "/channels", { scroll: false });
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-yaralex-orange/20 blur-xl rounded-full" />
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

        {forgetPasswordState === "verify" ? (
          <Card className="w-full bg-white/5 backdrop-blur-sm border-white/10 shadow-2xl">
            <CardHeader className="space-y-1 pb-3 text-center">
              <CardTitle className="text-3xl font-bold text-white">
                Set New Password
              </CardTitle>
              <CardDescription className="text-white/70">
                Enter verification code and your new password
              </CardDescription>
              <div className="flex flex-row items-center justify-center gap-2 text-sm text-white/60">
                Need to change email?{" "}
                <Button
                  className="p-0 text-yaralex-orange hover:text-yaralex-orange/80 font-medium"
                  variant="link"
                  onClick={() => setForgetPasswordState("email")}
                >
                  Change it
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  saveNewPasswordMutation.mutate();
                }}
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="first_name"
                    className="text-white/90 font-medium"
                  >
                    Verification Code
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="verification_code"
                      name="verification_code"
                      placeholder="For example: 12345"
                      type="text"
                      disabled={saveNewPasswordMutation.isPending}
                      value={formData.verification_code}
                      onChange={handleInputChange}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-yaralex-orange focus:ring-yaralex-orange/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-white/90 font-medium"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      autoCapitalize="none"
                      autoComplete="new-password"
                      disabled={saveNewPasswordMutation.isPending}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-yaralex-orange focus:ring-yaralex-orange/20"
                      required
                      minLength={6}
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

                <div className="space-y-2">
                  <Label
                    htmlFor="password_repeat"
                    className="text-white/90 font-medium"
                  >
                    Password Repeat
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password_repeat"
                      name="password_repeat"
                      type={showRepeatPassword ? "text" : "password"}
                      placeholder="Create a password"
                      autoCapitalize="none"
                      disabled={saveNewPasswordMutation.isPending}
                      value={formData.password_repeat}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-yaralex-orange focus:ring-yaralex-orange/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-muted-foreground"
                      aria-label={
                        showRepeatPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showRepeatPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {passwordRepeatError && (
                    <p className="text-yaralex-red text-sm font-medium">
                      {passwordRepeatError}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember_me"
                    checked={rememberMe}
                    onClick={() => {
                      if (rememberMe) {
                        Toast.i({
                          title: "You will not be remembered!",
                          description:
                            "When you close this tab or browser, all your login information will be deleted.",
                        });
                      }
                      setRememberMe((pv) => !pv);
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
                  disabled={saveNewPasswordMutation.isPending}
                >
                  {saveNewPasswordMutation.isPending
                    ? "Saving..."
                    : "Save New Password"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm text-white/70">
                Didn't receive the code?{" "}
                <Button
                  className="p-0 text-yaralex-orange hover:text-yaralex-orange/80 font-medium"
                  variant="link"
                  disabled={sendVerificationEmail.isPending}
                  onClick={() => sendVerificationEmail.mutate()}
                >
                  {sendVerificationEmail.isPending
                    ? "Sending..."
                    : "Resend Code"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ) : (
          <Card className="w-full bg-white/5 backdrop-blur-sm border-white/10 shadow-2xl">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-3xl font-bold text-white">
                Reset Password
              </CardTitle>
              <CardDescription className="text-white/70">
                Enter your email and we'll send you a link to reset your
                password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  sendVerificationEmail.mutate();
                }}
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
                      disabled={sendVerificationEmail.isPending}
                      value={formData.username_or_email}
                      onChange={handleInputChange}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-yaralex-orange focus:ring-yaralex-orange/20"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-yaralex-orange hover:bg-yaralex-orange/90 border-yaralex-orange/50 text-white font-bold py-3 text-lg"
                  disabled={sendVerificationEmail.isPending}
                >
                  {sendVerificationEmail.isPending
                    ? "Sending..."
                    : "Send Reset Code"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm text-white/70">
                Remember your password?{" "}
                <Link
                  className="text-yaralex-green hover:text-yaralex-green/80 font-medium hover:underline"
                  href={`/signin${callbackUrl.asParam}`}
                  replace
                >
                  Sign In
                </Link>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
