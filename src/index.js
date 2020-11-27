import React from "react"
import ReactDOM from "react-dom"
import {HashRouter as Router, Route, Switch} from "react-router-dom"
import reportWebVitals from "./reportWebVitals"
import {Root} from "./pages/root.page"

import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"

window.fcl = fcl
window.t = t

fcl
  .config()
  .put("env", "testnet")
  .put("accessNode.api", "https://access-testnet.onflow.org") // which access node we will talk to the chain via
  .put("challenge.handshake", "https://fcl-discovery.vercel.app/testnet/authn") // Wallet discovery
  .put("0xProfile", "0x1d007d755706c469") // Centralize contract addressess for when we write cadence

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route path="/" component={Root} />
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
)

reportWebVitals()
