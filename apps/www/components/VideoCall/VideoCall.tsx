import React, { FC } from 'react'
import ImageEnhance from './ImageEnhance'
import VideoCallV3CallerTencent from './VideoCallV3CallerTencent'

export interface VideoCallProps {}

const VideoCall: FC<VideoCallProps> = () => {
  return (
    <div
      id="video-call"
      className={`absolute p-4 space-y-2 top-14 right-0 bg-slate-300 flex flex-col`}
    >
      <VideoCallV3CallerTencent />
      <ImageEnhance />
    </div>
  )
}

export default VideoCall
