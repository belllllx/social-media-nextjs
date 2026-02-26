import { callApi } from "@/utils/helpers/call-api";
import { ICommonResponse, ICreatePostPayload, IPost, IUser } from "@/utils/types";
import { InfiniteData, QueryClient, useMutation } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";

interface MutationType {
  user: IUser;
  payload: ICreatePostPayload;
}

export function usePostCreate(queryClient: QueryClient) {
  return useMutation<
    ICommonResponse,
    Error,
    MutationType,
    {
      prevPosts?: InfiniteData<{ posts: IPost[]; nextCursor: string | null }>,
      optimisticId: string,
    }
  >({
    mutationFn: async ({
      user,
      payload,
    }) => {
      const res = await callApi<ICreatePostPayload>(
        "post",
        `post/create/${user.id}`,
        payload,
      );
      return res;
    },
    onMutate: async ({
      user,
      payload,
    }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const optimisticId = uuidv4();

      const prevPosts = queryClient.getQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"]);

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"], (oldPosts) => {
        if (!oldPosts) {
          return undefined;
        }
        const firstPage = oldPosts.pages[0];

        const newPost: IPost = {
          id: optimisticId,
          message: payload.message ?? null,
          userId: user.id,
          parentId: null,
          user,
          likes: [],
          filesUrl: payload.filesUrl,
          parent: undefined,
          comments: [],
          commentsCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const newFirstPage = {
          ...firstPage,
          posts: [newPost, ...firstPage.posts],
        };

        return {
          ...oldPosts,
          pages: [newFirstPage, ...oldPosts.pages.slice(1)],
        };
      });

      return {
        prevPosts,
        optimisticId,
      };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"], context?.prevPosts);
    },
    onSuccess: ({ data }, variables, context) => {
      const createdPost = data as IPost;

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"], (oldPosts) => {
        if (!oldPosts) {
          return undefined;
        }

        return {
          ...oldPosts,
          pages: oldPosts.pages.map((page) => {
            // ไม่ใช่ page target ข้าม
            if (!page.posts.some((post) => post.id === context.optimisticId)) {
              return page;
            }

            return {
              ...page,
              posts: page.posts.map((post) => {
                // ไม่ใช่ post target ข้าม
                if (post.id !== context.optimisticId) {
                  return post;
                }

                const updatePost: IPost = {
                  ...createdPost
                }
                return updatePost;
              }),
            }
          }),
        }
      });
    },
  });
}