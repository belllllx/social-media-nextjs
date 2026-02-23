import { PostById } from "@/components/post-by-id";

export default async function PostByIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PostById id={id} />
  );
}