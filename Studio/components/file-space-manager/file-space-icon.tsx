import { cn } from "@/lib/utils";
import {
  FileArchiveIcon,
  FileChartColumnIcon,
  FileIcon,
  FileTextIcon,
  FileVideoIcon,
  FilmIcon,
  ImageIcon,
  LucideProps,
  MusicIcon,
} from "lucide-react";
import { RefAttributes } from "react";

type TFileSpaceIconProps = Omit<LucideProps, "ref"> &
  RefAttributes<SVGSVGElement> & {
    fileName: string;
  };

export default function FileSpaceIcon({
  fileName,
  className,
  ...props
}: TFileSpaceIconProps) {
  const extension = fileName.substring(
    fileName.lastIndexOf(".") + 1,
    fileName.length
  );

  if (!extension) {
    return <FileIcon className={cn("text-gray-500", className)} {...props} />;
  }

  switch (extension.toLowerCase()) {
    case "pdf":
      return (
        <FileTextIcon className={cn("text-red-500", className)} {...props} />
      );

    case "doc":
    case "docx":
      return (
        <FileTextIcon className={cn("text-blue-600", className)} {...props} />
      );

    case "xls":
    case "xlsx":
      return (
        <FileChartColumnIcon
          className={cn("text-green-600", className)}
          {...props}
        />
      );

    case "ppt":
    case "pptx":
      return (
        <FileVideoIcon
          className={cn("text-orange-500", className)}
          {...props}
        />
      );

    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
    case "svg":
      return (
        <ImageIcon className={cn("text-purple-500", className)} {...props} />
      );

    case "mp4":
    case "webm":
    case "mov":
    case "avi":
    case "mkv":
      return <FilmIcon className={cn("text-cyan-500", className)} {...props} />;

    case "mp3":
    case "wav":
    case "ogg":
    case "m4a":
    case "flac":
    case "aac":
      return (
        <MusicIcon className={cn("text-green-500", className)} {...props} />
      );

    case "zip":
    case "rar":
    case "7z":
    case "tar":
      return (
        <FileArchiveIcon
          className={cn("text-indigo-500", className)}
          {...props}
        />
      );

    default:
      return <FileIcon className={cn("text-gray-500", className)} {...props} />;
  }
}
