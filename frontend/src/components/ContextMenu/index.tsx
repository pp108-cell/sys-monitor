import type React from "react"
import { useEffect, useState, useRef } from "react"
import './index.less'
export interface ContextMenuOptionsProps {
  menus: {
    name: string,
    onClick: () => void
  }[]
}

/**
 * 自定义右键菜单
 * @param options：菜单传入项，包括子项名称以及点击函数
 * @returns 
 */
// 不建议使用 ref 直接操控真实 dom，采用子项嵌套的方式
const ContextMenu: React.FC<{
  options: ContextMenuOptionsProps,
  children: React.ReactNode
}> = ({
  options,
  children
}) => {
  const menus = options.menus;
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({
    x: 0,
    y: 0
  });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setVisible(true);
    setPosition({ x: e.clientX, y: e.clientY });
  }
  
  // 再次点击
  const handleExtraOnlick = () => {
    setVisible(false);
  }

  const menuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    document.addEventListener('click', handleExtraOnlick);
    // document.addEventListener('contextmenu', handleExtraOnlick)
    return () => {
      document.removeEventListener('click', handleExtraOnlick);
      // document.removeEventListener('contextmenu', handleExtraOnlick)
    }
  }, [])

  // 控制 menu 位置，从内联样式换到 ref 操控；
  useEffect(() => {
    if (menuRef.current) {
      menuRef.current.style.setProperty('--menu-x', `${position.x}px`);
      menuRef.current.style.setProperty('--menu-y', `${position.y}px`);
    }
  }, [position]);

  return (
    <div
      className="context-menu-container"
      // 监听浏览器右键菜单行为
      onContextMenu={handleContextMenu}
    >
      <ul
        ref={menuRef}
        className={`context-menu-wrapper ${visible ? 'visible' : ''}`}
      >
        {
          menus.map((item, index) => (
            <li
              key={index}
              onClick={item.onClick}
              className="context-menu-item"
            >{item.name}</li>
          ))
        }
      </ul>
      <div className="context-menu-children">
        {children}
      </div>
    </div>
  )
}

export default ContextMenu;