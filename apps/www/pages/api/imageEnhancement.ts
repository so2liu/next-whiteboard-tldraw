// Depends on tencentcloud-sdk-nodejs version 4.0.3 or higher
import { NextApiRequest, NextApiResponse } from 'next'
import * as tencentcloud from 'tencentcloud-sdk-nodejs'
import type { ImageEnhancementResponse } from 'tencentcloud-sdk-nodejs/tencentcloud/services/ocr/v20181119/ocr_models'

type RequestBody = {
  base64Img: string
}

const getImageEnhancement = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(400).end()
    return
  }

  console.log('type', typeof req.body)
  console.log(req.body.base64Img.length)
  const { base64Img } = req.body as RequestBody
  console.log(typeof req.body)
  console.log(typeof base64Img)

  if (!base64Img) {
    res.status(400).end('No base64Img')
    return
  }

  const OcrClient = tencentcloud.ocr.v20181119.Client

  // 实例化一个认证对象，入参需要传入腾讯云账户secretId，secretKey,此处还需注意密钥对的保密
  // 密钥可前往https://console.cloud.tencent.com/cam/capi网站进行获取
  const clientConfig = {
    credential: {
      secretId: process.env.TCL_PRIVATE_ID,
      secretKey: process.env.TCL_PRIVATE_KEY,
    },
    region: 'ap-beijing',
    profile: {
      httpProfile: {
        endpoint: 'ocr.tencentcloudapi.com',
      },
    },
  }

  // 实例化要请求产品的client对象,clientProfile是可选的
  const client = new OcrClient(clientConfig)
  let tcbRes: ImageEnhancementResponse
  try {
    console.log('original length', base64Img.length)
    tcbRes = await client.ImageEnhancement({
      ImageBase64: base64Img,
      ReturnImage: 'preprocess',
      TaskType: 1,
    })
    console.log('task 1')
    tcbRes = await client.ImageEnhancement({
      ImageBase64: tcbRes.Image,
      ReturnImage: 'preprocess',
      TaskType: 205,
    })
    console.log('task 205')

    res.send({ status: 'success', ...tcbRes })
  } catch (error) {
    console.log(error)
    res.status(500)
    res.send(tcbRes)
  }
}

export default getImageEnhancement

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
}
