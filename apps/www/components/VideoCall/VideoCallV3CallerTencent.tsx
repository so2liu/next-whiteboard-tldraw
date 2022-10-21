import { useCallback, useEffect, useRef, useState } from 'react'
import TRTC, { RemoteStream } from 'trtc-js-sdk'
import useAsyncEffect from 'use-async-effect'
import { useCurrentUserId } from '~hooks/useLiveUsers'
import MyVideo from './MyVideo'
import { genTestUserSig } from './gerateSig'

const VideoCallV3CallerTencent = () => {
  const { u: localId, roomId: rootId } = useCurrentUserId()
  const [streams, setStreams] = useState<RemoteStream[]>([])

  useAsyncEffect(async () => {
    const { sdkAppId, userSig } = genTestUserSig(localId)
    const client = TRTC.createClient({
      mode: 'rtc',
      sdkAppId,
      userId: localId,
      useStringRoomId: true,
      userSig,
    })
    console.log(client)

    client.on('stream-added', (event) => {
      console.log('stream-added', event)
      client.subscribe(event.stream)
    })

    client.on('stream-subscribed', (event) => {
      setStreams((s) => [...s, event.stream])
      const remoteStream = event.stream
      setTimeout(() => {
        const id = remoteStream.getId()
        console.log({ id })
        remoteStream.play(id)
      }, 0)
    })

    await client.join({ roomId: rootId })
    console.log('join success')
    const localStream = TRTC.createStream({
      audio: false,
      video: true,
      userId: localId,
    })
    await localStream.initialize()
    await client.publish(localStream)

    console.log('发布成功')
    return () => {
      client.leave()
    }
  }, [localId, rootId])
  console.log(streams)

  return (
    <div>
      <h1>你的伙伴们</h1>
      <MyVideo />
      {streams.map((stream) => (
        <div className="w-60" key={stream.getId()} id={stream.getId()}>
          {stream.getUserId()}
        </div>
      ))}
    </div>
  )
}

export default VideoCallV3CallerTencent
