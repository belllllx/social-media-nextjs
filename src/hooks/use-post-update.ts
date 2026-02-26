import { callApi } from "@/utils/helpers/call-api";
import { ICommonResponse, IPost, IUpdatePostPayload } from "@/utils/types";
import { InfiniteData, QueryClient, useMutation } from "@tanstack/react-query";

interface MutateType {
  currentPost: IPost;
  payload: IUpdatePostPayload;
}

export function usePostUpdate(queryClient: QueryClient) {
  return useMutation<
    ICommonResponse,
    Error,
    MutateType,
    InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
  >({
    mutationFn: async ({
      currentPost,
      payload
    }) => {
      const res = await callApi<IUpdatePostPayload>(
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
                      message: payload.message ?? null,
                      filesUrl: [...(payload.filesUrl ?? [])],
                    },
                  };

                  return newUpdateParentPost;
                }

                const newUpdatePost: IPost = {
                  ...currentPost,
                  message: payload.message ?? null,
                  filesUrl: [...(payload.filesUrl ?? [])],
                };

                return newUpdatePost;
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
    onSuccess: ({ data }) => {
      const updatePost = data as IPost;

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
                if (post.parentId === updatePost.id) {
                  const newUpdateParentPost: IPost = {
                    ...post,
                    parent: {
                      ...updatePost,
                      message: updatePost.message,
                      filesUrl: [...(updatePost.filesUrl ?? [])],
                    },
                  };

                  return newUpdateParentPost;
                }

                const newUpdatePost: IPost = {
                  ...updatePost,
                  message: updatePost.message,
                  filesUrl: [...(updatePost.filesUrl ?? [])],
                };

                return newUpdatePost;
              }),
            };
          }),
        };
      });
    },
  });
}