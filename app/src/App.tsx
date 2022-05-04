import React from "react"
import "./App.css"

function App({
  host,
  setHost,
}: {
  host?: string
  setHost: (host: string) => void
}) {
  return (
    <div className="App">
      <header className="App-header">
        Host
        <input value={host} onChange={(e) => setHost(e.target.value)} />
      </header>
    </div>
  )
}

export default App
