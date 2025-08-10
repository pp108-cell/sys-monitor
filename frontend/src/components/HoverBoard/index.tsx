import type { MemoryInfo, DiskInfo, CpuInfo } from '@/services/useSystemInfoService/type';
import { type CollapseProps, Collapse } from 'antd';
import './index.less';
import type React from "react";
import { forwardRef } from "react";

export interface HoverBoardProps {
  width?: number;
  height?: number;
  open: boolean;
  onMouseLeave: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onMouseEnter: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  top: number,
  right?: number,
  left?: number,
  renderItem: React.ReactNode,
  className?: string,
}

const HoverBoard = forwardRef<HTMLDivElement, HoverBoardProps>(({
  width,
  height,
  open,
  onMouseLeave,
  onMouseEnter,
  top,
  right,
  left,
  renderItem,
  className,

}, ref) => {
  return (
    <div
      ref={ref}
      onMouseEnter={(e) => {
        e.stopPropagation();
        onMouseEnter(e);
      }}
      onMouseLeave={onMouseLeave}
      style={{
        width,
        height,
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        top,
        right,
        left,

      }}
      className={`hover-board-container ${className}`}>
      {renderItem}
    </div>
  )
})

HoverBoard.displayName = 'HoverBoard';

const HoverBoardCPU = ({
  cpuInfo
}: {
  cpuInfo: CpuInfo | undefined
}) => {
  const items: CollapseProps['items'] = [
    {
      key: '1',
      label: '基础信息',
      children: `${cpuInfo?.cpu_model || ''}  @ ${cpuInfo?.cpu_freq || 0} GHz *  ${cpuInfo?.cpu_count || 0} 个物理核心，${cpuInfo?.logical_cpu_count || 0} 个逻辑核心`,
    },
    {
      key: '2',
      label: '系统统计',
      children: <div className="hover-board-content-item">
        <div className="hover-board-content-item-title">
          <div className="system-stats-list">
            <div className="system-stats-item">
              <span className="system-stats-label">上下文切换:</span>
              <span className="system-stats-value">{cpuInfo?.cpu_stats.ctx_switches || 0}</span>
            </div>
            <div className="system-stats-item">
              <span className="system-stats-label">中断:</span>
              <span className="system-stats-value">{cpuInfo?.cpu_stats.interrupts || 0}</span>
            </div>
            <div className="system-stats-item">
              <span className="system-stats-label">软中断:</span>
              <span className="system-stats-value">{cpuInfo?.cpu_stats.soft_interrupts || 0}</span>
            </div>
            <div className="system-stats-item">
              <span className="system-stats-label">系统调用:</span>
              <span className="system-stats-value">{cpuInfo?.cpu_stats.syscalls || 0}</span>
            </div>
          </div>
        </div>
      </div>,
    },
  ]
  return (
    <div className="hover-board-wrapper">
      <div className="hover-board-title">
        检测到当前 CPU 使用率 <div className="hover-board-title-highlight">占用 {cpuInfo?.cpu_percent || 0}%</div>
      </div>
      <div className="hover-board-content">
        <Collapse
          expandIconPosition="end"
          accordion
          items={items} />
      </div>
    </div>
  )
}
const HoverBoardMemory = ({
  memoryInfo
}: {
  memoryInfo: MemoryInfo | undefined
}) => {
  const items: CollapseProps['items'] = [
    {
      key: '3',
      label: '内存信息',
      children: (
        <div className="memory-info-container">
          <div className="memory-info-section">
            <div className="memory-info-section-title">内存</div>
            <div className="memory-info-section-content">
              <div className="memory-info-row">
                <span className="memory-info-label">空闲内存:</span>
                <span className="memory-info-value">{((memoryInfo?.available_memory_gb || 0) * 1024).toFixed(0)} MB</span>
              </div>
              <div className="memory-info-row">
                <span className="memory-info-label">总内存:</span>
                <span className="memory-info-value">{((memoryInfo?.total_memory_gb || 0) * 1024).toFixed(0)} MB</span>
              </div>
              <div className="memory-info-row">
                <span className="memory-info-label">可分配内存:</span>
                <span className="memory-info-value">{((memoryInfo?.available_memory_gb || 0) * 1024).toFixed(0)} MB</span>
              </div>
              <div className="memory-info-row">
                <span className="memory-info-label">已用:</span>
                <span className="memory-info-value">{((memoryInfo?.used_memory_gb || 0) * 1024).toFixed(0)} MB</span>
              </div>
            </div>
          </div>
          <div className="memory-info-section">
            <div className="memory-info-section-title">虚拟内存 (Swap)</div>
            <div className="memory-info-section-content">
              <div className="memory-info-row">
                <span className="memory-info-label">总 Swap:</span>
                <span className="memory-info-value">{((memoryInfo?.total_swap || 0) * 1024).toFixed(0)} MB</span>
              </div>
              <div className="memory-info-row">
                <span className="memory-info-label">使用率:</span>
                <span className="memory-info-value">{(memoryInfo?.swap_percent || 0).toFixed(1)}%</span>
              </div>
              <div className="memory-info-row">
                <span className="memory-info-label">已用:</span>
                <span className="memory-info-value">{((memoryInfo?.used_swap || 0) * 1024).toFixed(0)} MB</span>
              </div>
              <div className="memory-info-row">
                <span className="memory-info-label">可用:</span>
                <span className="memory-info-value">{(((memoryInfo?.total_swap || 0) - (memoryInfo?.used_swap || 0)) * 1024).toFixed(0)} MB</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ]
  return (
    <div className="hover-board-wrapper">
      <div className="hover-board-title">
        检测到当前内存 <div className="hover-board-title-highlight">占用 {((memoryInfo?.used_memory_gb || 0) / (memoryInfo?.total_memory_gb || 0) * 100).toFixed(2)}%</div>
      </div>
      <div className="hover-board-content">
        <Collapse
          expandIconPosition="end"
          accordion
          items={items} />
      </div>
    </div>
  )
}

const HoverBoardDisk = ({
  diskInfo,
}: {
  diskInfo: DiskInfo | undefined,
}) => {
  const items: CollapseProps['items'] = [
    {
      key: 4,
      label: '基础信息',
      children: (
        <div className="disk-info-container">
          <div className="disk-info-section">
            <div className="disk-info-section-content">
              <div className="disk-info-row">
                <span className="disk-info-label">挂载点:</span>
                <span className="disk-info-value">{diskInfo?.mountpoint || '-'}</span>
              </div>
              <div className="disk-info-row">
                <span className="disk-info-label">共:</span>
                <span className="disk-info-value">{(diskInfo?.total_disk_gb || 0).toFixed(2)} GB，可用:</span>
                <span className="disk-info-value">{((diskInfo?.total_disk_gb || 0) - (diskInfo?.used_disk_gb || 0)).toFixed(2)} GB</span>
                <span className="disk-info-value">，已用:</span>
                <span className="disk-info-value">{(diskInfo?.used_disk_gb || 0).toFixed(2)} GB</span>
              </div>
              <div className="disk-info-row">
                <span className="disk-info-label">文件系统:</span>
                <span className="disk-info-value">{diskInfo?.fstype || '-'}</span>
              </div>
              <div className="disk-info-row">
                <span className="disk-info-label">类型:</span>
                <span className="disk-info-value">{diskInfo?.fstype || '-'}，系统占用:</span>
                <span className="disk-info-value">{(diskInfo?.used_disk_gb || 0).toFixed(2)} GB</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 5,
      label: 'Inode信息',
      children: (
        <div className="disk-inode-container">
          <div className="disk-inode-section">
            <div className="disk-inode-section-content">
              <div className="disk-inode-row">
                <span className="disk-inode-label">总数:</span>
                <span className="disk-inode-value">5898240</span>
              </div>
              <div className="disk-inode-row">
                <span className="disk-inode-label">已用:</span>
                <span className="disk-inode-value">222024</span>
              </div>
              <div className="disk-inode-row">
                <span className="disk-inode-label">可用:</span>
                <span className="disk-inode-value">5676216</span>
              </div>
              <div className="disk-inode-row">
                <span className="disk-inode-label">使用率:</span>
                <span className="disk-inode-value">3.76 %</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ]
  return (
    <div className="hover-board-wrapper">
      <div className="hover-board-title">
        检测到当前磁盘 <div className="hover-board-title-highlight">容量占用{(diskInfo?.disk_percent || 0).toFixed(2)}%</div>
      </div>
      <div className="hover-board-content">
        <Collapse
          expandIconPosition="end"
          accordion
          items={items} />
      </div>
    </div>
  )
}
export {
  HoverBoardCPU,
  HoverBoardDisk,
  HoverBoardMemory
}
export default HoverBoard