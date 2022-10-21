import { useCallback, useEffect, useState } from 'react'
import useAsyncEffect from 'use-async-effect'
import { getUserMedia, streamToEnhancedImage } from './peerjs.service'

const ImageEnhance = () => {
  const [open, setOpen] = useState(false)
  const [base64, setBase64] = useState('')
  const [everySec, setEverySec] = useState(20)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(async () => {
    const stream = await getUserMedia()
    const capture = new ImageCapture(stream.getVideoTracks()[0])
    const { Image } = await streamToEnhancedImage(capture)
    setBase64(Image)
  }, [])

  useEffect(() => {
    if (!open) return
    run()
    const id = setInterval(() => open && run(), everySec * 1000)
    return () => {
      clearInterval(id)
    }
  }, [everySec, open, run])

  return (
    <div className="flex flex-col">
      <label>
        <input
          className="mr-1"
          checked={open}
          onChange={(e) => setOpen(e.target.checked)}
          type="checkbox"
        ></input>
        开启图像增强
      </label>
      {open && <div className="text-red-600">欠费了，哎～</div>}
      <label>
        刷新时间
        <select
          className="mx-1"
          value={everySec}
          onChange={(e) => setEverySec(Number(e.target.value))}
        >
          {[5, 10, 20, 30, 60].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        秒
      </label>
      {base64 && (
        <img className="absolute top-40 right-10" src={`data:image/png;base64,${base64}`}></img>
      )}
    </div>
  )
}

export default ImageEnhance
