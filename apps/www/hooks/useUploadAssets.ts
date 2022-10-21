import { Utils } from '@tldraw/core'
import { TldrawApp } from '@tldraw/tldraw'
import { useCallback } from 'react'

export function useUploadAssets() {
  const onAssetUpload = useCallback(
    // Send the asset to our upload endpoint, which in turn will send it to AWS and
    // respond with the URL of the uploaded file.

    async (app: TldrawApp, file: File, id: string): Promise<string | false> => {
      const formData = new FormData()

      formData.append('myFile', file)
      debugger

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const upload = (await uploadRes.json()) as {
        fileid: string
        code: 'SUCCESS'
        download_url: string
        mime_type: 'image/png'
        fileID: string
        tempFileURL: string
      }

      console.log(upload)

      return upload.download_url
    },
    []
  )

  return { onAssetUpload }
}
