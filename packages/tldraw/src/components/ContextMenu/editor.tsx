import Editor from '@monaco-editor/react'
import { Button, Input, Select } from 'antd'
import React, { useState } from 'react'
import './index.css'

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
  data: {
    code: string | undefined
    lang: string
    result: string[]
  }
  onChange: (lang: string, code: string | undefined, result: string[], name: string) => void
}
export default function DrawerEditor(props: Props) {
  const [lang, setLang] = useState('javascript')
  const [code, setCode] = useState<string | undefined>('')
  const [result, setResult] = useState(props.data?.result || [])
  const [name, setName] = useState<string>('')
  React.useEffect(() => {
    props.onChange(lang, code, result, name)
  }, [lang, code, result, name])
  const onChange = (value: string) => {
    setLang(value)
  }
  const excute = async () => {
    const res = await fetch('/api/executeCode', {
      method: 'POST',
      body: JSON.stringify({
        type: lang,
        code,
      }),
    })
    const payload = await res.json()
    console.log(payload)
    setResult(payload.data?.split('\n') || '')
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
          style={{ width: '200px', marginBottom: '16px', marginRight: '16px' }}
        />
        <Select
          options={options}
          defaultValue="javascript"
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
