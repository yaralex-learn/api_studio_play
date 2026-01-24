"use client";

import type React from "react";

import { EditIcon, LockIcon, MailIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

type TSignUpState = "userInfo" | "verify";

export default function SignUpPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { callbackUrl } = useCallbackUrl();
  const [signUpState, setSignUpState] = useState<TSignUpState>("userInfo");
  const [rememberMe, setRememberMe] = useState(true);
  const [formData, setFormData] = useState({
    // username: "",
    email: "",
    password: "",
    password_repeat: "",
    first_name: "",
    last_name: "",
    verification_code: "",
    role: USER_ROLE,
  });

  const passwordRepeatError = useMemo(() => {
    if (formData.password !== formData.password_repeat) {
      return "Password and its repeat doesn't match!";
    }
    return null;
  }, [formData.password, formData.password_repeat]);

  const signUpMutation = useMutation({
    mutationKey: ["signUpMutation"],
    mutationFn: async () => {
      const response = await Api.post<IApiResponse<IAuthData>>(
        "/public/auth/sign-up/",
        formData
      );

      return response.data;
    },
    onSuccess: ({ message }) => {
      setSignUpState("verify");

      Toast.s({
        title: "Account created successfully!",
        description: message.en,
      });
    },
  });

  const verifyEmailMutation = useMutation({
    mutationKey: ["verifyEmailMutation"],
    mutationFn: async () => {
      const response = await Api.post<IApiResponse<IAuthData>>(
        "/public/auth/verify-email/",
        {
          email: formData.email,
          verification_code: formData.verification_code,
          role: formData.role,
        }
      );

      return response.data;
    },
    onSuccess: ({ data, message }) => {
      login({ ...data, rememberMe });

      Toast.s({
        title: "You have successfully logged in!",
        description: message.en,
      });

      router.replace(callbackUrl.value ?? "/channels", { scroll: false });
    },
  });

  const sendVerificationEmail = useMutation({
    mutationKey: ["sendVerificationEmail"],
    mutationFn: async () => {
      const response = await Api.post<IApiResponse>(
        "/public/auth/resend-verification/",
        { email: formData.email }
      );
      return response.data;
    },
    onSuccess: (data) => {
      Toast.s({
        title: "Verification code sent to your email!",
        description: data.message.en,
      });
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

        {signUpState === "verify" ? (
          <Card className="w-full">
            <CardHeader className="space-y-1 pb-3">
              <CardTitle className="text-2xl font-bold text-center">
                Verify Email
              </CardTitle>
              <CardDescription className="text-center">
                Enter the verification code that sent to
              </CardDescription>
              <div className="flex flex-row items-center justify-center gap-2 text-sm text-muted-foreground">
                {formData.email}{" "}
                <Button
                  className="p-0"
                  variant="link"
                  onClick={() => setSignUpState("userInfo")}
                >
                  <EditIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  verifyEmailMutation.mutate();
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
                      disabled={verifyEmailMutation.isPending}
                      value={formData.verification_code}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
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
                  disabled={verifyEmailMutation.isPending}
                >
                  {verifyEmailMutation.isPending
                    ? "Verifying Email..."
                    : "Verify Email"}
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
                Create New Account
              </CardTitle>
              <CardDescription className="text-center">
                Enter your information to create your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!passwordRepeatError) {
                    signUpMutation.mutate();
                  }
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="first_name"
                        name="first_name"
                        placeholder="James"
                        type="text"
                        disabled={signUpMutation.isPending}
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="last_name"
                        name="last_name"
                        placeholder="Bond"
                        type="text"
                        disabled={signUpMutation.isPending}
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      name="username"
                      placeholder="james-bond"
                      type="text"
                      autoCapitalize="none"
                      autoCorrect="off"
                      disabled={signUpMutation.isPending}
                      value={formData.username}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div> */}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      placeholder="james.bond@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={signUpMutation.isPending}
                      value={formData.email}
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
                    disabled={signUpMutation.isPending}
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
                    disabled={signUpMutation.isPending}
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

                <Button
                  type="submit"
                  className="w-full"
                  disabled={signUpMutation.isPending}
                >
                  {signUpMutation.isPending
                    ? "Creating Account..."
                    : "Create Account"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm">
                Already have an account?{" "}
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
