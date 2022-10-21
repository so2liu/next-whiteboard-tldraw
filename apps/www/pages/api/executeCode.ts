import { spawn } from 'child_process'
import * as fs from 'fs'
import { NextApiRequest, NextApiResponse } from 'next'

type Code = {
  code: string
  type: string
}

export default async function excute(req: NextApiRequest, res: NextApiResponse) {
  const data = JSON.parse(req.body) as Code
  const payload = await new Promise((resolve, reject) => {
    const { code, type } = data
    let op = ''
    let suffix = ''
    switch (type) {
      case 'javascript':
        op = 'node'
        suffix = 'js'
        break
      case 'python':
        op = 'python'
        suffix = 'py'
        break
    }
    const file = `${__dirname}/test.${suffix}`
    fs.writeFile(file, code, (err2) => {
      if (err2) {
        console.log(err2)
      }
    })
    console.log(file)
    const child = spawn(op, [file])
    const chunks = []
    // fs.unlink(file, (err) => {
    //     if (err) console.log(err);
    //     console.log(`${file} was deleted`);
    // });
    console.log(child)
    // return { data: child };
    // use child.stdout.setEncoding('utf8'); if you want text chunks
    child.stdout.on('data', (chunk) => {
      // data from the standard output is here as buffers
      chunks.push(chunk)
    })
    child.stderr.on('data', (chunk) => {
      // data from the standard output is here as buffers
      chunks.push(chunk)
    })
    // since these are streams, you can pipe them elsewhere
    child.on('close', (code) => {
      console.log(`child process exited with code ${code}`)
      fs.unlink(file, (err) => {
        if (err) console.log(err)
        console.log(`${file} was deleted`)
      })
      resolve({ data: Buffer.from(chunks.join('')).toString() })
      return { data: child.stdout }
    })
  })
  res.send(payload)
}
