import { useEffect, useRef, useState } from 'react'
import YPartyKitProvider from 'y-partykit/provider'
import * as Y from 'yjs'

declare const PARTYKIT_HOST: string | undefined

const partykitHost =
  typeof PARTYKIT_HOST === 'undefined' ? 'localhost:1999' : PARTYKIT_HOST

type YObserverFn = (arg0: Y.YTextEvent, arg1: Y.Transaction) => void

const doc = new Y.Doc()
const provider = new YPartyKitProvider(
  partykitHost || 'localhost:1999',
  'my-document-id',
  doc,
  {
    connect: false,
  },
)

export function App() {
  const ref = useRef<HTMLTextAreaElement | null>(null)

  const yMessage: Y.Text = doc.getText('message')
  const awareness = provider.awareness

  const generateRandomId = () =>
    Date.now().toString(36) + Math.random().toString(36).substring(2)

  const [userId] = useState<string>(generateRandomId())

  useEffect(() => {
    provider.connect()
    awareness.setLocalState({ id: userId })
    const yObserverFn: YObserverFn = (event) => {
      if (ref.current) {
        ref.current.textContent = event.currentTarget.toJSON()
      }
    }
    yMessage.observe(yObserverFn)

    return () => {
      yMessage.unobserve(yObserverFn)
      awareness.setLocalState({
        id: null,
      })
      if (provider.wsconnected) {
        provider.disconnect()
      }
    }
  }, [awareness, userId, yMessage])

  const textAreaOnChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value
    doc.transact(() => {
      yMessage.delete(0, yMessage.length)
      yMessage.insert(0, newValue)
    })
  }
  return (
    <div className='App'>
      {/* <a
        href='/'
        target='_blank'
        rel='noopener noreferrer'
        style={{
          marginRight: '10px',
          color: 'white',
        }}
      >
        New Tab
      </a>
      <span id='conns'>Connections: {awareness.getStates().size}</span> */}
      <textarea
        ref={ref}
        onChange={textAreaOnChange}
        style={{
          width: '100%',
          height: '300px',
        }}
      ></textarea>
    </div>
  )
}
