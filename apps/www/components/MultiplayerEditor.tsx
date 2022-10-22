import { TDUserStatus, Tldraw, TldrawProps, useFileSystem } from '@tldraw/tldraw'
import 'antd/dist/antd.css'
import * as React from 'react'
import { useCallback } from 'react'
import { useMultiplayerAssets } from '~hooks/useMultiplayerAssets'
import { useMultiplayerState } from '~hooks/useMultiplayerState'
import { useUploadAssets } from '~hooks/useUploadAssets'
import { styled } from '~styles'
import { RoomProvider } from '~utils/liveblocks'
import VideoCall from './VideoCall/VideoCall'

interface Props {
  roomId: string
}

const MultiplayerEditor = ({ roomId }: Props) => {
  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        id: 'DEFAULT_ID',
        user: {
          id: 'DEFAULT_ID',
          status: TDUserStatus.Connecting,
          activeShapes: [],
          color: 'black',
          point: [0, 0],
          selectedIds: [],
        },
      }}
    >
      <Editor roomId={roomId} />
      <VideoCall />
    </RoomProvider>
  )
}

// Inner Editor

function Editor({ roomId }: Props) {
  const fileSystemEvents = useFileSystem()
  const { error, ...events } = useMultiplayerState(roomId)
  const { onAssetCreate, onAssetDelete } = useMultiplayerAssets()
  const { onAssetUpload } = useUploadAssets()

  const cursor = useCallback((props: { id: string; color: string }) => {
    const userId = props.id.split('_')[0] ?? props.id
    return (
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35" fill="none" fillRule="evenodd">
          <g fill="rgba(0,0,0,.2)" transform="translate(1,1)">
            <path d="m12 24.4219v-16.015l11.591 11.619h-6.781l-.411.124z" />
            <path d="m21.0845 25.0962-3.605 1.535-4.682-11.089 3.686-1.553z" />
          </g>
          <g fill="white">
            <path d="m12 24.4219v-16.015l11.591 11.619h-6.781l-.411.124z" />
            <path d="m21.0845 25.0962-3.605 1.535-4.682-11.089 3.686-1.553z" />
          </g>
          <g fill={props.color}>
            <path d="m19.751 24.4155-1.844.774-3.1-7.374 1.841-.775z" />
            <path d="m13 10.814v11.188l2.969-2.866.428-.139h4.768z" />
          </g>
        </svg>
        <div style={{ color: props.color, fontSize: 24 }}>{userId}</div>
      </div>
    )
  }, [])

  if (error) return <LoadingScreen>Error: {error.message}</LoadingScreen>

  return (
    <div className="tldraw">
      <Tldraw
        autofocus
        disableAssets={false}
        showPages={false}
        onAssetCreate={onAssetCreate}
        onAssetDelete={onAssetDelete}
        onAssetUpload={onAssetUpload}
        components={{
          Cursor: cursor,
        }}
        {...fileSystemEvents}
        {...events}
      />
    </div>
  )
}

export default MultiplayerEditor

const LoadingScreen = styled('div', {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})
