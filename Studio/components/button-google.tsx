import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import { GOOGLE_AUTH_BUTTON_ID, USER_ROLE } from "@/lib/constants";
import Toast from "@/lib/toast";
import { cn } from "@/lib/utils";
import { IApiResponse } from "@/types/api";
import { IAuthData, IGoogleAuthResponse } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "./ui/button";

type TGoogleSignInButtonProps = {
  callbackUrl?: string;
};

export default function GoogleSignInButton({
  callbackUrl,
}: TGoogleSignInButtonProps) {
  const router = useRouter();
  const { login } = useAuth();

  // Handle Google One Tap
  useEffect(() => {
    // Load the Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // Initialize Google One Tap when script loads
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: (res: IGoogleAuthResponse) =>
            googleSignInMutation.mutate(res),
        });
        window.google.accounts.id.renderButton(
          document.getElementById(GOOGLE_AUTH_BUTTON_ID)!,
          {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            logo_alignment: "center",
            width: "100%",
          }
        );
      }
    };

    return () => {
      // Clean up
      document.body.removeChild(script);
    };
  }, []);

  const googleSignInMutation = useMutation({
    mutationKey: ["googleSignInMutation"],
    mutationFn: async (data: IGoogleAuthResponse) => {
      const response = await Api.post<IApiResponse<IAuthData>>(
        "/public/auth/google-token",
        {
          google_auth: data,
          role: USER_ROLE,
        }
      );
      return response.data;
    },
    onSuccess: ({ data, message }) => {
      login({ ...data, rememberMe: true });

      Toast.s({
        title: "You have successfully logged in!",
        description: message.en,
      });

      router.replace(callbackUrl ?? "/channels", { scroll: false });
    },
  });

  return (
    <>
      <div
        id={GOOGLE_AUTH_BUTTON_ID}
        className={cn(
          "w-full rounded-lg overflow-hidden",
          googleSignInMutation.isPending ? "hidden" : ""
        )}
      />

      {googleSignInMutation.isPending ? (
        <Button className="w-full mt-4" disabled>
          <Image width={21} height={21} src="/images/google.svg" alt="Google" />
          <span style={{ fontFamily: '"Google Sans",arial,sans-serif' }}>
            Signing In...
          </span>
        </Button>
      ) : null}
    </>
  );
}

// Add TypeScript declaration for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: (notification?: any) => void;
        };
      };
    };
  }
}
