import { ProfileOverview } from "@/components/profile-overview";

export default async function ProfileByIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ProfileOverview id={id} />
  );
}
