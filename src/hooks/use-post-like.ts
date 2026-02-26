import { callApi } from "@/utils/helpers/call-api";
import { ICommonResponse, ILike, IPost, IUser } from "@/utils/types";
import { InfiniteData, QueryClient, useMutation } from "@tanstack/react-query";

interface MutationType {
  user: IUser;
  postId: string;
}

export function usePostLike(queryClient: QueryClient) {
  return useMutation<
    ICommonResponse,
    Error,
    MutationType,
    InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
  >({
    mutationFn: async ({
      user,
      postId
    }) => {
      const res = await callApi(
        "post",
        `post/like/${user.id}/${postId}`,
      );
      return res;
    },
    onMutate: async ({
      user,
      postId
    }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const prevPosts = queryClient.getQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"]);

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"], (oldPosts) => {
        if (!oldPosts) {
          return undefined;
        }

        return {
          ...oldPosts,
          pages: oldPosts.pages.map((page) => {
            // ไม่ใข่ page target ข้าม
            if (!page.posts.some((prevPost) => prevPost.id === postId)) {
              return page;
            }

            return {
              ...page,
              posts: page.posts.map((post) => {
                // ไม่ใข่ post target ข้าม
                if (post.id !== postId) {
                  return post;
                }

                // แก้เฉพาะ target
                const copyPost = {
                  ...post,
                  likes: [...post.likes],
                }
                const index = copyPost.likes.findIndex((prevLike) =>
                  prevLike.userId === user.id
                );
                if (index !== -1) {
                  copyPost.likes.splice(index, 1);
                } else {
                  const newLike: ILike = {
                    id: -1,
                    userId: user.id,
                    postId,
                    commentId: null,
                    user,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  }
                  copyPost.likes.unshift(newLike);
                }

                return copyPost;
              }),
            };
          }),
        };
      });

      return prevPosts;
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"], context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}