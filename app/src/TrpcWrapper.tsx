import { httpLink } from "@trpc/client/links/httpLink"
import { splitLink } from "@trpc/client/links/splitLink"
import { createWSClient, wsLink } from "@trpc/client/links/wsLink"
import { createReactQueryHooks } from "@trpc/react"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { QueryClient, QueryClientProvider } from "react-query"
import type { AppRouter } from "../../server/server"
import App from "./App"

export const trpc = createReactQueryHooks<AppRouter>()

export function TrpcWrapper() {
  const [queryClient] = useState(() => new QueryClient())
  const [host, setHost] = useState<string | undefined>("localhost:3000")
  const wsClient = useMemo(
    () =>
      createWSClient({
        url: `ws://${host}/`,
        retryDelayMs: () => 3000,
      }),
    [host]
  )
  const lastClient = useRef<typeof wsClient>()
  const trpcClient = useMemo(() => {
    const url = `http://${host}/trpc`
    return trpc.createClient({
      url: url,
      links: [
        splitLink({
          condition(op) {
            return op.type === "subscription"
          },
          true: wsLink({
            client: wsClient,
          }),
          false: httpLink({
            url,
          }),
        }),
      ],
    })
  }, [host, wsClient])
  useEffect(() => {
    lastClient.current?.close()
    lastClient.current = wsClient
  }, [wsClient])
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App setHost={setHost} host={host} />
      </QueryClientProvider>
    </trpc.Provider>
  )
}
