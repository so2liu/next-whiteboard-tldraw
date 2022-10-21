import Peer, { DataConnection, MediaConnection } from 'peerjs'
import { useEffect, useRef, useState } from 'react'

export const usePeerJS = (id: string) => {
  const [peer, setPeer] = useState<Peer>()
  const [call, setCall] = useState<MediaConnection>()
  const connection = useRef<DataConnection>()
  useEffect(() => {
    if (!id) return
    const peer = new Peer(id)
    peer.on('open', (id) => {
      console.log('My peer ID is: ' + id)
    })
    peer.on('connection', (conn) => {
      connection.current = conn
      conn.on('data', async (data) => {
        console.log(data)
        const userId = data['connect_request']
        if (userId) {
          if (window.confirm(`是否接受 ${userId} 的视频请求`)) {
            conn.send('ok')

            // const call = await connectToNewUser(
            //   peer,
            //   id,
            //   userId,
            //   await getUserMedia(),
            //   div.current,
            //   true
            // )
          }
        }
      })
    })
    peer.on('call', async (call) => {
      call.answer(await getUserMedia())

      const video = document.createElement('video')
      video.id = 'receiver'
      document.getElementById('video-call')?.append(video)
      // bindElementWithStream(div, call.remoteStream)
      // video.srcObject = call.remoteStream
      call.on('stream', (remoteStream) => {
        video.srcObject = remoteStream
      })
      video.addEventListener('loadedmetadata', () => {
        video.play()
      })
      video.addEventListener('ended', () => {
        console.log('video ended')
        video.remove()
      })

      setCall(call)
      call.on('close', () => {
        debugger
        console.log('close from remote')
        video.remove()
        closeCall(call)
      })
    })
    peer.on('error', (err) => window.alert(JSON.stringify(err)))
    setPeer(peer)
    return () => {
      peer.destroy()
      setPeer(undefined)
    }
  }, [id])
  return { peer, call }
}

export const connectToNewUser = async (
  peer: Peer,
  currentUserId: string,
  userId: string,
  stream: MediaStream,
  videoWrapper: HTMLDivElement,
  initHasPermission = false
) => {
  const conn = peer.connect(userId)
  await new Promise((resolve) => {
    conn.on('open', () => resolve(null))
  })
  const hasPermission =
    initHasPermission ||
    (await new Promise((resolve, reject) => {
      conn.send({ connect_request: currentUserId })
      conn.on('data', (data) => {
        console.log('data', data)
        if (data === 'ok') resolve(true)
        else {
          reject()
          conn.close()
        }
      })
    }))
  if (!hasPermission) return
  console.log('1')
  const call = peer.call(userId, stream)
  const video = document.createElement('video')
  video.muted = true
  videoWrapper.append(video)
  bindElementWithStream(video, call)
  call.on('close', () => {
    console.log('close call')
    video.srcObject = null
    video.remove()
  })
  call.on('error', (err) => {
    console.error(err)
    window.alert(JSON.stringify(err))
  })
  return call
}

export const bindElementWithStream = (video: HTMLVideoElement, connection: MediaConnection) => {
  connection.on('stream', (userVideoStream) => {
    video.srcObject = userVideoStream
    video.addEventListener('loadedmetadata', () => {
      video.play()
    })
  })
}

export const closeCall = (call: MediaConnection) => {
  call?.localStream?.getTracks().forEach((track) => track.stop())
  call?.close()
}

export const getUserMedia = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  })
  return stream
}

export const getCapture = async (track: MediaStreamTrack): Promise<string | undefined> => {
  const capture = new ImageCapture(track)
  const imageBitmap = await capture.grabFrame()
  const canvas = document.createElement('canvas')
  canvas.width = imageBitmap.width
  canvas.height = imageBitmap.height
  canvas.getContext('2d')?.drawImage(imageBitmap, 0, 0)
  const dataURL = canvas.toDataURL('image/jpeg')
  return dataURL
}

// const capture = new ImageCapture(steam.getVideoTracks()[0])
export const streamToEnhancedImage = async (capture: ImageCapture) => {
  const imageBitmap = await capture.grabFrame().catch((err) => console.log(err))
  // to base64
  console.log('now')
  if (!imageBitmap) {
    console.warn('empty imageBitmap')
    return
  }
  const canvas = document.createElement('canvas')
  canvas.width = imageBitmap.width
  canvas.height = imageBitmap.height
  canvas.getContext('2d')?.drawImage(imageBitmap, 0, 0)
  const dataURL = canvas.toDataURL('image/jpeg')
  console.log(dataURL.length)
  const body = JSON.stringify({
    base64Img: dataURL.replace('data:image/jpeg;base64,', ''),
  })
  console.log(body.length)
  const res = await fetch('/api/imageEnhancement', {
    method: 'POST',
    body,
  })
  return (await res.json()) as { Image: string }
}
