import Peer, { MediaConnection } from 'peerjs'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useCurrentUserId } from '~hooks/useLiveUsers'
import { getUserMedia } from './peerjs.service'

export const usePeerInstance = (localId: string) => {
  const [peer, setPeer] = useState<Peer>()
  useEffect(() => {
    if (!localId) return
    const peer = new Peer(localId)
    peer?.on('open', (id: string) => {
      console.log('My peer ID is: ' + id)
      peer.on('error', console.error)

      peer.on('connection', (conn) => {
        conn.on('open', () => {
          console.log('connection opened')
        })
        conn.on('close', () => {
          console.log('connection closed')
        })
      })
    })

    setPeer(peer)
    return () => {
      peer.destroy()
    }
  }, [localId])
  return peer
}

interface Props {
  remoteId: string
}
const VideoCallV3Caller = (props: Props) => {
  const { remoteId } = props
  const { u: localId, roomId: rootId } = useCurrentUserId()
  const peer = usePeerInstance(`${rootId}-${localId}`)
  const streamRef = useRef<MediaStream>()

  useEffect(() => {
    setTimeout(() => {
      console.log(peer?.connect)
      ;(window as any).myCallerPeer = peer
    }, 3000)
  }, [peer])

  //   useEffect(() => {
  //     peer?.on('open', () => {
  //       const conn = peer.connect(remoteId)
  //       conn.on('error', (err) => window.alert(err.message))
  //     })
  //   }, [peer, remoteId])

  const [call, setCall] = useState<MediaConnection>()

  const remoteRef = useRef<HTMLVideoElement>(null)
  const callUser = useCallback(async () => {
    console.log('call', remoteId)
    streamRef.current = await getUserMedia()
    const call = peer.call(remoteId, streamRef.current)
    await new Promise((resolve) => {
      setTimeout(resolve, 1000)
    })
    call?.on('stream', (remoteStream) => {
      // Show stream in some video/canvas element.
      console.log('stream comming')
      if (remoteRef.current) remoteRef.current.srcObject = remoteStream
    })
    call?.on('error', console.error)
  }, [peer, remoteId])

  const stopCall = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    remoteRef.current.srcObject = null
    call?.close()
    setCall(undefined)
  }, [call])

  return (
    <div>
      <h1>Caller</h1>
      <video ref={remoteRef} autoPlay muted />
      <div className="space-x-4">
        <button type="button" className="border" onClick={callUser}>
          拨打
        </button>
        <button type="button" className="border" onClick={stopCall}>
          挂断
        </button>
      </div>
    </div>
  )
}

export default VideoCallV3Caller
