import useKylinAIService from "@/services/useKylinAIService";
import { useState } from "react";
export interface MessageListProps {
  role: 'system' | 'ai' | 'user',
  content: string
}
const useKylinAI = () => {
  // 消息列表
  const [messageList, setMessageList] = useState<MessageListProps[]>([]);

  const {
    getAIStream,
    getAILLM
  } = useKylinAIService();

  const setUserInMessageList = (userMessage: string) => {
    if (!userMessage.trim()) return;
    setMessageList(prev => [...prev, {
      role: 'user',
      content: userMessage
    }]);
  }

  const InsertAIMessage = () => {
    setMessageList(prev => [...prev, {
      role: 'ai',
      content: ''
    }]);
  }

  const updateAIMessage = (aiMessage: string) => {
    setMessageList(prev => {
      const newList = [...prev];
      const lastMessage = newList[prev.length - 1];
      newList[prev.length - 1] = {
        role: lastMessage.role,
        content: aiMessage
      }
      return newList;
    });
  }

  const getAIMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;
    try {
      InsertAIMessage();
      let aiMessage = '';
      const regExp = /^[3,4,5,6,7]/;
      let selectedOption: undefined | number;
      const aiMessageRtn = await getAIStream(userMessage);
      if (!aiMessageRtn) throw new Error('aiMessageRtn 为空，请检查！');
      const { messageDecoder, messageReader } = aiMessageRtn;
      while (true) {
        const { done, value } = await messageReader.read();
        if (value) {
          const decodeText = messageDecoder.decode(value, { stream: true });
          aiMessage += decodeText;
          if (regExp.test(aiMessage)) {
            selectedOption = Number(aiMessage[0]);
            break;
          }
          else {
            updateAIMessage(aiMessage);
          }
        }
        if (done) {
          console.log(regExp.test(aiMessage));
          break;
        }
      }
      if (selectedOption !== undefined) {
        const res = await getAILLM(selectedOption);
        updateAIMessage(res.data.content);
      }
    } catch (err) {
      console.error(err);
      throw new Error('获取AI消息时发生错误');
    }
  }

  const handleUserSubmit = async (userMessage: string) => {
    setUserInMessageList(userMessage);
    await getAIMessage(userMessage);
  } 

  // 点击推荐项发送消息
  const onClickRecommendItem = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const textContent = e.currentTarget.textContent;
    if (textContent === null || textContent.trim() === '') return;
    setUserInMessageList(textContent);
    await getAIMessage(textContent);
  }
  return {
    handleUserSubmit,
    messageList,
    onClickRecommendItem
  }
}

export default useKylinAI;