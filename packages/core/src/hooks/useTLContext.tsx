import * as React from 'react'
import type { Inputs } from '+inputs'
import type { TLCallbacks, TLShape, TLBounds, TLPageState, TLShapeUtils } from '+types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TLContextType<T extends TLShape, E extends Element, M = any> {
  id?: string
  callbacks: Partial<TLCallbacks<T>>
  shapeUtils: TLShapeUtils<T, E, M>
  rPageState: React.MutableRefObject<TLPageState>
  rSelectionBounds: React.MutableRefObject<TLBounds | null>
  inputs: Inputs
}

export const TLContext = React.createContext({} as TLContextType<TLShape, Element>)

export function useTLContext() {
  const context = React.useContext(TLContext)

  return context
}