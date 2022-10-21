import { Tldraw } from '@tldraw/tldraw'
import React, {useState} from 'react'
import Editor from "@monaco-editor/react";
import { Button, Select, Menu } from 'antd';
import request from './service/request';

const options = [{
	value: 'javascript',
	label: 'JavaScript'
}, {
	value: 'python',
	label: 'Python'
}]

const items = [
	{ label: '代码编辑器', key: 'code' },
	{ label: '白板', key: 'board' }
]
export default function Basic() {
	const [lang, setLang] = useState('javascript');
	const [code, setCode] = useState<string| undefined>('');
	const [result, setResult] = useState([])
	const [menuKey, setMenuKey] = useState('code');
	const onChange = (value: string) => {
		setLang(value)
	}
	const excute = async() => {
		const res = await request.post(`/executeCode`, { type: lang, code })
		console.log(res?.data);
		setResult(res?.data.split('\n') || '');
		return res;
	}
	const codeChange = (value: string | undefined) => {
		setCode(value)
	}

	const onClick = (e: any) => {
		console.log(e.key);
		setMenuKey(e.key)
	}
  return (
    <div className="tldraw">
		<Menu
			className='menu-wrap'
			onClick={onClick}
			style={{ width: 256 }}
			defaultSelectedKeys={['code']}
			mode="inline"
			items={items}
		/>
		<div style={{flex: 1}}>
			{menuKey === 'code' &&
				<>
					<div className="select-wrap">
						<Select options={options} defaultValue='javascript' onChange={onChange} style={{ width: '200px' }}/>
						<Button onClick={excute}>运行</Button>
					</div>
					<div className='code-wrap'>
					<div className='left-editor'>
						<Editor
							height="90vh"
							defaultLanguage="javascript"
							defaultValue="// some comment"
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
				</>
			}
            {menuKey === 'board' && <Tldraw />}
		</div>
    </div>
  )
}
