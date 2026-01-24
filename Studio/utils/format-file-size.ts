/**
 * Format file/folder size
 * @param size
 * @param unit bytes | mb `DEFAULT: mb`
 */
export default function formatFileSize(
  size: number,
  unit: "bytes" | "kb" = "kb"
): string {
  const sizeInMB = unit === "bytes" ? size / (1024 * 1024) : size / 1024;
  return sizeInMB < 1
    ? `${(sizeInMB * 1024).toFixed(0)} KB`
    : `${sizeInMB.toFixed(1)} MB`;
}
