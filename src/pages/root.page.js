import {useState, useEffect} from "react"
import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"

const ADDRESS = "0xba1132bc08f82fe2"

function fetchProfile(address) {
  if (address == null) return Promise.resolve(null)

  return fcl
    .send([
      fcl.script`
      import Profile from 0xProfile

      pub fun main(address: Address): Profile.ReadOnly? {
        return Profile.fetchProfile(address)
      }
    `,
      fcl.args([fcl.arg(address, t.Address)]),
    ])
    .then(fcl.decode)
}

// export function Root() {
//   const [profile, setProfile] = useState(null)
//   useEffect(() => {
//     fetchProfile(ADDRESS).then(setProfile)
//   }, [])

//   return <pre>{JSON.stringify(profile, null, 2)}</pre>
// }

async function updateDisplayName(displayName) {
  var txId = await fcl
    .send([
      fcl.transaction`
      import Profile from 0xProfile

      transaction(name: String) {
        prepare(account: AuthAccount) {
          account
            .borrow<&{Profile.Owner}>(from: Profile.privatePath)!
            .setDisplayName(name)
        }
      }
    `,
      fcl.args([fcl.arg(displayName, t.String)]),
      fcl.proposer(fcl.authz),
      fcl.payer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.limit(35),
    ])
    .then(fcl.decode)

  var unsub = fcl
    .tx(txId)
    .subscribe(txStatus => console.log("txStatus", txId, txStatus))
  var txStatus = await fcl.tx(txId).onceExecuted()
  unsub()

  return txStatus
}

export function Root() {
  const [displayName, setDisplayName] = useState("")
  const [processing, setProcessing] = useState(false)

  async function update(e) {
    console.log("Rawr")
    setProcessing(true)
    await updateDisplayName(displayName)
    setProcessing(false)
  }

  return (
    <div>
      <input
        value={displayName}
        onChange={e => setDisplayName(e.target.value)}
      />
      {processing ? (
        <div>processing...</div>
      ) : (
        <button onClick={update}>Change</button>
      )}
    </div>
  )
}
