import { useRef } from 'react'
import { useEffect } from 'react'
import { getUserMedia } from './peerjs.service'

const MyVideo = () => {
  const ref = useRef<HTMLVideoElement>()
  useEffect(() => {
    getUserMedia().then((stream) => {
      ref.current.srcObject = stream
    })

    return () => {
      const current = ref
      current.current.srcObject = null
      getUserMedia().then((stream) => {
        stream.getTracks().forEach((track) => track.stop())
      })
    }
  }, [])
  return (
    <div className="w-60">
      我自己
      <video ref={ref} muted autoPlay />
    </div>
  )
}

export default MyVideo
