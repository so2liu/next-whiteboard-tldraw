import Editor from '@monaco-editor/react'
import { Button, Input, Select } from 'antd'
import React, { useState } from 'react'
import { useContainer, useTldrawApp } from '~hooks'
import request from '~service/request'

const options = [
  {
    value: 'javascript',
    label: 'JavaScript',
  },
  {
    value: 'python',
    label: 'Python',
  },
]

interface Props {
  data?: {
    code: string | undefined
    lang: string
    result: string[]
    name: string
  }
  onChange: (lang: string, code: string | undefined, result: string[], name: string) => void
}
export default function DrawerEditor(props: Props) {
  const app = useTldrawApp()
  const { selectedIds } = app
  const shapes: any = app.shapes
  const [curShape, setCurShape] = React.useState<any>(undefined)
  const [lang, setLang] = useState('javascript')
  const [code, setCode] = useState<string | undefined>('')
  const [result, setResult] = useState([])
  const [name, setName] = useState<string>('javascript')
  React.useEffect(() => {
    const shape = shapes.find((shape: any) => shape.id === selectedIds[0])
    setCurShape(shape)
  }, [shapes])

  React.useEffect(() => {
    if (curShape) {
      setLang(curShape.data?.lang || 'javascript')
      setCode(curShape.data?.code || '')
      setResult(curShape.data?.result || [])
      setName(curShape.data?.name || 'javascript')
    }
  }, [curShape])
  React.useEffect(() => {
    props.onChange(lang, code, result, name)
  }, [lang, code, result, name])
  const onChange = (value: string) => {
    setLang(value)
  }
  const excute = async () => {
    const res: any = await request.post(`/comment`, { type: lang, code })
    setResult(res?.split('\n') || '')
    return res
  }
  const codeChange = (value: string | undefined) => {
    setCode(value)
  }

  const changName = (e: any) => {
    setName(e.target.value)
  }
  return (
    <div className="editor">
      <div className="select-wrap">
        请输入名称：
        <Input
          onChange={changName}
          value={name}
          defaultValue="javascript"
          style={{ width: '200px', marginBottom: '16px', marginRight: '16px' }}
        />
        <Select
          options={options}
          defaultValue="javascript"
          value={lang}
          onChange={onChange}
          style={{ width: '200px' }}
        />
        <Button onClick={excute}>运行</Button>
      </div>
      <div className="code-wrap">
        <div className="left-editor">
          <Editor
            height="90vh"
            defaultLanguage={props.data?.lang || 'javascript'}
            defaultValue={props.data?.code}
            value={code}
            language={lang}
            onChange={codeChange}
          />
        </div>
        <div className="right">
          {result.map((res, index) => {
            return <div key={index}>{res}</div>
          })}
        </div>
      </div>
    </div>
  )
}
