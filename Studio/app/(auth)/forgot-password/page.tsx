"use client";

import { LockIcon, MailIcon } from "lucide-react";
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
import { InputPassword } from "@/components/ui/input-password";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import useCallbackUrl from "@/hooks/use-callback-url";
import Api from "@/lib/axios";
import { USER_ROLE } from "@/lib/constants";
import Toast from "@/lib/toast";
import { IApiResponse } from "@/types/api";
import { IAuthData } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

type TForgotPasswordState = "email" | "verify";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { callbackUrl } = useCallbackUrl();
  const { login } = useAuth();
  const [forgetPasswordState, setForgetPasswordState] =
    useState<TForgotPasswordState>("email");
  const [rememberMe, setRememberMe] = useState(true);
  const [formData, setFormData] = useState({
    username_or_email: "",
    verification_code: "",
    password: "",
    password_repeat: "",
    role: USER_ROLE,
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
        { username_or_email: formData.username_or_email, role: formData.role }
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

        {forgetPasswordState === "verify" ? (
          <Card className="w-full">
            <CardHeader className="space-y-1 pb-3">
              <CardTitle className="text-2xl font-bold text-center">
                Set New Password
              </CardTitle>
              <CardDescription className="text-center">
                Enter verification code and your new password.
              </CardDescription>
              <div className="flex flex-row items-center justify-center gap-2 text-sm text-muted-foreground">
                Is the entered data incorrect?{" "}
                <Button
                  className="p-0"
                  variant="link"
                  onClick={() => setForgetPasswordState("email")}
                >
                  Change it!
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
                  <Label htmlFor="first_name">Verification Code</Label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="verification_code"
                      name="verification_code"
                      placeholder="For example: 12345"
                      type="text"
                      disabled={saveNewPasswordMutation.isPending}
                      value={formData.verification_code}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <InputPassword
                    id="password"
                    name="password"
                    placeholder="Create a password"
                    autoCapitalize="none"
                    autoComplete="new-password"
                    disabled={saveNewPasswordMutation.isPending}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                    minLength={6}
                  >
                    <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </InputPassword>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_repeat">Password Repeat</Label>
                  <InputPassword
                    id="password_repeat"
                    name="password_repeat"
                    placeholder="Create a password"
                    autoCapitalize="none"
                    disabled={saveNewPasswordMutation.isPending}
                    value={formData.password_repeat}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  >
                    <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </InputPassword>
                  {passwordRepeatError && (
                    <p className="text-red-500 text-sm">
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
                  />
                  <Label htmlFor="remember_me" className="cursor-pointer">
                    Remember me!
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={saveNewPasswordMutation.isPending}
                >
                  {saveNewPasswordMutation.isPending
                    ? "Saving..."
                    : "Save New Password"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm">
                Do not receive the code?{" "}
                <Button
                  className="p-0"
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
          <Card className="w-full">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Forgot Password
              </CardTitle>
              <CardDescription className="text-center">
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
                      disabled={sendVerificationEmail.isPending}
                      value={formData.username_or_email}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={sendVerificationEmail.isPending}
                >
                  {sendVerificationEmail.isPending
                    ? "Sending..."
                    : "Send Reset Email"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm">
                Do you remember your password?{" "}
                <Link
                  className="text-primary hover:underline"
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
