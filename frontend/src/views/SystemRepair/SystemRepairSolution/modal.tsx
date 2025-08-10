/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SolutionNote } from "@/services/useSolutionService/type";
import { CloseOutlined, FireOutlined } from "@ant-design/icons";
import './modal.less'
import { type ModalProps, message, Modal, Button, Input } from "antd";
import { type FC, useState, useEffect } from "react";
export const SolutionNoteTags: Record<number, string> = {
  0: 'CPU',
  1: '内存',
  2: '磁盘',
  3: '网络',
  4: '进程'
}

export interface SystemRepairModalProps extends ModalProps {
  mode?: 'add' | 'edit';
  editData?: SolutionNote;
  onSubmit?: (title: string, content: string, tag: number) => Promise<void>;
  readonly?: boolean; // 新增只读属性
}
const SystemRepairModal: FC<SystemRepairModalProps> = ({
  open,
  onCancel,
  mode = 'add',
  editData,
  onSubmit,
  readonly = false // 默认为false
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // 当编辑模式时，填充现有数据
  useEffect(() => {
    if (mode === 'edit' && editData) {
      setTitle(editData.title);
      setContent(editData.content);
      setTag(editData.tag);
    } else {
      setTitle('');
      setContent('');
      setTag(undefined);
    }
  }, [mode, editData, open]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      message.warning('请填写标题和内容');
      return;
    }
    if (tag === undefined) {
      message.warning('请选择标签');
      return;
    }
    setLoading(true);
    try {
      await onSubmit?.(title.trim(), content.trim(), tag);
      message.success(mode === 'add' ? '发布成功' : '编辑成功');
      onCancel?.({} as any);
    } catch {
      message.error(mode === 'add' ? '发布失败，请重试' : '编辑失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      keyboard
      footer={
        readonly ? null : ( // 只读模式下不显示保存按钮
          <Button
            type="primary"
            className="system-repair-modal-button"
            loading={loading}
            onClick={handleSubmit}
          >
            {mode === 'add' ? '发布' : '保存'}
          </Button>
        )
      }
      closable={false}
      className="system-repair-modal"
    >
      <CloseOutlined
        onClick={onCancel}
        className="system-repair-modal-close"
      />
      <div className="system-repair-modal-content">
        <Input.TextArea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入标题"
          autoSize={{ maxRows: 1 }}
          className="system-repair-modal-input-title"
          readOnly={readonly} // 只读模式下设置为只读
        />
        <Input.TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          showCount
          autoSize={{ minRows: 8, maxRows: 20 }}
          placeholder="请输入文字……"
          className="system-repair-modal-input"
          readOnly={readonly} // 只读模式下设置为只读
        />
        <div className="system-repair-modal-content-tags">
          {
            [0, 1, 2, 3, 4].map((item) => (
              <div
                onClick={() => !readonly && setTag(item)} // 只读模式下不允许点击
                className={`system-repair-modal-content-tags-item ${tag === item ? 'active' : ''} ${readonly ? 'readonly' : ''}`}>
                <FireOutlined className="system-repair-modal-content-tags-item-icon" />
                #{SolutionNoteTags[item]}
              </div>
            ))
          }
        </div>
      </div>
    </Modal>
  )
}
export default SystemRepairModal;