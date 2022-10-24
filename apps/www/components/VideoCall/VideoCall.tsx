import React, { FC } from 'react'
import { useState } from 'react'
import SelectUserBySearch from '~components/SelectUserBySearch'
import { db } from '~hooks/useLiveUsers'
import ImageEnhance from './ImageEnhance'
import VideoCallV3CallerTencent from './VideoCallV3CallerTencent'

export interface VideoCallProps {}

const VideoCall: FC<VideoCallProps> = () => {
  const [inviteUser, setInviteUser] = useState('')
  const [loading, setLoading] = useState(false)
  const sendInvite = async () => {
    setLoading(true)
    await db.collection('message').add({
      _creatorId: 'whiteboard',
      type: 'private',
      payload: {
        agentid: '111',
        msgtype: 'md',
        touser: inviteUser,
        md: {
          content: `你被邀请参加一个CoBoard白板会议，请点击[链接](https://next.yangl.com.cn/r/interview?u=${inviteUser})参加`,
        },
      },
    })
    setLoading(false)
    window.alert('发送成功')
  }
  return (
    <div
      id="video-call"
      className={`absolute p-4 space-y-2 bottom-14 right-0 bg-slate-300 flex flex-col`}
    >
      <div>
        <SelectUserBySearch value={inviteUser} onChange={(v) => setInviteUser(v)} />
        <button className="ml-4 p-1 border rounded-lg" onClick={sendInvite} type="button">
          {loading ? '发送中...' : '发送邀请'}
        </button>
      </div>
      <VideoCallV3CallerTencent />
      <ImageEnhance />
    </div>
  )
}

export default VideoCall
