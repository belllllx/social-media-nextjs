import { InfiniteData } from "@tanstack/react-query";
import { IPost } from "../types";

export function postFilter(
  postId: string,
  postPages: InfiniteData<{
    posts: IPost[];
    nextCursor: string | null;
  }, unknown> | undefined
) {
  const posts = postPages?.pages.flatMap((postPage) => postPage.posts);
  if (posts && posts.length) {
    return posts.find((post) => post.id === postId);
  }
}