import { router, Subscription } from "@trpc/server"
import { applyWSSHandler } from "@trpc/server/adapters/ws"
import ws from "ws"

const appRouter = router().subscription("hello", {
  resolve: () => {
    return new Subscription((emit) => {
      const i = setInterval(() => emit.data("Hello"), 2000)
      return () => clearInterval(i)
    })
  },
})

export type AppRouter = typeof appRouter

const wss = new ws.Server({
  port: 3001,
})
const handler = applyWSSHandler({ wss, router: appRouter })

wss.on("connection", (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`)
  ws.once("close", () => {
    console.log(`➖➖ Connection (${wss.clients.size})`)
  })
})
console.log("✅ WebSocket Server listening on ws://localhost:3001")

process.on("SIGTERM", () => {
  console.log("SIGTERM")
  handler.broadcastReconnectNotification()
  wss.close()
})
