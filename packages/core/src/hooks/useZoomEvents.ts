/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as React from 'react'
import { useTLContext } from './useTLContext'
import { useGesture } from '@use-gesture/react'
import { Vec } from '@tldraw/vec'

// Capture zoom gestures (pinches, wheels and pans)
export function useZoomEvents<T extends Element>(ref: React.RefObject<T>) {
  const rOriginPoint = React.useRef<number[] | undefined>(undefined)
  const rPinchPoint = React.useRef<number[] | undefined>(undefined)
  const rDelta = React.useRef<number[]>([0, 0])

  const { inputs, callbacks } = useTLContext()

  React.useEffect(() => {
    const preventGesture = (event: TouchEvent) => {
      event.preventDefault()
    }

    // @ts-ignore
    document.addEventListener('gesturestart', preventGesture)
    // @ts-ignore
    document.addEventListener('gesturechange', preventGesture)

    return () => {
      // @ts-ignore
      document.removeEventListener('gesturestart', preventGesture)
      // @ts-ignore
      document.removeEventListener('gesturechange', preventGesture)
    }
  }, [])

  useGesture(
    {
      onWheel: ({ event: e, delta }) => {
        const elm = ref.current
        if (!(e.target === elm || elm?.contains(e.target as Node))) return
        e.preventDefault()

        if (inputs.isPinching) return

        if (Vec.isEqual(delta, [0, 0])) return

        const info = inputs.pan(delta, e as WheelEvent)
        callbacks.onPan?.(info, e)
      },
      onPinchStart: ({ origin, event }) => {
        const elm = ref.current
        if (!(event.target === elm || elm?.contains(event.target as Node))) return

        const info = inputs.pinch(origin, origin)
        inputs.isPinching = true
        callbacks.onPinchStart?.(info, event)
        rPinchPoint.current = info.point
        rOriginPoint.current = info.origin
        rDelta.current = [0, 0]
      },
      onPinchEnd: ({ origin, event }) => {
        const elm = ref.current
        if (!(event.target === elm || elm?.contains(event.target as Node))) return

        const info = inputs.pinch(origin, origin)

        inputs.isPinching = false
        callbacks.onPinchEnd?.(info, event)
        rPinchPoint.current = undefined
        rOriginPoint.current = undefined
        rDelta.current = [0, 0]
      },
      onPinch: ({ delta, origin, event }) => {
        const elm = ref.current
        if (!(event.target === elm || elm?.contains(event.target as Node))) return
        if (!rOriginPoint.current) throw Error('No origin point!')

        const info = inputs.pinch(origin, rOriginPoint.current)

        const trueDelta = Vec.sub(info.delta, rDelta.current)

        rDelta.current = info.delta

        callbacks.onPinch?.(
          {
            ...info,
            point: info.point,
            origin: rOriginPoint.current,
            delta: [...trueDelta, -delta[0]],
          },
          event
        )

        rPinchPoint.current = origin
      },
    },
    {
      target: window,
      eventOptions: { passive: false },
    }
  )
}