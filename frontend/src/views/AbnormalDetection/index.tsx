import type { FC } from "react";
import SystemLayout from "../../components/SystemLayout";
import './index.less';
import { Flex } from "antd";
import { Space } from 'antd'
import { ZoomInOutlined, FundProjectionScreenOutlined, SafetyCertificateOutlined, AppstoreAddOutlined, FileSearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

//定义页面下方图表项接口
interface IconItem {
  key: string;                // 唯一标识
  icon: React.ReactNode;      // 图标组件
  text: string;               // 文字描述
  link?: string;              // 可选：链接地址
  onClick: () => void;       // 可选：点击回调
}



const AbnormalDetection: FC = () => {
  const navigate = useNavigate();
  const iconItems: IconItem[] = [
    {
      key: '1',
      icon: <FundProjectionScreenOutlined style={{ fontSize: 80 }} />,
      text: '全盘检测',
      onClick: () => console.log('查看代码')
    },
    {
      key: '2',
      icon: <FileSearchOutlined style={{ fontSize: 80 }} />,
      text: '快速检测',
      onClick: () => console.log('查看代码')
    },
    {
      key: '3',
      icon: <AppstoreAddOutlined style={{ fontSize: 80 }} />,
      text: '日志分析',
      onClick: () => navigate('log')
    }
  ];
  return (
    <SystemLayout>
      <Flex
        vertical
        className="abnormal-detection-wrapper">
        <div className="abnormal-detection-upper">
          <div className="upper-left-icon">
            <div className="upper-left-icon">
              <div className="upper-left-computer">
                <SafetyCertificateOutlined style={{ fontSize: 120 }} />
              </div>
              <div className="upper-left-text">
                <h1>麒麟智眸正在守护您的电脑</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="abnormal-detection-lower">
          <div className="abnormal-detction-lower-icon">
            <Space direction="horizontal" align="center" className="lower-icon">
              {iconItems.map(item => {

                const myIcon = item.icon;
                return (
                  <div key={item.key} className="icon-item">
                    <div
                      onClick={() => {
                        item.onClick()
                      }}
                    >
                      {myIcon}

                    </div>
                    <div className="icon-text">{item.text}</div>
                  </div>
                )
              })}
            </Space>
          </div>
          <div className="abnormal-detction-lower-icon2">
            <ZoomInOutlined style={{ fontSize: 45 }} />
            <h2>自定义检测</h2>
          </div>
        </div>
      </Flex>
    </SystemLayout>
  )
}

export default AbnormalDetection;