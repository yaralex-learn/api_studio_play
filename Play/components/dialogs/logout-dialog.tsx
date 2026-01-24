import { useAuth } from "@/contexts/auth-context";
import Api from "@/lib/axios";
import Toast from "@/lib/toast";
import { IApiResponse } from "@/types/api";
import { DialogProps, DialogTrigger } from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import { PropsWithChildren, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

type TLogoutDialogProps = DialogProps & {
  asChild?: boolean;
};

export default function LogoutDialog({
  children,
  asChild,
  ...props
}: PropsWithChildren<TLogoutDialogProps>) {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const logoutMutation = useMutation({
    mutationKey: ["logout"],
    mutationFn: async () => {
      const res = await Api.post<IApiResponse>("/public/auth/logout/");
      return res.data;
    },
    onSuccess: ({ message }) => {
      logout();
      setOpen(false);

      Toast.s({
        title: "You are logged out!",
        description: message.en,
      });

      window.location.reload();
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen} {...props}>
      <DialogTrigger className="w-full" asChild={asChild}>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Out</DialogTitle>
          <DialogDescription>
            Logging out will remove all of your login information from this
            device. It will also remove any unsaved data. Do you want to
            continue?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row items-center gap-1">
          <Button
            variant="outline"
            disabled={logoutMutation.isPending}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button variant="destructive" onClick={() => logoutMutation.mutate()}>
            {logoutMutation.isPending ? "Logging out..." : "Yes, I'm sure!"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
