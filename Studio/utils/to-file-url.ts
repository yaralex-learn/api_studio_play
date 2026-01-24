export default function toFileUrl(fileId: string): string {
  return `/api/proxy/file/${fileId}`;
}
