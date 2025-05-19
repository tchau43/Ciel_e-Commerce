// src/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // You can set default options here if needed
      refetchOnWindowFocus: false,
    },
  },
});
