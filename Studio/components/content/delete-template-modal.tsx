import { DialogProps, DialogTrigger } from "@radix-ui/react-dialog";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type TDeleteContentTemplateProps = DialogProps & {
  tooltip?: string;
  loading?: boolean;
  asChild?: boolean;
  onDelete: () => void;
};

export default function DeleteContentTemplateDialog({
  tooltip,
  loading,
  children,
  asChild,
  onDelete,
  ...props
}: PropsWithChildren<TDeleteContentTemplateProps>) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen} {...props}>
      {tooltip ? (
        <Tooltip>
          <TooltipContent>{tooltip}</TooltipContent>
          <TooltipTrigger asChild={asChild}>
            <DialogTrigger className="w-full" asChild={asChild}>
              {children}
            </DialogTrigger>
          </TooltipTrigger>
        </Tooltip>
      ) : (
        <DialogTrigger className="w-full" asChild={asChild}>
          {children}
        </DialogTrigger>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Content Item</DialogTitle>
          <DialogDescription>
            By deleting this item, all its data will be deleted and will no
            longer be recoverable. Do you want to continue?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row items-center gap-1">
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            disabled={loading}
            onClick={() => onDelete()}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
