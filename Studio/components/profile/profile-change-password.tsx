import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import Toast from "@/lib/toast";
import { IApiResponse } from "@/types/api";
import { IAuthData } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import { LockIcon, MailIcon, SaveIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { InputPassword } from "../ui/input-password";
import { Label } from "../ui/label";

type TChangePasswordState = "new-password" | "verify";

export default function ProfileChangePassword() {
  const { user, refreshToken } = useAuth();
  const [changePasswordState, setChangePasswordState] =
    useState<TChangePasswordState>("new-password");
  const [formData, setFormData] = useState({
    username_or_email: "",
    verification_code: "",
    password: "",
    password_repeat: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((pv) => ({
        ...pv,
        username_or_email: user.email,
      }));
    }
  }, [user]);

  const passwordRepeatError = useMemo(() => {
    if (formData.password !== formData.password_repeat) {
      return "Password and its repeat doesn't match!";
    }
    return null;
  }, [formData.password, formData.password_repeat]);

  const sendVerificationEmail = useMutation({
    mutationKey: ["sendVerificationEmail"],
    mutationFn: async () => {
      await refreshToken();

      const response = await Api.post<IApiResponse>(
        "/public/auth/send-password-reset_code/",
        { username_or_email: formData.username_or_email }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setChangePasswordState("verify");

      Toast.s({
        title: "Verification code has been sent!",
        description: data.message.en,
      });
    },
  });

  const saveNewPasswordMutation = useMutation({
    mutationKey: ["saveNewPasswordMutation"],
    mutationFn: async () => {
      await refreshToken();

      const response = await Api.post<IApiResponse<IAuthData>>(
        "/public/auth/update-password/",
        formData
      );
      return response.data;
    },
    onSuccess: ({ message }) => {
      setChangePasswordState("new-password");

      setFormData((pv) => ({
        ...pv,
        verification_code: "",
        password: "",
        password_repeat: "",
      }));

      Toast.s({
        title: "Your new password has been set!",
        description: message.en,
      });
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (changePasswordState === "verify") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">Password</h2>
            <p className="text-xs text-muted-foreground">
              Enter the verification code has been sent to your email address.
            </p>
          </div>

          <Button
            onClick={() => saveNewPasswordMutation.mutate()}
            disabled={
              formData.password.trim().length === 0 ||
              passwordRepeatError != null ||
              saveNewPasswordMutation.isPending
            }
          >
            <SaveIcon className="h-4 w-4" />
            {saveNewPasswordMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>

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

          <div className="text-sm">
            Do not receive the code?{" "}
            <Button
              className="p-0"
              variant="link"
              disabled={sendVerificationEmail.isPending}
              onClick={() => sendVerificationEmail.mutate()}
            >
              {sendVerificationEmail.isPending ? "Sending..." : "Resend Code"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold">Password</h2>
          <p className="text-xs text-muted-foreground">
            Enter your new password here.
          </p>
        </div>

        <Button
          onClick={() => sendVerificationEmail.mutate()}
          disabled={
            formData.password.trim().length === 0 ||
            passwordRepeatError != null ||
            sendVerificationEmail.isPending
          }
        >
          <MailIcon className="h-4 w-4" />
          {sendVerificationEmail.isPending ? "Sending..." : "Send Email"}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <InputPassword
            id="password"
            name="password"
            placeholder="Enter new password"
            autoCapitalize="none"
            disabled={sendVerificationEmail.isPending}
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
          <Label htmlFor="password">Confirm New Password</Label>
          <InputPassword
            id="password_repeat"
            name="password_repeat"
            placeholder="Confirm your new password"
            autoCapitalize="none"
            disabled={sendVerificationEmail.isPending}
            value={formData.password_repeat}
            onChange={handleInputChange}
            className="pl-10"
            required
            minLength={6}
          >
            <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          </InputPassword>
          {passwordRepeatError && (
            <p className="text-red-500 text-sm">{passwordRepeatError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
