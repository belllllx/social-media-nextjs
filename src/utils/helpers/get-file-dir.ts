type FileDir = "image" | "video";

export function getFileDir(fileUrl: string): FileDir {
  const url = new URL(fileUrl);
  if(url.pathname.startsWith("/post-video")){
    return "video";
  }
  return "image";
}