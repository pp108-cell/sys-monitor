/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type AxiosRequestConfig } from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // timeout: 10000
});
// 添加请求拦截器
instance.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
instance.interceptors.response.use(
  function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    if (response.data) {

      return response.data;
    }
    return response;
  },
  function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);
export const request = (
  method: string,
  url: string,
  data?: any,
  config?: AxiosRequestConfig<any> | undefined
) => {
  switch (method.toLowerCase()) {
    case "get":
      return instance.get(url, config);
    case "post":
      return instance.post(url, data, config);
    case "put":
      return instance.put(url, data, config);
    case "delete":
      return instance.delete(url, config);
    default:
      throw new Error("该种请求方法不被支持");
  }
};

export interface IResponse<T> {
  errCode?: string;
  message?: string;
  data: T;
}
