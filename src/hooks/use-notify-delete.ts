import { QueryClient } from "@tanstack/react-query";

export function useNotifyDelete(
  queryClient: QueryClient,
) {
  queryClient.invalidateQueries({ queryKey: ["notifies"] });
}
