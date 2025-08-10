import { Layout, Menu, type MenuProps, Image } from "antd";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import logo from '@/assets/images/Logo.png'
import { useState, type FC } from "react";
import './index.less';
import { AimOutlined, MenuUnfoldOutlined, PicCenterOutlined, ProfileOutlined, SnippetsOutlined, SolutionOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import './menu.less';
type MenuItem = Required<MenuProps>["items"][number];
const SystemLayout: FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const MenuItems: MenuItem[] = [
    {
      key: '0',
      icon: <img className="menu-img" src={logo} title="logo"/>,
      label: <Link to='/' className="menu-link menu-title">
        麒麟智眸
      </Link>
    },
    {
      key: '1',
      icon: <AimOutlined className="menu-icon" />,
      label: (<Link to='/dashboard' className="menu-link">
        系统监控
      </Link>),
    },
    {
      key: 'sub1',
      icon: <MenuUnfoldOutlined className="menu-icon" />,
      label: (<div className="menu-link">
        异常检测
      </div>),
      children: [
        {
          key: '2',
          icon: <ProfileOutlined className="menu-icon" />,
          label: (<Link to='/abnormal-detection/log' className="menu-link">
            运行日志
          </Link>)
        },
        {
          key: '3',
          icon: <SnippetsOutlined className="menu-icon" />,
          label: (<Link to='/abnormal-detection/report' className="menu-link">
            检测报告
          </Link>)
        }
      ]
    },
    {
      key: 'sub2',
      icon: <MenuUnfoldOutlined className="menu-icon" />,
      label: (<div className="menu-link">
        系统修复
      </div>),
      children: [
        {
          key: '4',
          icon: <SolutionOutlined className="menu-icon" />,
          label: (<Link to='/system-repair/solution' className="menu-link">
            修复笔记
          </Link>)
        },
        {
          key: '5',
          icon: <SnippetsOutlined className="menu-icon" />,
          label: (<Link to='/system-repair/report' className="menu-link">
            修复报告
          </Link>)
        }
      ]

    },
    {
      key: '6',
      icon: <PicCenterOutlined className="menu-icon" />,
      label: (<Link to='/kylin-ai' className="menu-link">
        Kylin智能管家
      </Link>),
    },
  ];
  const { pathname } = useLocation();
  const getSelectedKeys = () => {

    const pathToKeyMap: { [key: string]: number } = {
      '/dashboard': 1,
      '/abnormal-detection/log': 2,
      '/abnormal-detection/report': 3,
      '/system-repair/solution': 4,
      '/system-repair/report': 5,
      '/kylin-ai': 6
    }
    return pathToKeyMap[pathname];
  }


  return (
    <div className="system-container">
      <Layout className="system-layout">
        <Sider
          collapsible
          onCollapse={(value) => setCollapsed(value)}
          collapsed={collapsed}
          className="system-siderbar">
          <Menu
            defaultSelectedKeys={[`${getSelectedKeys()}`]}
            mode="inline"
            style={{ borderInlineEnd: 0 }}
            items={MenuItems}
            defaultOpenKeys={[
              `${(getSelectedKeys() === 2 || getSelectedKeys() === 3) ? "sub1" : 
                (getSelectedKeys() == 4 || getSelectedKeys() == 5) ? "sub2" : ''
              }`,
            ]}
            className="system-siderbar-menu" />
        </Sider>
        <Content
          className="system-content">{children}</Content>
      </Layout>
    </div>
  )
}

export default SystemLayout;