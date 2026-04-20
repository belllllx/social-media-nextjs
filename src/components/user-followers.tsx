import React from "react";
import { IUser } from "@/utils/types";
import { ItemsNotFound } from "./items-not-found";
import { UserFollower } from "./user-follower";

interface UserFollowersProps {
  user: IUser;
}

export function UserFollowers({ user }: UserFollowersProps) {
  return (
    <>
      {user.followers.length ? (
        user.followers.map(({ follower }) => (
          <UserFollower
            key={follower.id}
            user={user}
            followerOfUser={follower}
          />
        ))
      ) : (
        <ItemsNotFound title="people" />
      )}
    </>
  );
}
