import { callApi } from "@/utils/helpers/call-api";
import { ICommonResponse, ILike, IPost, IUser } from "@/utils/types";
import { InfiniteData, QueryClient, useMutation } from "@tanstack/react-query";

interface MutationType {
  activeUser: IUser;
  postId: string;
  userId?: string;
}

export function usePostLike(queryClient: QueryClient) {
  return useMutation<
    ICommonResponse,
    Error,
    MutationType,
    {
      prevPosts?: InfiniteData<{ posts: IPost[]; nextCursor: string | null }>,
      prevPostsByUser?: InfiniteData<{ posts: IPost[]; nextCursor: string | null }>,
      prevPost?: IPost,
    }
  >({
    mutationFn: async ({
      activeUser,
      postId
    }) => {
      const res = await callApi(
        "post",
        `post/like/${activeUser.id}/${postId}`,
      );
      return res;
    },
    onMutate: async ({
      activeUser,
      postId,
      userId,
    }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["posts", userId] });
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      const prevPosts = queryClient.getQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"]);

      const prevPostsByUser = queryClient.getQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts", userId]);

      const prevPost = queryClient.getQueryData<IPost>(["post", postId]);

      const newLike: ILike = {
        id: -1,
        userId: activeUser.id,
        postId,
        commentId: null,
        user: activeUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

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
                  prevLike.userId === activeUser.id
                );
                if (index !== -1) {
                  copyPost.likes.splice(index, 1);
                } else {
                  copyPost.likes.unshift(newLike);
                }

                return copyPost;
              }),
            };
          }),
        };
      });

      if (userId) {
        queryClient.setQueryData<
          InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
        >(["posts", userId], (oldPosts) => {
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
                    prevLike.userId === activeUser.id
                  );
                  if (index !== -1) {
                    copyPost.likes.splice(index, 1);
                  } else {
                    copyPost.likes.unshift(newLike);
                  }

                  return copyPost;
                }),
              };
            }),
          };
        });
      }

      queryClient.setQueryData<IPost>(["post", postId], (oldPost) => {
        if (!oldPost) {
          return undefined;
        }

        const copyPost = {
          ...oldPost,
          likes: [...oldPost.likes],
        }
        const index = copyPost.likes.findIndex((prevLike) =>
          prevLike.userId === activeUser.id
        );
        if (index !== -1) {
          copyPost.likes.splice(index, 1);
        } else {
          copyPost.likes.unshift(newLike);
        }

        return copyPost;
      });

      return {
        prevPosts,
        prevPostsByUser,
        prevPost,
      };
    },
    onError: (error, { postId, userId }, context) => {
      if (
        !context
        ||
        !context.prevPosts
        ||
        !context.prevPostsByUser
        ||
        !context.prevPost
      ) {
        return;
      }

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"], context.prevPosts);

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts", userId], context.prevPostsByUser);


      queryClient.setQueryData<IPost>(["post", postId], context.prevPost);
    },
    // onSettled: (data, error, { postId }) => {
    //   queryClient.invalidateQueries({ queryKey: ["posts"] });
    //   queryClient.invalidateQueries({ queryKey: ["post", postId] });
    // },
  });
}