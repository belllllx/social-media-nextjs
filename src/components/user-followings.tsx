import React from "react";
import { IUser } from "@/utils/types";
import { ItemsNotFound } from "./items-not-found";
import { UserFollowing } from "./user-following";

interface UserFollowingsProps {
  user: IUser;
}

export function UserFollowings({ user }: UserFollowingsProps) {
  return (
    <>
      {user.followings.length ? (
        user.followings.map(({ following }) => (
          <UserFollowing
            key={following.id}
            user={user}
            followingOfUser={following}
          />
        ))
      ) : (
        <ItemsNotFound title="people" />
      )}
    </>
  );
}
