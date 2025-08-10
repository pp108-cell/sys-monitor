import { request, type IResponse } from "../request";
import type { LLMBody } from "./type";

const useKylinAIService = () => {
  const getAIStream = (
    userMessage: string
  ): Promise<{
    messageReader: ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>;
    messageDecoder: TextDecoder;
  }> => {
    return new Promise((resolve, reject) => {
      fetch(
        `${import.meta.env.VITE_API_AI_URL}/stream?prompt=${encodeURIComponent(
          userMessage
        )}`,
        {
          method: "get",
          headers: {
            "Content-Type": "application/json",
            'ngrok-skip-browser-warning': 'true',  // ngrok专用
          },
        }
      )
        .then((res) => {
          if (!res.ok) return reject(new Error("无法连接到流式输出服务！"));
          if (!res.body) return reject(new Error("流式输出响应体为空"));
          return resolve({
            messageReader: res.body.getReader(),
            messageDecoder: new TextDecoder(),
          });
        })
        .catch((err) => reject(new Error(err)));
    });
  };

  const getAILLM = (type: number): Promise<IResponse<LLMBody>> => {
    return request("get", `/llm/LLMapi?res=${type}`);
  }
  return {
    getAIStream,
    getAILLM
  }
}

export default useKylinAIService;