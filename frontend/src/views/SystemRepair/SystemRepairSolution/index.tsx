import SystemLayout from "@/components/SystemLayout";
import { InboxOutlined, PlusSquareOutlined, SearchOutlined, DeleteOutlined, HeartFilled, HeartOutlined, RightOutlined } from "@ant-design/icons";
import { Input, message } from "antd";
import type { FC } from "react";
import { useEffect, useState, useRef } from "react";
import './index.less';
import './modal.less';
import PostThumb0 from '../../../assets/images/CPU.png';
import PostThumb1 from '../../../assets/images/Mem.png';
import PostThumb2 from '../../../assets/images/Disk.png';
import PostThumb3 from '../../../assets/images/Network.png';
import PostThumb4 from '../../../assets/images/Process.png';
import Avatar from '@/assets/images/avatar.jpg';
import Logo from '@/assets/icons/logo.svg';
import useSolution from "@/hooks/useSolution";
import type { SolutionNote } from "@/services/useSolutionService/type";
import SystemRepairModal, { SolutionNoteTags } from "./modal";
import TypeWriter from "@/components/TypeWriter";
const PostThumb = [
  PostThumb0,
  PostThumb1,
  PostThumb2,
  PostThumb3,
  PostThumb4
]
const CollapseCPUItems = [
  {
    key: 1,
    label: 'CPU杀手进程',
    solution: '首先通过任务管理器或Process Explorer识别出异常进程，如果是系统进程（如svchost.exe），需要进一步查看其服务详情，可能是Windows Update、索引服务或恶意软件伪装。对于第三方软件，尝试重启该程序或更新到最新版本。如果是恶意进程，立即结束并运行杀毒软件全盘扫描。对于持续出现的问题进程，可以通过msconfig禁用开机自启，或在注册表中清理相关启动项。'
  },
  {
    key: 2,
    label: 'CPU占用率异常偏低',
    solution: '这通常表明CPU被限频或进入节能模式。进入电源选项将计划改为"高性能"或"平衡"，在BIOS中检查CPU C-State和SpeedStep设置，确保没有开启过度的节能功能。检查CPU温度是否过高触发降频保护，清理散热器并重新涂抹硅脂。同时检查系统是否缺少关键驱动程序，特别是芯片组驱动，这可能导致CPU无法正常调频。如果问题持续，可以使用CPU-Z监控实际频率，必要时重置BIOS设置或更新主板固件。'
  },
  {
    key: 3,
    label: 'CPU使用率波动异常',
    solution: '这种现象通常由调度问题或硬件故障引起。首先检查是否有计划任务在后台周期性运行，通过任务计划程序查看并禁用不必要的自动任务。检查磁盘健康状况，因为硬盘故障会导致系统频繁等待I/O操作。运行内存测试确保RAM稳定，不稳定的内存会导致系统频繁重试操作。同时检查主板供电是否稳定，电源功率是否充足，因为供电不稳会导致CPU性能波动。'
  },
  {
    key: 4,
    label: '多核CPU单核心过载',
    solution: '这通常是软件优化不佳或亲和性设置问题导致的。对于游戏或专业软件，检查是否有多线程优化选项可以开启。通过任务管理器的"设置亲和性"功能，手动将高负载进程分配到不同的CPU核心上。检查系统的电源管理设置，确保多核心调度正常工作。对于持续性问题，可以使用Process Lasso等工具自动进行负载均衡，或者更新到支持多核优化的软件版本。某些情况下，关闭超线程技术可能会改善负载分布问题。'
  },

]
const CollapseMemoItems = [
  {
    key: 5,
    label: '内存使用率持续过高',
    solution: '通过任务管理器查看内存占用最多的进程，关闭不必要的后台程序和浏览器标签页。检查是否有内存泄漏的应用程序，重启这些程序或更新到最新版本。禁用不需要的开机自启程序，清理系统垃圾文件。如果是Chrome等浏览器占用过多，可以安装内存优化插件或限制标签页数量。调整虚拟内存设置，将页面文件设置为物理内存的1.5-2倍。最根本的解决方案是增加物理内存容量。'
  },
  {
    key: 6,
    label: '内存条不兼容或故障',
    solution: '使用Windows内存诊断工具或MemTest86进行全面内存测试，如果发现错误则需要更换故障内存条。检查内存条是否正确插入插槽，重新拔插确保接触良好。确认内存条规格（频率、时序、电压）与主板兼容，不同品牌或规格的内存混用可能导致不稳定。进入BIOS检查内存设置，尝试降低内存频率或放宽时序参数。如果使用多条内存，尝试单独测试每条内存确定故障源，必要时更换为同一品牌型号的内存套装。'
  },
  {
    key: 7,
    label: '内存频率无法达到标称值',
    solution: '大多数内存条默认运行在JEDEC标准频率上，需要手动开启XMP(Intel)或DOCP(AMD)配置文件来达到标称频率。进入BIOS内存设置，找到XMP选项并启用相应的配置文件。如果启用后系统不稳定，可以尝试手动调整内存时序参数，适当放宽CL、tRCD、tRP等数值。检查CPU内存控制器是否支持该频率，某些老旧CPU可能无法支持最新的高频内存。确保主板BIOS是最新版本，老版本BIOS可能对新内存支持不完善。如果仍无法稳定运行高频率，可以逐步降低频率直到系统稳定，或考虑升级支持更高频率的CPU和主板平台。'
  },
  {
    key: 8,
    label: '内存占用异常但找不到占用源',
    solution: '这通常是由于内核级程序或驱动程序占用内存导致的。使用RAMMap或Process Monitor等专业工具查看详细的内存分配情况，重点关注内核内存和驱动程序占用。检查最近安装的硬件驱动程序，特别是显卡、网卡驱动，尝试回滚到稳定版本。运行系统文件检查器(sfc /scannow)修复可能损坏的系统文件。检查是否有rootkit或深层恶意软件，使用专业反恶意软件工具进行深度扫描。禁用不必要的系统服务，特别是Superfetch、Windows Search等可能大量占用内存的服务。'
  },

]
const CollapseDiskItems = [
  {
    key: 9,
    label: '磁盘使用率100%导致系统卡顿',
    solution: '首先识别占用磁盘最多的进程，常见的有Windows Search索引服务、系统更新、杀毒软件扫描等。可以暂时禁用Windows Search服务或重建搜索索引，延迟非关键的系统更新。检查是否有大文件正在下载或同步，暂停这些操作。运行磁盘清理工具删除临时文件和系统垃圾。如果是机械硬盘，考虑升级到SSD固态硬盘以根本性提升I/O性能。对于持续性问题，可以通过Resource Monitor详细分析磁盘活动，找出具体的问题进程并采取针对性措施。'
  },
  {
    key: 10,
    label: '磁盘空间不足警告',
    solution: '运行磁盘清理工具清除临时文件、回收站、系统更新备份等。使用WinDirStat或TreeSize等工具分析磁盘占用，找出占用空间最大的文件夹。将大文件(如视频、图片)转移到其他磁盘分区或外部存储设备。清理浏览器缓存和下载文件夹中的无用文件。卸载不常用的程序，或将程序安装到其他分区。禁用系统还原点或减少还原点数量。清理Windows.old文件夹(如果存在)。考虑使用云存储服务或扩展磁盘容量。对于SSD，保持至少15-20%的空闲空间以维持性能。'
  },
  {
    key: 11,
    label: '硬盘出现坏道或读写错误',
    solution: '立即备份重要数据到其他存储设备，因为硬盘可能面临完全故障风险。运行CHKDSK命令检查和修复文件系统错误，使用参数/f和/r进行深度检查。使用CrystalDiskInfo检查硬盘健康状态和SMART信息，关注重新分配扇区数、当前待映射扇区数等关键指标。如果是机械硬盘出现物理坏道，可以尝试使用HDD Regenerator或MHDD等专业工具进行低级修复。对于SSD，更新固件并运行厂商提供的诊断工具。如果坏道数量持续增加或SMART报告严重警告，应立即更换硬盘以避免数据丢失。'
  },
  {
    key: 12,
    label: '磁盘碎片化严重影响性能',
    solution: '对于机械硬盘，定期运行Windows内置的磁盘碎片整理程序，或使用Defraggler等第三方工具进行深度整理。设置定期自动碎片整理计划，建议每周或每月执行一次。在碎片整理前先运行磁盘清理，删除不必要的文件以提高整理效率。注意SSD固态硬盘不需要进行传统的碎片整理，反而可能影响其寿命，应使用Windows的"优化驱动器"功能执行TRIM命令。对于严重碎片化的系统，可能需要多次整理才能达到最佳效果。同时注意保持足够的磁盘空闲空间(至少15%)，空间不足会加剧碎片化问题。'
  },

]
const CollapseNetWorkItems = [
  {
    key: 13,
    label: '网络连接不稳定或频繁断线',
    solution: '首先检查网络硬件连接，确保网线插头牢固或WiFi信号足够强。重启路由器和调制解调器，断电30秒后重新通电。更新网卡驱动程序到最新版本，或回滚到稳定版本。检查是否有其他设备占用过多带宽，暂停大文件下载或视频流媒体。调整WiFi信道避免干扰，使用5GHz频段替代拥挤的2.4GHz。运行网络疑难解答程序自动诊断问题。如果使用WiFi，尝试更换网络适配器的电源管理设置，禁用"允许计算机关闭此设备以节约电源"。检查防火墙和杀毒软件设置，某些安全软件可能阻断正常网络连接。'
  },
  {
    key: 14,
    label: '网速明显低于宽带套餐标准',
    solution: '使用Speedtest或运营商官方测速工具在不同时间段多次测试网速，排除网络高峰期影响。检查是否有后台程序占用带宽，如系统更新、云同步、P2P下载等，暂停这些服务后重新测速。尝试有线连接替代WiFi，排除无线信号干扰问题。清理浏览器缓存和DNS缓存(ipconfig /flushdns)，尝试更换DNS服务器(如8.8.8.8或114.114.114.114)。检查路由器是否支持当前宽带速率，老旧路由器可能成为瓶颈。联系运营商确认线路质量和端口配置是否正常。如果使用WiFi，确保使用支持高速率的无线标准(如802.11ac或ax)，并检查信号强度是否足够。'
  },
  {
    key: 15,
    label: '无法访问特定网站或服务',
    solution: '首先确认是否为全网问题，使用不同设备或网络环境测试该网站。清除浏览器缓存、Cookie和浏览数据，尝试使用无痕模式或其他浏览器访问。检查HOST文件是否被修改(位于C:\\Windows\\System32\\drivers\\etc\\hosts)，删除可疑条目。暂时禁用防火墙、杀毒软件和广告拦截器，检查是否为安全软件误拦截。更换DNS服务器，使用公共DNS如Google(8.8.8.8)或Cloudflare(1.1.1.1)。运行网络重置命令netsh winsock reset和netsh int ip reset，重启计算机。如果是企业网络，检查代理服务器设置或联系网络管理员。尝试使用VPN服务绕过可能的地区限制或网络策略。'
  },
  {
    key: 16,
    label: '网络延迟过高影响实时应用',
    solution: '使用ping命令测试到目标服务器的延迟，识别是本地网络还是远程服务器问题。关闭其他占用网络的应用程序，特别是下载、上传和流媒体服务，为实时应用预留充足带宽。启用游戏模式或QoS(服务质量)设置，优先保证实时应用的网络资源。检查网络拥塞情况，避开网络使用高峰期，或升级到更高带宽的套餐。优化路由路径，尝试连接到地理位置更近的服务器。更新网卡驱动并调整网络适配器设置，禁用节能模式，启用大发送卸载等性能优化选项。如果使用WiFi，确保信号强度足够并减少干扰源。考虑使用有线连接替代无线连接以获得更稳定的延迟表现。检查路由器固件是否为最新版本，老旧固件可能存在性能问题。'
  },
];

const UserContent: FC<{ data: string }> = ({ data }) => {
  return (
    <div className="system-repair-solution-message-list-item user">
      <img
        alt="avatar"
        src={Avatar}
        className="system-repair-solution-message-list-item-avatar" />
      <div className="system-repair-solution-message-list-item-content">
        {data}
      </div>
    </div>
  )
}
const SystemContent: FC<{ data: string }> = ({ data }) => {
  return (
    <div className="system-repair-solution-message-list-item system">
      <img
        alt="avatar"
        src={Logo}
        style={{ backgroundColor: 'black' }}
        className="system-repair-solution-message-list-item-avatar" />
      <div className="system-repair-solution-message-list-item-content">
        <TypeWriter
          text={data}
          className="message ai-message no-after"
          delay={50}
        />
      </div>
    </div>
  )
}
interface MessageListProps {
  role: 'user' | 'system';
  content: string;
}
const SystemRepairSolution: FC = () => {
  const [selectedCollapseItem, setSelectedCollapseItem] = useState<1 | 2 | 3 | 4>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingNote, setEditingNote] = useState<SolutionNote | undefined>();
  const [isReadonly, setIsReadonly] = useState(false); // 新增只读状态
  const [messageList, setMessageList] = useState<MessageListProps[]>([]);
  const [showOnlyLiked, setShowOnlyLiked] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState(''); // 新增搜索关键词状态
  const [systemPostLikes, setSystemPostLikes] = useState<Record<number, boolean>>({}); // 系统发帖的收藏状态
  const messageListRef = useRef<HTMLDivElement>(null); // 消息列表容器的引用

  // 添加系统发帖固定数据
  const systemPosts: SolutionNote[] = [
    {
      id: -1,
      title: 'CPU性能优化完全指南',
      content: '麒麟操作系统CPU性能优化指南是一份专门针对国产麒麟操作系统进行CPU性能调优的技术文档。该指南涵盖了从系统级配置到应用层面的全方位优化策略，包括CPU频率调节、进程调度算法优化、内核参数调整、电源管理配置等关键技术要点。通过合理配置CPU亲和性绑定、优化中断处理机制、调整系统负载均衡策略，以及针对特定工作负载进行性能Profile分析，用户可以显著提升麒麟系统在服务器、桌面和嵌入式环境下的CPU利用效率。该指南还特别关注了国产CPU架构（如飞腾、鲲鹏等）的特性优化，为用户提供了详细的性能监控工具使用方法和故障排查流程，是系统管理员和开发人员进行麒麟系统性能调优的重要参考资料。',
      tag: 0, // CPU相关
      like: systemPostLikes[-1] || false,
      timestamp: '2024-01-15T10:00:00Z',
      update_time: '2024-01-15T10:00:00Z'
    },
    {
      id: -2,
      title: '内存不足问题解决方案大全',
      content: '全面分析内存不足的原因和解决方法，包括虚拟内存设置、内存优化技巧、软件管理等实用技能。',
      tag: 1, // 内存相关
      like: systemPostLikes[-2] || false,
      timestamp: '2024-01-14T15:30:00Z',
      update_time: '2024-01-14T15:30:00Z'
    },
    {
      id: -3,
      title: '网络连接故障排查手册',
      content: '系统性介绍网络连接问题的诊断和修复方法，包括DNS设置、网卡驱动更新、网络重置等常用技巧。',
      tag: 3, // 网络相关
      like: systemPostLikes[-3] || false,
      timestamp: '2024-01-13T09:20:00Z',
      update_time: '2024-01-13T09:20:00Z'
    }
  ];

  const {
    solutionNoteList,
    deleteSolutionNote,
    insertSolutionNote,
    editSolutionNote,
    refreshSolutionList,
    setSolutionNoteLike
  } = useSolution();

  const getCurrentCollapseItem = () => {
    const CollapseItemMap: Record<string, { key: number, label: string, solution: string }[]> = {
      'id-1': CollapseCPUItems,
      'id-2': CollapseMemoItems,
      'id-3': CollapseDiskItems,
      'id-4': CollapseNetWorkItems
    }
    return CollapseItemMap[`id-${selectedCollapseItem}`]
  }

  // 新增处理收藏过滤的函数
  const handleToggleLikedFilter = () => {
    setShowOnlyLiked(!showOnlyLiked);
  };

  // 新增处理搜索的函数
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  // 清空搜索
  const handleClearSearch = () => {
    setSearchKeyword('');
  };

  // 修改过滤帖子列表逻辑，同时支持搜索和收藏过滤
  const filteredSolutionNoteList = (() => {
    // 将系统发帖与用户发帖合并
    const allPosts = [...systemPosts, ...solutionNoteList];

    return allPosts.filter(item => {
      // 搜索过滤：检查标题是否包含搜索关键词（不区分大小写）
      const matchesSearch = searchKeyword.trim() === '' ||
        item.title.toLowerCase().includes(searchKeyword.toLowerCase());

      // 收藏过滤：如果开启收藏过滤，只显示被收藏的
      const matchesLike = !showOnlyLiked || item.like;

      return matchesSearch && matchesLike;
    });
  })();


  // 页面挂载时刷新列表
  useEffect(() => {
    refreshSolutionList();
  }, []);

  // 监听消息列表变化，自动滚动到底部
  // 监听消息列表变化，自动滚动到底部
  useEffect(() => {
    if (messageListRef.current) {
      const lastChild = messageListRef.current.lastElementChild;
      if (lastChild) {
        lastChild.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  }, [messageList]);

  // 处理添加笔记
  const handleAddNote = () => {
    setModalMode('add');
    setEditingNote(undefined);
    setIsReadonly(false); // 添加模式下重置为非只读
    setIsModalOpen(true);
  };

  // 处理编辑笔记
  const handleEditNote = (note: SolutionNote) => {
    const isSystemPost = note.id < 0;
    setModalMode('edit');
    setEditingNote(note);
    setIsReadonly(isSystemPost); // 系统帖子设置为只读模式
    setIsModalOpen(true);
  };

  // 处理删除笔记
  const handleDeleteNote = async (id: number) => {
    try {
      await deleteSolutionNote(id);
      message.success('删除成功');
      refreshSolutionList();
    } catch {
      message.error('删除失败，请重试');
    }
  };

  // 处理提交（添加或编辑）
  const handleSubmit = async (title: string, content: string, tag: number) => {
    if (modalMode === 'add') {
      await insertSolutionNote(title, content, tag);
      refreshSolutionList();
    } else if (modalMode === 'edit' && editingNote) {
      await editSolutionNote(editingNote.id, title, content, tag);
      refreshSolutionList();
    }
  };

  const handleHeartIconClick = async (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, item: SolutionNote) => {
    e.stopPropagation();

    const isSystemPost = item.id < 0;

    if (isSystemPost) {
      // 系统发帖使用本地状态管理收藏
      setSystemPostLikes(prev => ({
        ...prev,
        [item.id]: !prev[item.id]
      }));
    } else {
      // 用户发帖使用数据库操作
      setSolutionNoteLike(item.id, !item.like);
      await refreshSolutionList();
    }
  }

  const handleDrawerCollapseItemOnClick = (e: React.MouseEvent<HTMLDivElement>, solution: string) => {
    const textContent = e.currentTarget.textContent;
    if (textContent === null) return;
    setMessageList(prev => [...prev, { role: 'user', content: textContent }]);
    setMessageList(prev => [...prev, { role: 'system', content: solution }]);
  }

  return (
    <SystemLayout>
      <SystemRepairModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        mode={modalMode}
        editData={editingNote}
        onSubmit={handleSubmit}
        readonly={isReadonly} // 传递只读状态
      />
      <div className="system-repair-solution-wrapper">
        <div className="system-repair-solution-header">
          <Input
            prefix={<SearchOutlined style={{ fontSize: 18 }} />}
            placeholder="搜索帖子标题……"
            className="system-repair-solution-search"
            value={searchKeyword}
            onChange={handleSearchChange}
            allowClear
            onClear={handleClearSearch}
          />
          <InboxOutlined
            style={{
              fontSize: 28,
              cursor: 'pointer',
              color: showOnlyLiked ? '#1890ff' : 'inherit'
            }}
            onClick={handleToggleLikedFilter}
            title={showOnlyLiked ? "显示全部帖子" : "只显示收藏的帖子"}
          />
          <PlusSquareOutlined
            onClick={handleAddNote}
            style={{ fontSize: 24 }}
          />
        </div>
        <div className="system-repair-solution-content">
          <div className="system-repair-solution-content-left">

            <div className="system-repair-solution-posts">
              {
                filteredSolutionNoteList.map((item) => {
                  const isSystemPost = item.id < 0; // 系统发帖的id为负数

                  return (
                    <div
                      onClick={() => handleEditNote(item)} // 移除isSystemPost的限制
                      key={item.id}
                      className={`system-repair-solution-posts-card ${isSystemPost ? 'system-post' : ''}`}
                      style={{ cursor: 'pointer' }} // 都设置为可点击
                    >
                      <img src={PostThumb[item.tag]} alt="缩略图" className="system-repair-solution-posts-card-thumb" />
                      <div className="system-repair-solution-posts-card-tags">
                        <div className="system-repair-solution-posts-card-tags-item">
                          # {SolutionNoteTags[item.tag]}
                        </div>
                        {isSystemPost && (
                          <div className="system-repair-solution-posts-card-tags-item" style={{ backgroundColor: '#1890ff', color: 'white' }}>
                            系统
                          </div>
                        )}
                      </div>
                      <div className="system-repair-solution-posts-card-title">
                        {item.title}
                      </div>
                      <div className="system-repair-solution-posts-card-infos">
                        <div className="system-repair-solution-posts-card-infos-left">
                          <img src={isSystemPost ? Logo : Avatar} alt="avatar" className="system-repair-solution-posts-card-avatar" />
                          <span className="system-repair-solution-posts-card-username">
                            {isSystemPost ? '麒麟智眸' : '我'}
                          </span>
                        </div>
                        <div className="system-repair-solution-posts-card-infos-right">
                          {
                            item.like ? (
                              <HeartFilled
                                className="system-repair-solution-posts-card-infos-right-icon"
                                onClick={(e) => handleHeartIconClick(e, item)}
                              />
                            ) : (
                              <HeartOutlined
                                className="system-repair-solution-posts-card-infos-right-icon"
                                onClick={(e) => handleHeartIconClick(e, item)}
                              />
                            )
                          }
                          {!isSystemPost && (
                            <DeleteOutlined
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNote(item.id);
                              }}
                              style={{ cursor: 'pointer', color: '#ff4d4f' }}
                              title="删除"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>
          <div className="system-repair-solution-content-right">
            <header className="system-repair-solution-content-right-header">
              热门问题
            </header>
            <div className="system-repair-solution-content-right-bottom">
              <div className="system-repair-solution-content-right-bottom-content">
                <div className="system-repair-solution-selector">
                  <header className="system-repair-solution-selector-header">
                    <div
                      onClick={() => setSelectedCollapseItem(1)}
                      className="system-repair-solution-selector-header-item">
                      <span className={`system-repair-solution-selector-header-item-text ${selectedCollapseItem === 1 ? 'active' : ''}`}>CPU</span>
                    </div>
                    <div
                      onClick={() => setSelectedCollapseItem(2)}
                      className="system-repair-solution-selector-header-item">
                      <span className={`system-repair-solution-selector-header-item-text ${selectedCollapseItem === 2 ? 'active' : ''}`}>内存</span>
                    </div>
                    <div
                      onClick={() => setSelectedCollapseItem(3)}
                      className="system-repair-solution-selector-header-item">
                      <span className={`system-repair-solution-selector-header-item-text ${selectedCollapseItem === 3 ? 'active' : ''}`}>磁盘</span>
                    </div>
                    <div
                      onClick={() => setSelectedCollapseItem(4)}
                      className="system-repair-solution-selector-header-item">
                      <span className={`system-repair-solution-selector-header-item-text ${selectedCollapseItem === 4 ? 'active' : ''}`}>网络</span>
                    </div>
                  </header>
                  <div className="system-repair-solution-selector-content">
                    {
                      getCurrentCollapseItem().map((item, index) => (
                        <div
                          key={index}
                          onClick={(e) => handleDrawerCollapseItemOnClick(e, item.solution)}
                          className="system-repair-solution-selector-content-item">
                          {item.label} <RightOutlined />
                        </div>

                      ))
                    }
                  </div>
                </div>
                <div className="system-repair-solution-message-list" ref={messageListRef}>
                  {
                    messageList.map((item, index) => {
                      switch (item.role) {
                        case 'system':
                          return <SystemContent key={index} data={item.content} />
                        case 'user':
                          return <UserContent key={index} data={item.content} />
                      }
                    })
                  }
                </div>
              </div>
              {/* <div className="system-repair-solution-content-right-footer">
                <Input className="system-repair-solution-content-right-footer-input" />
                <PlusCircleOutlined />
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </SystemLayout>
  )
}

export default SystemRepairSolution;