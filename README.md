# Step 1 - Install

```sh
yarn create react-app demo
yarn add @onflow/fcl@alpha @onflow/types
```

Basic Usage

```javascript
import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
```

# Step 2 - Configuration

- You will need different configuration for local development, testnet and mainnet.
- It needs to have happened once before any other fcl methods are called.
- It is recommended to happen in the root of the project.

```javascript
import {config} from "@onflow/fcl"

config()
  .put("env", "testnet") // used in stored interactions
  .put("accessNode.api", "https://access-testnet.onflow.org") // which access node we will talk to the chain via
  .put("challenge.handshake", "https://fcl-discovery.vercel.app/testnet/authn") // Wallet discovery
  .put("0xProfile", "0x1d007d755706c469") // Centralize contract addressess for when we write cadence
```

# Authentication

```javascript
import {useState, useEffect} from "react"
import * as fcl from "@onflow/fcl"

export function Auth() {
  const [user, setUser] = useState({})
  useEffect(() => fcl.currentUser().subscribe(setUser), [])

  if (user.loggedIn == null)
    return (
      <div>
        <button onClick={fcl.signUp}>Sign Up</button>
        <button onClick={fcl.logIn}>Log In</button>
      </div>
    )

  return (
    <div>
      <button onClick={fcl.unauthenticate}>Log Out</button>
      <ul>
        <li>Address: {user.addr}</li>
        <li>Cid: {user.cid}</li>
      </ul>
    </div>
  )
}
```

# Getting Data From The Chain

```javascript
import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"

function fetchProfile(address) {
  if (address == null) Promise.resolve(null)

  return fcl
    .send([
      fcl.args([fcl.arg(address, t.Address)]),
      fcl.script`
      import Profile from 0xProfile

      pub fun main(addresss: Address): Profile.ReadOnly? {
        return Profile.fetchProfile(address)
      }
    `,
    ])
    .then(fcl.decode)
}

export function Profile(address) {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    fetchProfile(address).then(setProfile)
  }, [address])

  if (profile == null) return <div>No Profile</div>

  return (
    <ul>
      <li>Display Name: {profile.displayName}</li>
      <li>Color: {profile.color}</li>
      <li>Avatar: {profile.avatar}</li>
    </ul>
  )
}
```

# Change Data On Chain

```javascript
import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"

async function updateDisplayName(displayName) {
  var txId = fcl
    .send([
      fcl.args([fcl.arg(displayName, t.String)]),
      fcl.proposer(fcl.authz),
      fcl.payer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.limit(35),
      fcl.transaction`
      import Profile from 0xProfile

      transaction(displayName: String) {
        prepare(account: AuthAccount) {
          account
            .borrow<&{Profile.Owner}>(from: Profile.privatePath)!
            .setDisplayName(displayName)
        }
      }
    `,
    ])
    .then(fcl.decode)

  var unsub = fcl
    .tx(txId)
    .subscribe(txStatus => console.log(`txStatus[${txId}]`, txStatus))
  var txStatus = await fcl.tx(txId).onceExecute()
  unsub()

  return txStatus
}

function DisplayNameUpdater() {
  const [displayName, setDisplayName] = useState("")
  const [processing, setProcessing] = useState(false)
  const [txStatus, setTxStatus] = useStatue(null)

  await function update() {
    setProcessing(true)
    setTxStatus(null)
    await updateDisplayName(displayName).then(setTxStatus)
    setProcessing(false)
  }

  return (
    <form>
      <input
        value={displayName}
        onChange={e => setDisplayName(e.target.value)}
        placeholder="Display Name"
      />
      {professing ? (
        <div>Processing...</div>
      ) : (
        <button onClick={update}>Update Display Name</button>
      )}
      <pre>{JSON.stringify(txStatus, null, 2)}</pre>
    </form>
  )
}
```
