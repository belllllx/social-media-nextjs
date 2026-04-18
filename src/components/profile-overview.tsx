import React from "react";
import { UserProfileSettings } from "./user-profile-settings";

interface ProfileOverviewProps {
  id: string;
}

export function ProfileOverview({ id }: ProfileOverviewProps) {
  return (
    <UserProfileSettings id={id} />
  );
}