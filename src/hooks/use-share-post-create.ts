import { callApi } from "@/utils/helpers/call-api";
import { ICommonResponse, ICreatePostPayload, IPost, IUser } from "@/utils/types";
import { InfiniteData, QueryClient, useMutation } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";

interface MutationType {
  user: IUser;
  post: IPost;
  payload: Omit<ICreatePostPayload, "filesUrl">;
}

export function useSharePostCreate(queryClient: QueryClient) {
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
      post,
      payload,
    }) => {
      const url =
        post.parent && post.parentId
          ? `post/share/create/${user.id}/${post.parentId}`
          : `post/share/create/${user.id}/${post.id}`;

      const res = await callApi<Omit<ICreatePostPayload, "filesUrl">>(
        "post",
        url,
        payload,
      );
      return res;
    },
    onMutate: async ({
      user,
      post,
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

        const newSharePost: IPost = {
          id: optimisticId,
          message: payload.message ?? null,
          userId: user.id,
          parentId: post.parentId ?? post.id,
          user,
          likes: [],
          parent: post.parent ?? post,
          comments: [],
          commentsCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const newFirstPage = {
          ...firstPage,
          posts: [newSharePost, ...firstPage.posts],
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
      const createdSharePost = data as IPost;

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

                const updateSharePost: IPost = {
                  ...createdSharePost
                }
                return updateSharePost;
              }),
            }
          }),
        }
      });
    },
  });
}