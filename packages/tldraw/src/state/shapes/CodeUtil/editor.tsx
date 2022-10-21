import React, {useState} from 'react'
import Editor from "@monaco-editor/react";
import { Button, Select } from 'antd';
import request from '~service/request';

const options = [{
	value: 'javascript',
	label: 'JavaScript'
}, {
	value: 'python',
	label: 'Python'
}]

interface Props {
	data: {
		code: string | undefined,
		lang: string,
		result: string[]
	};
	onChange: (lang: string, code: string | undefined, result: string[]) => void;
}
export default function DrawerEditor(props: Props) {
	const [lang, setLang] = useState('javascript');
	const [code, setCode] = useState<string| undefined>('');
	const [result, setResult] = useState(props.data?.result || [])
	React.useEffect(() => {
		props.onChange(lang, code, result);
	}, [lang, code, result])
	const onChange = (value: string) => {
		setLang(value);
	}
	const excute = async() => {
		const res: any = await request.post(`/comment`, {type: lang, code});
		setResult(res?.split('\n') || '');
		return res;
	}
	const codeChange = (value: string | undefined) => {
		setCode(value);
	}

  return (
    <div className="editor">
		<div className="select-wrap">
			<Select options={options} defaultValue='javascript' onChange={onChange} style={{ width: '200px' }}/>
			<Button onClick={excute}>运行</Button>
		</div>
		<div className='code-wrap'>
		<div className='left-editor'>
			<Editor
				height="90vh"
				defaultLanguage={props.data?.lang || "javascript"}
				defaultValue={props.data?.code}
				language={lang}
				onChange={codeChange}
			/>
			</div>
			<div className='right'>
				{result.map((res, index) => {
					return (
						<div key={index}>{res}</div>
					)
				})}
			</div>
		</div>
    </div>
  )
}