import type { PartyKitServer } from 'partykit/server'
import { onConnect as yOnConnect } from 'y-partykit'

export default {
  onConnect(ws, room) {
    console.log(room.id, room.connections.size)
    yOnConnect(ws, room, { persist: true })
  },
} satisfies PartyKitServer
