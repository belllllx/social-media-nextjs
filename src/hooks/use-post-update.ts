import { callApi } from "@/utils/helpers/call-api";
import { ICommonResponse, IPost, UpdatePostPayload } from "@/utils/types";
import { InfiniteData, QueryClient, useMutation } from "@tanstack/react-query";

interface MutateType {
  currentPost: IPost;
  payload: UpdatePostPayload;
}

export function usePostUpdate(queryClient: QueryClient) {
  return useMutation<
    ICommonResponse,
    Error,
    MutateType,
    {
      prevPosts?: InfiniteData<{ posts: IPost[]; nextCursor: string | null }>;
      prevPostsByUser?: InfiniteData<{ posts: IPost[]; nextCursor: string | null }>;
      prevPost?: IPost;
    }
  >({
    mutationFn: async ({
      currentPost,
      payload
    }) => {
      const res = await callApi<UpdatePostPayload>(
        "patch",
        `post/update/${currentPost.id}`,
        payload,
      );
      return res;
    },
    onMutate: async ({
      currentPost,
      payload,
    }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["posts", currentPost.userId] });
      await queryClient.cancelQueries({ queryKey: ["post", currentPost.id] });

      const prevPosts = queryClient.getQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"]);

      const prevPostsByUser = queryClient.getQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts", currentPost.userId]);

      const prevPost = queryClient.getQueryData<IPost>(["post", currentPost.id]);

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
            if (!page.posts.some((prevPost) => prevPost.id === currentPost.id)) {
              return page;
            }

            return {
              ...page,
              posts: page.posts.map((post) => {
                // ไม่ใข่ post target ข้าม
                if (
                  post.id !== currentPost.id &&
                  post.parentId !== currentPost.id
                ) {
                  return post;
                }

                // แก้เฉพาะ target
                if (post.parentId === currentPost.id) {
                  const newUpdateParentPost: IPost = {
                    ...post,
                    parent: {
                      ...currentPost,
                      message: payload.message ?? currentPost.message,
                      filesUrl: [...(payload.filesUrl ?? currentPost.filesUrl)],
                    },
                  };

                  return newUpdateParentPost;
                }

                const newUpdatePost: IPost = {
                  ...currentPost,
                  message: payload.message ?? currentPost.message,
                  filesUrl: [...(payload.filesUrl ?? currentPost.filesUrl)],
                };

                return newUpdatePost;
              }),
            };
          }),
        };
      });

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts", currentPost.userId], (oldPosts) => {
        if (!oldPosts) {
          return undefined;
        }

        return {
          ...oldPosts,
          pages: oldPosts.pages.map((page) => {
            // ไม่ใข่ page target ข้าม
            if (!page.posts.some((prevPost) => prevPost.id === currentPost.id)) {
              return page;
            }

            return {
              ...page,
              posts: page.posts.map((post) => {
                // ไม่ใข่ post target ข้าม
                if (
                  post.id !== currentPost.id &&
                  post.parentId !== currentPost.id
                ) {
                  return post;
                }

                // แก้เฉพาะ target
                if (post.parentId === currentPost.id) {
                  const newUpdateParentPost: IPost = {
                    ...post,
                    parent: {
                      ...currentPost,
                      message: payload.message ?? currentPost.message,
                      filesUrl: [...(payload.filesUrl ?? currentPost.filesUrl)],
                    },
                  };

                  return newUpdateParentPost;
                }

                const newUpdatePost: IPost = {
                  ...currentPost,
                  message: payload.message ?? currentPost.message,
                  filesUrl: [...(payload.filesUrl ?? currentPost.filesUrl)],
                };

                return newUpdatePost;
              }),
            };
          }),
        };
      });

      queryClient.setQueryData<IPost>(["post", currentPost.id], (oldPost) => {
        if (!oldPost) {
          return undefined;
        }

        if (oldPost.parentId === currentPost.id) {
          const newUpdateParentPost: IPost = {
            ...oldPost,
            parent: {
              ...currentPost,
              message: payload.message ?? currentPost.message,
              filesUrl: [...(payload.filesUrl ?? currentPost.filesUrl)],
            },
          };

          return newUpdateParentPost;
        }

        const newUpdatePost: IPost = {
          ...currentPost,
          message: payload.message ?? currentPost.message,
          filesUrl: [...(payload.filesUrl ?? currentPost.filesUrl)],
        };

        return newUpdatePost;
      });

      return {
        prevPosts,
        prevPostsByUser,
        prevPost,
      };
    },
    onError: (error, { currentPost }, context) => {
      if(
        !context
        ||
        !context.prevPosts
        ||
        !context.prevPostsByUser
        ||
        !context.prevPost
      ){
        return;
      }

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"], context.prevPosts);

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts", currentPost.userId], context.prevPostsByUser);

      queryClient.setQueryData<IPost>(["post", currentPost.id], context.prevPost);
    },
    onSuccess: ({ data }) => {
      const updatePost = data as unknown as IPost;

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
            if (!page.posts.some((prevPost) => prevPost.id === updatePost.id)) {
              return page;
            }

            return {
              ...page,
              posts: page.posts.map((post) => {
                // ไม่ใข่ post target ข้าม
                if (
                  post.id !== updatePost.id &&
                  post.parentId !== updatePost.id
                ) {
                  return post;
                }

                // แก้เฉพาะ target
                if (post.parentId === updatePost.id && post.parent) {
                  const newUpdateParentPost: IPost = {
                    ...post,
                    parent: {
                      ...post.parent,
                      message: updatePost.message ?? post.parent.message,
                      filesUrl: [...(updatePost.filesUrl ?? post.parent.filesUrl)],
                    },
                  };

                  return newUpdateParentPost;
                }

                const newUpdatePost: IPost = {
                  ...post,
                  message: updatePost.message ?? post.message,
                  filesUrl: [...(updatePost.filesUrl ?? post.filesUrl)],
                };

                return newUpdatePost;
              }),
            };
          }),
        };
      });

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts", updatePost.userId], (oldPosts) => {
        if (!oldPosts) {
          return undefined;
        }

        return {
          ...oldPosts,
          pages: oldPosts.pages.map((page) => {
            // ไม่ใข่ page target ข้าม
            if (!page.posts.some((prevPost) => prevPost.id === updatePost.id)) {
              return page;
            }

            return {
              ...page,
              posts: page.posts.map((post) => {
                // ไม่ใข่ post target ข้าม
                if (
                  post.id !== updatePost.id &&
                  post.parentId !== updatePost.id
                ) {
                  return post;
                }

                // แก้เฉพาะ target
                if (post.parentId === updatePost.id && post.parent) {
                  const newUpdateParentPost: IPost = {
                    ...post,
                    parent: {
                      ...post.parent,
                      message: updatePost.message ?? post.parent.message,
                      filesUrl: [...(updatePost.filesUrl ?? post.parent.filesUrl)],
                    },
                  };

                  return newUpdateParentPost;
                }

                const newUpdatePost: IPost = {
                  ...updatePost,
                  message: updatePost.message ?? post.message,
                  filesUrl: [...(updatePost.filesUrl ?? post.filesUrl)],
                };

                return newUpdatePost;
              }),
            };
          }),
        };
      });

      queryClient.setQueryData<IPost>(["post", updatePost.id], (oldPost) => {
        if(!oldPost){
          return undefined;
        }

        if (oldPost.parentId === updatePost.id && oldPost.parent) {
          const newUpdateParentPost: IPost = {
            ...oldPost,
            parent: {
              ...oldPost.parent,
              message: updatePost.message ?? oldPost.parent.message,
              filesUrl: [...(updatePost.filesUrl ?? oldPost.parent.filesUrl)],
            },
          };

          return newUpdateParentPost;
        }

        const newUpdatePost: IPost = {
          ...updatePost,
          message: updatePost.message ?? oldPost.message,
          filesUrl: [...(updatePost.filesUrl ?? oldPost.filesUrl)],
        };

        return newUpdatePost;
      });
    },
  });
}