import Peer, { MediaConnection } from 'peerjs'
import React, { FC, useEffect, useState } from 'react'
import { useRef } from 'react'
import { useCurrentUserId, useLiveUsers } from '~hooks/useLiveUsers'
import { closeCall, connectToNewUser, getUserMedia, usePeerJS } from './peerjs.service'
import VideoCallV2 from './VideoCallV2'

export interface VideoCallProps {}

const VideoCall: FC<VideoCallProps> = () => {
  // const ref = useRef<HTMLDivElement>(null)
  const [targetUserId, setTargetUserId] = useState<string>('liuyang02')
  const { u: currentUserId } = useCurrentUserId()
  // const { peer, call } = usePeerJS(currentUserId)
  // const callRef = useRef<MediaConnection>()

  return (
    <div
      id="video-call"
      className={`absolute p-4 space-y-2 top-14 right-0 bg-slate-300 flex flex-col`}
    >
      <label htmlFor="currentUserId">当前用户：{currentUserId}</label>
      <label htmlFor="target">
        连线用户：
        <select value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)}>
          {['liuyang02', 'fangleting', 'wangxinyu'].map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
      </label>
      <VideoCallV2 remoteId={targetUserId} />
    </div>
  )
}

export default VideoCall
