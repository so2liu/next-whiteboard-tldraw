import Peer, { DataConnection, MediaConnection } from 'peerjs'
import { useCallback, useEffect } from 'react'
import { useState } from 'react'
import { useRef } from 'react'
import { useCurrentUserId } from '~hooks/useLiveUsers'
import { getUserMedia, streamToEnhancedImage } from './peerjs.service'

interface Props {
  remoteId: string
}
const VideoCall = (props: Props) => {
  const { u: localId } = useCurrentUserId()
  const [withEnhancement, setWithEnhancement] = useState(false)
  const [base64, setBase64] = useState<string>('')

  const [peer, setPeer] = useState<Peer>()
  useEffect(() => {
    if (!localId) return
    const peer = new Peer(localId)
    setPeer(peer)
    return () => {
      peer.destroy()
    }
  }, [localId])

  const localRef = useRef<HTMLVideoElement>(null)
  const remoteRef = useRef<HTMLVideoElement>(null)
  //   const [peer, setPeer] = useState<Peer>()
  const [stream, setStream] = useState<MediaStream>()
  const [call, setCall] = useState<MediaConnection>()

  useEffect(() => {
    peer?.on('open', (id: string) => {
      const conn = peer.connect(props.remoteId)
      console.log('My peer ID is: ' + id)
      peer.on('error', console.error)

      peer.on('connection', (conn) => {
        conn.on('close', () => {
          console.log('connection closed')
        })
      })
    })
  }, [peer, props.remoteId])

  useEffect(() => {
    peer?.on('call', async (call) => {
      ;(window as any).myCall = call
      setCall(call)
      const stream = await getUserMedia()
      setStream(stream)
      localRef.current.srcObject = stream

      call.answer(stream) // Answer the call with an A/V stream.
      call.on('stream', (remoteStream) => {
        // Show stream in some video/canvas element.
        remoteRef.current.srcObject = remoteStream
      })
      call.on('close', () => {
        console.log('call closed')
        stream?.getTracks().forEach((track) => track.stop())
        remoteRef.current.srcObject = null
        localRef.current.srcObject = null
      })
    })
    return () => {
      peer?.off('call')
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [peer, stream])

  const callUser = useCallback(async () => {
    const localStream = await getUserMedia()
    localRef.current.srcObject = localStream

    if (withEnhancement) {
      const id = setInterval(async () => {
        const capture = new ImageCapture(localStream.getVideoTracks()[0])
        const res = await streamToEnhancedImage(capture)
        if (!res) {
          clearInterval(id)
          setBase64('')
        }
        setBase64(res.Image)
        console.log(res.Image.length)
      }, 7000)
    }

    const call = peer.call(props.remoteId, localStream)
    setCall(call)
    if (!call) {
      debugger
    }
    call.on('stream', (remote) => {
      remoteRef.current.srcObject = remote
    })
    call.on('close', () => {
      console.log('call closed @caller')
      call
    })
  }, [peer, props.remoteId, withEnhancement])

  const endCall = useCallback(() => {
    localRef.current.srcObject = null
    remoteRef.current.srcObject = null
    stream?.getTracks().forEach((track) => track.stop())
    call?.close()
  }, [call, stream])

  return (
    <div className="flex flex-col space-y-4">
      <video className="w-44" ref={localRef} src="" autoPlay muted></video>
      <video className="w-44" ref={remoteRef} src="" autoPlay muted></video>
      {base64 && (
        <img className="absolute top-40 right-10" src={`data:image/png;base64,${base64}`}></img>
      )}
      <div className="space-x-10">
        <button className="border px-4 py-1" onClick={callUser}>
          拨打
        </button>
        <button className="border px-4" onClick={endCall}>
          挂断
        </button>
      </div>
      <label htmlFor="">
        <input
          type="checkbox"
          checked={withEnhancement}
          onChange={(e) => setWithEnhancement(e.target.checked)}
        />
        开启自动图片增强
      </label>
      {withEnhancement && <span className="text-red-500">（开启后，每7秒自动截图）</span>}
    </div>
  )
}

export default VideoCall
