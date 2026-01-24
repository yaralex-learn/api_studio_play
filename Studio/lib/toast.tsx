import { Button, ButtonProps } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { nanoid } from "nanoid";
import { ReactNode } from "react";
import {
  RiAlertFill,
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiInformation2Fill,
} from "react-icons/ri";
import { ExternalToast, toast, ToastClassnames } from "sonner";

type TToastProps = ExternalToast & {
  title: ReactNode;
};

type TPromiseToastProps = {
  loading?: {
    title?: ReactNode;
    description?: ReactNode;
  };
  success?: {
    title?: ReactNode;
    description?: ReactNode;
  };
  error?: {
    title?: ReactNode;
    description?: ReactNode;
  };
};

function ToastCancelButton({
  tid,
  ...props
}: { tid: string | number } & ButtonProps) {
  return (
    <Button
      className="h-min w-min px-2 py-1 text-[.7rem] bg-black/30 hover:bg-black/50 text-white"
      onClick={() => toast.dismiss(tid)}
      {...props}
    >
      OK
    </Button>
  );
}

export default class Toast {
  private static defaultDuration = 9000 as const;
  private static defaultClassNames: ToastClassnames = {
    title: "!text-white !font-semibold !text-[.9rem]",
    description: "!text-white !opacity-50 !text-xs",
    cancelButton: "!text-white",
  } as const;

  private static content({
    icon,
    title,
    description,
  }: {
    icon: ReactNode;
    title?: ReactNode;
    description?: ReactNode;
  }) {
    return (
      <div className="flex flex-row items-center gap-3">
        {icon}
        <div className="flex flex-col items-start gap-0">
          {title}
          <span className="text-xs !text-white dark:!text-black !opacity-50">
            {description}
          </span>
        </div>
      </div>
    );
  }

  static s({ title, ...data }: TToastProps) {
    const tid = nanoid();
    toast.success(title, {
      id: tid,
      cancel: data.cancel ?? <ToastCancelButton tid={tid} />,
      className: "bg-green-600 text-white border-green-700",
      classNames: this.defaultClassNames,
      icon: <RiCheckboxCircleFill size={27} />,
      duration: this.defaultDuration,
      ...data,
    });
  }

  static i({ title, ...data }: TToastProps) {
    const tid = nanoid();
    toast.info(title, {
      id: tid,
      cancel: data.cancel ?? <ToastCancelButton tid={tid} />,
      className: "bg-blue-600 border-blue-700",
      classNames: this.defaultClassNames,
      icon: <RiInformation2Fill size={27} />,
      duration: this.defaultDuration,
      ...data,
    });
  }

  static w({ title, ...data }: TToastProps) {
    const tid = nanoid();
    toast.warning(title, {
      id: tid,
      cancel: data.cancel ?? <ToastCancelButton tid={tid} />,
      className: "bg-amber-600 text-white border-amber-700",
      classNames: this.defaultClassNames,
      icon: <RiAlertFill size={27} />,
      duration: this.defaultDuration,
      ...data,
    });
  }

  static e({ title, ...data }: TToastProps) {
    const tid = nanoid();
    toast.error(title, {
      id: tid,
      cancel: data.cancel ?? <ToastCancelButton tid={tid} />,
      className: "bg-red-600 text-white border-red-700",
      classNames: this.defaultClassNames,
      icon: <RiCloseCircleFill size={27} />,
      duration: this.defaultDuration,
      ...data,
    });
  }

  static promise<T>(
    promise: Promise<T>,
    { loading, success, error }: TPromiseToastProps = {}
  ) {
    toast.promise(promise, {
      loading: this.content({
        icon: <Loader className="animate-spin" size={24} />,
        ...loading,
      }),
      success: this.content({
        icon: <RiCheckboxCircleFill size={27} />,
        ...success,
      }),
      error: this.content({
        icon: <RiCloseCircleFill size={27} />,
        ...error,
      }),
    });
  }
}
