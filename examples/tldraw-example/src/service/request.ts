import axios, { AxiosStatic } from 'axios';
import qs from 'qs';
import { notification } from 'antd';

interface ResponseData<T> {
    code: number;
    message: string;
    data?: T;
}

// 根请求路径
axios.defaults.baseURL = '/api';
axios.defaults.timeout = 60000;

// ERROR Code
const ERROR_CODE_MAP: { [key: string]: string } = {
    400: '发出的请求有错误，请检查请求参数',
    401: '用户没有权限',
    403: '禁止访问',
    404: '请求的地址不存在',
    406: '无法访问',
    410: '访问出错',
    422: '访问出错',
    500: '服务器发生错误，请检查服务器',
    502: '访问出错',
    503: '服务器出问题，请稍后再试',
    504: '访问超时，请稍后再试',
};
axios.interceptors.request.use((request) => {
    if (
        request.data &&
        request.headers &&
        request.headers['Content-Type'] &&
        (request.headers['Content-Type'] as string).indexOf('application/x-www-form-urlencoded') !== -1
    ) {
        request.data = qs.stringify(request.data);
    }
    return request;
});
axios.interceptors.response.use(
    (response) => {
        if (response && (response.status === 200 || response.status === 201)) {
            // 根据后端返回的code，处理不同场景
            if (response.data && response.data.code === '400') {
                notification.info({
                    message: ERROR_CODE_MAP[response.data.code],
                    description: '',
                    duration: 5,
                });
                return;
            }
            return response.data;
        }
        // 其他错误或特定需求状态码
        console.log(`请求错误,错误码：${response.status};错误关键字：${response.statusText}`);

        // 保底返回数据
        return response.data;
    },
    (error) => {
        console.log('ServerError: ', error);
        // 处理HTTP Code错误
        if (error.response && ERROR_CODE_MAP[error.response.status]) {
            notification.error({
                message: ERROR_CODE_MAP[error.response.status],
                description: '',
                duration: 5,
            });
            return;
        }
        return Promise.reject(error);
    },
);
class RequestWrapper {
    private request;

    constructor(axios: AxiosStatic) {
        this.request = axios;
    }

    public get(url: string, params?: object | URLSearchParams): Promise<ResponseData<any> | undefined> {
        return this.request.get(url, { params });
    }

    public getFile(url: string): Promise<ResponseData<any> | undefined> {
        return this.request.get(url, { responseType: 'blob' });
    }

    public post(url: string, data?: object): Promise<ResponseData<any> | undefined> {
        return this.request.post(url, data);
    }

    public export(url: string, data?: object): Promise<ResponseData<any> | undefined> {
        return this.request.post(url, { data, responseType: 'blob', getResponse: true });
    }

    public put(url: string, data?: object): Promise<ResponseData<any> | undefined> {
        return this.request.put(url, data);
    }

    public patch(url: string, data?: object): Promise<ResponseData<any> | undefined> {
        return this.request.patch(url, data);
    }

    public delete(url: string, data?: object): Promise<ResponseData<any> | undefined> {
        return this.request.delete(url, data);
    }

    public original() {
        return this.request;
    }
}

const request = new RequestWrapper(axios);
export default request;
