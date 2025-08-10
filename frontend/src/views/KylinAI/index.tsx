import SystemLayout from "@/components/SystemLayout";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { Button, Image } from "antd";
import { ArrowUpOutlined, SyncOutlined } from "@ant-design/icons";

import "@/views/KylinAI/index.less"; // 引入样式文件
import useKylinAI, { type MessageListProps } from "@/hooks/useKylinAI";
import TypeWriter from "@/components/TypeWriter";
import logo from "@/assets/icons/logo.svg";
export interface MessageProps {
  content: string
}
const UserContent: FC<MessageProps> = ({ content }) => {
  return (
    <div className="message user-message">
      {content}
    </div>
  )
}

const AIContent: FC<MessageProps> = ({ content }) => {
  return (
    <TypeWriter
      text={content}
      className="message ai-message no-after"
      delay={20}
    />
  )
}

const SystemContent: FC<MessageProps> = ({ content }) => {
  return (
    <div className="system-message message">
      {content}
    </div>
  )
}

const ChatContent: FC<{ messageList: MessageListProps[] }> = ({ messageList }) => {
  return messageList.map((message, index) => {
    switch (message.role) {
      case 'ai':
        return <AIContent content={message.content} key={index} />
      case 'user':
        return <UserContent content={message.content} key={index} />
      case 'system':
        return <SystemContent content={message.content} key={index} />
    }
  });
}
const KylinAIInitComponent: FC<{
  onClickRecommendItem: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}> = ({
  onClickRecommendItem
}) => {
    const recommendtions = [
      {
        data: ['多核CPU单核心过载', '内存占用异常', '磁盘空间不足警告', '网络延迟过高', 'CPU占用率异常偏低', '磁盘I/O性能瓶颈'],
      },
      {
        data: ['CPU上下文切换频率', '磁盘IOPS性能瓶颈', '僵尸进程清理检查', '网络丢包率统计', '系统响应时间', 'TCP连接状态分布'],
      }]
    const [currentRecommendtion, setCurrentRecommendtion] = useState(0)
    return (
      <>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', alignSelf: 'center' }}><Image preview={false} src={logo} alt="logo" style={{ width: '60px', height: '60px' }} />HELLO WORLD</h1>
        <div className="chat-content-init-recommendation">
          <div className="chat-content-init-recommendation-header">
            <div className="chat-content-init-recommendation-header-left">
              猜你想问
            </div>
            <div className="chat-content-init-recommendation-header-right" onClick={() => setCurrentRecommendtion(currentRecommendtion ? 0 : 1)}>
              <SyncOutlined />
              换一批
            </div>
          </div>
          <div className="chat-content-init-recommendation-content">
            {
              recommendtions[currentRecommendtion].data.map((item, index) => (
                <div
                  key={index}
                  onClick={onClickRecommendItem}
                  className="chat-content-init-recommendation-content-item-wrapper">
                  <div className="chat-content-init-recommendation-content-item">
                    {item}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </>
    )
  }
const KylinAI: FC = () => {
  const [userInput, setUserInput] = useState('');
  const [isEmpty, setIsEmpty] = useState(true);
  const { handleUserSubmit, messageList, onClickRecommendItem } = useKylinAI();

  const chatInputRef = useRef<HTMLDivElement | null>(null);
  const chatContentRef = useRef<HTMLDivElement | null>(null);


  // 检查输入框是否真正为空的函数
  const checkIfEmpty = (element: HTMLDivElement) => {
    if (!element) return true;

    // 获取纯文本内容，去除HTML标签
    const textContent = element.textContent || element.innerText || '';
    // 检查是否只包含空白字符
    const isReallyEmpty = textContent.trim() === '';

    setIsEmpty(isReallyEmpty);
    return isReallyEmpty;
  };

  // 处理输入事件
  const handleInput = () => {
    if (chatInputRef.current) {
      const textContent = chatInputRef.current.textContent || '';
      setUserInput(textContent);
      checkIfEmpty(chatInputRef.current);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // 处理提交
  const handleSubmit = async () => {
    if (!chatInputRef.current || isEmpty) return;

    const message = userInput.trim();
    if (!message) return;

    try {
      // 清空输入框
      if (chatInputRef.current) {
        chatInputRef.current.textContent = '';
        setUserInput('');
        setIsEmpty(true);
      }
      await handleUserSubmit(message);
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  };

  // 监听输入框变化
  useEffect(() => {
    const element = chatInputRef.current;
    if (!element) return;

    // 初始检查
    checkIfEmpty(element);

    // 监听各种可能改变内容的事件
    const events = ['input', 'paste', 'keyup', 'blur'];

    const handleChange = () => {
      handleInput();
    };

    events.forEach(event => {
      element.addEventListener(event, handleChange);
    });

    return () => {
      events.forEach(event => {
        element.removeEventListener(event, handleChange);
      });
    };
  }, []);

  useEffect(() => {
    if (chatContentRef.current) {
      const lastChild = chatContentRef.current.lastElementChild;
      if (lastChild) {
        lastChild.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  }, [messageList]);

  return (
    <SystemLayout>
      <div className="chat-container">
        <header className="chat-header">
          Kylin智能运维管家
        </header>
        <div className="chat-content" ref={chatContentRef}>
          {
            messageList.length > 0 ? (
              <ChatContent messageList={messageList} />
            ) : (
              <div className="chat-content-init">
                <KylinAIInitComponent onClickRecommendItem={onClickRecommendItem} />
              </div>
            )
          }
        </div>
        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <div
              ref={chatInputRef}
              contentEditable
              data-placeholder="Reply to Kylin AI..."
              className={`chat-input ${isEmpty ? 'is-empty' : 'has-content'}`}
              onKeyDown={handleKeyDown}
              suppressContentEditableWarning={true}
            />
            <div className="chat-input-submit-wrapper">
              <Button
                className="chat-input-submit"
                onClick={handleSubmit}
                disabled={isEmpty}
              >
                <ArrowUpOutlined className="chat-input-submit-icon" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SystemLayout>
  );
};

export default KylinAI;