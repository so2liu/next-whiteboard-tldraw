import Peer, { MediaConnection } from 'peerjs'
import React, { FC, useEffect, useState } from 'react'
import { useRef } from 'react'
import { closeConnection, connectToNewUser, getUserMedia, usePeerJS } from './peerjs.service'

export interface VideoCallProps {}

const VideoCall: FC<VideoCallProps> = () => {
  const ref = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentUserId, setCurrentUserId] = useState<string>()
  const [targetUserId, setTargetUserId] = useState<string>()
  const peer = usePeerJS(currentUserId)
  const connectionRef = useRef<MediaConnection>()

  return (
    <div className={`absolute h-96 top-4 left-1/3 bg-white`}>
      <h1>VideoCall Component</h1>
      <div ref={ref}></div>
      {/* <video ref={videoRef} muted autoPlay></video> */}
      <label htmlFor="currentUserId">
        currentUserId:
        <input
          type="text"
          value={currentUserId}
          onChange={(e) => setCurrentUserId(e.target.value)}
        />
      </label>
      <label htmlFor="targetUserId">
        targetUserId:
        <input type="text" value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} />
      </label>
      <button
        onClick={async () => {
          const stream = await getUserMedia()
          // videoRef.current.srcObject = stream
          if (targetUserId) {
            connectionRef.current = connectToNewUser(peer, targetUserId, stream, ref.current!)
          }
        }}
      >
        连接
      </button>
      <button
        onClick={() => {
          console.log('closeConnection')
          getUserMedia().then((stream) => stream.getTracks().forEach((track) => track.stop()))
          if (connectionRef.current) {
            console.log('closeConnection')
            closeConnection(connectionRef.current)
          }
        }}
      >
        断开
      </button>
    </div>
  )
}

export default VideoCall
