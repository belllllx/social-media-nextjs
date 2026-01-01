import { ApiBody, ICommonResponse } from "@/utils/types";
import { AxiosRequestConfig, isAxiosError } from "axios";
import axiosInstance from "@/utils/axios-instance";

type HttpMethod =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "head"
  | "options"
  | "postForm"
  | "putForm"
  | "patchForm";

export async function callApi<TBody extends Record<string, any>>(
  method: HttpMethod,
  url: string,
  body?: ApiBody<TBody> | FormData,
  config?: AxiosRequestConfig<any>,
): Promise<ICommonResponse> {
  try {
    const { data } = await axiosInstance[method]<ICommonResponse>(
      url,
      body,
      config,
    );
    return data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      return error.response?.data;
    }

    return {
      status: 500,
      success: false,
      message: "An unexpected error occurred",
    };
  }
}
