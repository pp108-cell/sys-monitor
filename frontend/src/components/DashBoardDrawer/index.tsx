import { Drawer } from "antd";
import type { DrawerProps } from "antd";
import type { FC } from "react";
import './index.less';
import { WarningOutlined } from "@ant-design/icons";
import { AnomalyType } from "../../services/useCauseService/type";

// 异常数据类型定义（基于实际的异常结构）
interface AnomalyItem {
  anomaly_id: number;  // 异常ID，用于映射到AnomalyType (0代表正常，1-10对应异常类型)
  score: number;       // 异常分数，用于计算风险等级
  current_status?: string;
  detail_analysis?: string;
  index?: number;
}

export interface DashBoardDrawerProps extends DrawerProps {
  data?: AnomalyItem[]
}

// 根据分数计算风险等级
const getRiskLevelFromScore = (score: number) => {
  if (score > 0.75) {
    return {
      level: '高危',
      backgroundColor: '#FB718B99',
      placeholderColor: '#FB718B',
      text: '高危'
    };
  } else if (score >= 0.45) {
    return {
      level: '中等',
      backgroundColor: '#FBAC7099',
      placeholderColor: '#FBAC70',
      text: '中等'
    };
  } else {
    return {
      level: '轻微',
      backgroundColor: '#54DBC899',
      placeholderColor: '#54DBC8',
      text: '轻微'
    };
  }
};

// 根据异常ID获取异常类型
const getAnomalyTypeFromId = (anomalyId: number): string => {
  // anomaly_id 为数字：0代表正常，1-10对应TYPE_1到TYPE_10的异常类型
  switch (anomalyId) {
    case 0:
      return "正常";
    case 1:
      return AnomalyType.TYPE_1;
    case 2:
      return AnomalyType.TYPE_2;
    case 3:
      return AnomalyType.TYPE_3;
    case 4:
      return AnomalyType.TYPE_4;
    case 5:
      return AnomalyType.TYPE_5;
    case 6:
      return AnomalyType.TYPE_6;
    case 7:
      return AnomalyType.TYPE_7;
    case 8:
      return AnomalyType.TYPE_8;
    case 9:
      return AnomalyType.TYPE_9;
    case 10:
      return AnomalyType.TYPE_10;
    default:
      throw new Error("未知异常类型") ;
  }
};

const DashBoardDrawerItem: FC<{
  anomaly: AnomalyItem;
}> = ({ anomaly }) => {
  const riskStyle = getRiskLevelFromScore(anomaly.score);
  const anomalyType = getAnomalyTypeFromId(anomaly.anomaly_id);

  return (
    <div className="dashboard-drawer-item"
      style={{
        backgroundColor: riskStyle.backgroundColor
      }}>
      <div className="dashboard-drawer-item-placeholder"
        style={{
          backgroundColor: riskStyle.placeholderColor
        }}></div>
      <div className="dashboard-drawer-item-content">
        <div className="dashboard-drawer-item-content-header">
          <span className="dashboard-drawer-item-title">{anomalyType}</span>
          <span className="dashboard-drawer-item-risk-level">{riskStyle.text}</span>
        </div>
        <div className="dashboard-drawer-item-details">
          <div className="dashboard-drawer-item-score">异常分数：{anomaly.score.toFixed(3)}</div>
          {anomaly.current_status && (
            <div className="dashboard-drawer-item-status">{anomaly.current_status}</div>
          )}
          {anomaly.detail_analysis && (
            <div className="dashboard-drawer-item-analysis">{anomaly.detail_analysis}</div>
          )}
        </div>
      </div>
    </div>
  )
}

// 业务组件，对 antd 的 Drawer 进行二次封装
const DashBoardDrawer: FC<DashBoardDrawerProps> = ({ open, onClose, getContainer, data = [] }) => {
  return (
    <Drawer
      open={open}
      mask={false}
      onClose={onClose}
      width={420}
      rootStyle={{
        position: 'absolute'
      }}
      getContainer={getContainer}
      title={
        <div className="dashboard-drawer-header-content">
          <WarningOutlined style={{ fontSize: 32 }} />
          异常检测 ({data.length})
        </div>
      }
      footer={
        null
      }
      placement="right"
      closeIcon={false}
      classNames={{
        content: 'dashboard-drawer-content',
        header: 'dashboard-drawer-header',
        body: 'dashboard-drawer-body',
        footer: 'dashboard-drawer-footer',
        wrapper: 'dashboard-drawer-wrapper'
      }}
    >
      {data.length > 0 ? (
        data.map((anomaly, index) => (
          <DashBoardDrawerItem
            key={index}
            anomaly={anomaly}
          />
        ))
      ) : (
        <div className="dashboard-drawer-empty">
          <div className="dashboard-drawer-empty-text">暂无异常检测到</div>
        </div>
      )}
    </Drawer>
  )
}

export default DashBoardDrawer;