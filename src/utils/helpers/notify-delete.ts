import { QueryClient } from "@tanstack/react-query";

export function notifyDelete(
  queryClient: QueryClient,
) {
  queryClient.invalidateQueries({ queryKey: ["notifies"] });
}
