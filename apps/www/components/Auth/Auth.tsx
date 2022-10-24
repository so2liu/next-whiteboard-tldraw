import React, { FC } from 'react'
import { useEffect } from 'react'
import { app, auth, useCheckInOut, useCurrentUserId, useLiveUsers } from '~hooks/useLiveUsers'
import styles from './Auth.module.css'

const login4Pd = async (code: string) => {
  const loginState = await auth.getLoginState()
  if (loginState?.isCustomAuth) {
    console.log('已登录')
    return
  } else {
    const res = await app.callFunction({
      name: 'auth-by-code-4pd-plus',
      data: {
        code,
      },
    })
    await auth.customAuthProvider().signIn(res.result.ticket)
  }
}

interface AuthProps {}

const Auth: FC<AuthProps> = () => {
  const { u } = useCurrentUserId()
  useCheckInOut(u)
  const users = useLiveUsers()
  useEffect(() => {
    login4Pd('fake')
  }, [])
  return <div className={styles.Auth}>Auth Component</div>
}

export default Auth
