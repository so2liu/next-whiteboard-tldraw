import { MediaConnection } from 'peerjs'
import { useEffect, useRef, useState } from 'react'
import { useCurrentUserId } from '~hooks/useLiveUsers'
import { usePeerInstance } from './VideoCallV3Caller'
import { getUserMedia } from './peerjs.service'

const VideoCallV3Receiver = () => {
  const { u, roomId } = useCurrentUserId()
  const [displayVideoElement, setDisplayVideoElement] = useState(false)
  const peer = usePeerInstance(`${roomId}-${u}`)

  useEffect(() => {
    ;(window as any).myReceiverPeer = peer
  }, [peer])

  const remoteRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    let streamRef: MediaStream
    let callRef: MediaConnection
    console.log('mount peer onCall', peer)
    peer?.on(
      'call',
      async (call) => {
        console.log('onCall', call)
        callRef = call
        const stream = await getUserMedia()
        call.answer(stream)
        call.on('stream', (remoteStream) => {
          streamRef = remoteStream
          setDisplayVideoElement(true)
          if (remoteRef.current) remoteRef.current.srcObject = remoteStream
        })
        call.on('close', () => {
          setDisplayVideoElement(false)
        })
      },
      [peer]
    )

    return () => {
      streamRef?.getTracks().forEach((track) => track.stop())
      callRef?.close()
    }
  }, [peer])

  return (
    <div>
      <h1>Receiver</h1>
      {displayVideoElement && <video ref={remoteRef} autoPlay />}
    </div>
  )
}

export default VideoCallV3Receiver
