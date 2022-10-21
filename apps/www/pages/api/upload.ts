import tcb from '@cloudbase/node-sdk'
import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import { createReadStream } from 'fs'

export const config = {
  api: {
    bodyParser: false,
  },
}

const app = tcb.init({
  secretId: process.env.TCL_PRIVATE_ID,
  secretKey: process.env.TCL_PRIVATE_KEY,
  env: process.env.TCL_ENV_ID,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const data = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
    (res, rej) => {
      const form = formidable({})
      form.parse(req, (err, fields, files) => {
        if (err) rej(err)
        else res({ fields, files })
      })
    }
  )

  const file = data.files.myFile[0]
  const result = await app.uploadFile({
    cloudPath: `upload/${file.newFilename}_${file.originalFilename}`,
    fileContent: createReadStream(file.filepath),
  })

  const url = await app.getTempFileURL({
    fileList: [result.fileID],
  })
  res.send(url.fileList[0])

  return
}
