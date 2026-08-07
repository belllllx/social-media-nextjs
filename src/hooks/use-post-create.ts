import { callApi } from "@/utils/helpers/call-api";
import { ICommonResponse, CreatePostPayload, IPost, IUser } from "@/utils/types";
import { InfiniteData, QueryClient, useMutation } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";

interface MutationType {
  activeUser: IUser;
  payload: CreatePostPayload;
}

export function usePostCreate(queryClient: QueryClient) {
  return useMutation<
    ICommonResponse,
    Error,
    MutationType,
    {
      prevPosts?: InfiniteData<{ posts: IPost[]; nextCursor: string | null }>;
      prevPostsByUser?: InfiniteData<{ posts: IPost[]; nextCursor: string | null }>;
      optimisticId: string,
    }
  >({
    mutationFn: async ({
      payload,
    }) => {
      const res = await callApi<CreatePostPayload>(
        "post",
        "post/create",
        payload,
      );
      return res;
    },
    onMutate: async ({
      activeUser,
      payload,
    }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["posts", activeUser.id] });

      const optimisticId = uuidv4();

      const prevPosts = queryClient.getQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"]);

      const prevPostsByUser = queryClient.getQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts", activeUser.id]);

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
          userId: activeUser.id,
          parentId: null,
          user: activeUser,
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

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts", activeUser.id], (oldPosts) => {
        if (!oldPosts) {
          return undefined;
        }
        const firstPage = oldPosts.pages[0];

        const newPost: IPost = {
          id: optimisticId,
          message: payload.message ?? null,
          userId: activeUser.id,
          parentId: null,
          user: activeUser,
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
        prevPostsByUser,
        optimisticId,
      };
    },
    onError: (error, { activeUser }, context) => {
      if (
        !context
        ||
        !context.prevPosts
        ||
        !context.prevPostsByUser
      ) {
        return;
      }

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts"], context.prevPosts);

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts", activeUser.id], context.prevPostsByUser);
    },
    onSuccess: ({ data }, variables, context) => {
      const createdPost = data as unknown as IPost;

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
                  ...createdPost,
                  likes: [],
                }
                return updatePost;
              }),
            }
          }),
        }
      });

      queryClient.setQueryData<
        InfiniteData<{ posts: IPost[]; nextCursor: string | null }>
      >(["posts", createdPost.userId], (oldPosts) => {
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
                  ...createdPost,
                  likes: [],
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