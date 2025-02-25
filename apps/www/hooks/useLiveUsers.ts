import cloudbase from '@cloudbase/js-sdk'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

export const app = cloudbase.init({
  env: 'cloudbase-prepaid-4eiods2e0a26e3',
})

export const auth = app.auth({
  persistence: 'local',
})

export const db = app.database()

const changeLiveStatus = (userId: string, status: boolean) => {
  if (!userId) return
  console.log(userId)
  return db.collection('user-live').doc(userId).set({
    whiteboardLive: status,
  })
}

export const useCurrentUserId = () => {
  const router = useRouter()
  const { u, r, id } = router.query as {
    u: string | undefined
    r: string | undefined
    id: string | undefined
  }
  return { u, r, roomId: id }
}

export const useCheckInOut = (userId: string) => {
  useEffect(() => {
    if (!userId) return
    if (userId) changeLiveStatus(userId, true)
    return () => {
      if (userId) changeLiveStatus(userId, false)
    }
  }, [userId])
}

export const useLiveUsers = () => {
  const [liveUsers, setLiveUsers] = useState<{ _id: string; whiteboardLive: boolean }[]>([])
  const listner = useCallback((snapshot: any) => {
    setLiveUsers(snapshot.docs)
  }, [])
  useEffect(() => {
    db.collection('user-live')
      .where({
        whiteboardLive: true,
      })
      .watch({
        onChange: listner,
        onError: console.error,
      })
  }, [listner])
  return liveUsers
}
