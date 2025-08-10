import { useEffect, useRef, useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import './index.less';
import './feature.less';
import './hero.less';
import './spark.less';
import TypeWriter from "@/components/TypeWriter";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Image } from "antd";
import FeatureIcon01 from '@/assets/icons/feature-icon-01.svg';
import FeatureIcon02 from '@/assets/icons/feature-icon-02.svg';
import FeatureIcon03 from '@/assets/icons/feature-icon-03.svg';
import FeatureIcon04 from '@/assets/icons/feature-icon-04.svg';
import FeatureIcon05 from '@/assets/icons/pricing-illustration.svg';
import FeatureImage01 from '@/assets/images/home-feature-1.png';
import FeatureImage02 from '@/assets/images/home-feature-2.png';
import FeatureImage03 from '@/assets/images/home-feature-3.png';
import FeatureImage04 from '@/assets/images/home-feature-4.png';
import FeatureImage05 from '@/assets/images/home-feature-5.png';
import FeatureImage06 from '@/assets/images/home-feature-6.png';
import FeatureImage07 from '@/assets/images/home-feature-7.png';
import FeatureImage08 from '@/assets/images/home-feature-8.png';
import FeatureImage09 from '@/assets/images/home-feature-9.png';
import FeatureImage10 from '@/assets/images/home-feature-10.png';
import FeatureImage11 from '@/assets/images/home-feature-11.png';
// import FeatureImage12 from '@/assets/images/home-feature-12.png';
import FeatureImage13 from '@/assets/images/home-feature-13.png';
import FeatureImage14 from '@/assets/images/home-feature-14.png';
import FeatureImage15 from '@/assets/images/home-feature-15.png';

const Home: FC = () => {
  const navigate = useNavigate();

  // 动画控制 ref
  const mainRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const sparkRef = useRef<HTMLDivElement>(null);
  const Card2Ref = useRef<HTMLDivElement>(null);
  const Card3Ref = useRef<HTMLDivElement>(null);
  const Card4Ref = useRef<HTMLDivElement>(null);
  // 动画控制开关
  const [sparkStart, setSparkStart] = useState(false);
  const onScroll = (events: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const e = events.currentTarget;
    if (e === undefined || sparkRef.current === null || mainRef.current === null || Card2Ref.current === null || Card3Ref.current === null || Card4Ref.current === null) return;
    // spark 打字机到 main 容器顶部距离
    // 打字机动画显示
    const sparkToMainTop = sparkRef.current.getBoundingClientRect().top - mainRef.current.getBoundingClientRect().top;
    if (e.scrollTop + e.clientHeight - sparkToMainTop > 10) {
      setSparkStart(true);
    }
    // 卡片动画显示
    // 卡片 1 不需要显示
    const Card2ToMainTop = Card2Ref.current.getBoundingClientRect().top - mainRef.current.getBoundingClientRect().top;
    if (e.scrollTop + e.clientHeight - Card2ToMainTop > 400) {
      if (Card2Ref.current)
        Card2Ref.current.classList.add('anime-fade-in');
    }
    const Card3ToMainTop = Card3Ref.current.getBoundingClientRect().top - mainRef.current.getBoundingClientRect().top;
    if (e.scrollTop + e.clientHeight - Card3ToMainTop > 400) {
      if (Card3Ref.current)
        Card3Ref.current.classList.add('anime-fade-in');
    }
    const Card4ToMainTop = Card4Ref.current.getBoundingClientRect().top - mainRef.current.getBoundingClientRect().top;
    if (e.scrollTop + e.clientHeight - Card4ToMainTop > 400) {
      if (Card4Ref.current)
        Card4Ref.current.classList.add('anime-fade-in');
    }

  }
  useEffect(() => {
    // 添加动画就绪类，触发CSS动画
    const timer = setTimeout(() => {
      if (figureRef.current) {
        figureRef.current.classList.add('anime-ready');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);
  return (
    <div
      onScroll={onScroll}
      className="home-container has-animations">
      <header className="home-header">
        <div className="home-header-logo">
          <div className="home-header-logo-text">
            <span className="home-header-logo-text-highlight">麒麟智眸</span>
          </div>
          <div className="home-header-logo-info">智能运维管家</div>
        </div>
      </header>
      <main
        ref={mainRef}
        className="home-main">
        <section className="hero">
          <div className="container">
            <div className="hero-inner">
              <div className="hero-copy">
                <TypeWriter
                  className="hero-title"
                  delay={50}
                  text={[
                    'Hi, 我是 ',
                    { text: '麒麟智眸', className: 'hero-title-highlight' },
                    '，您的',
                    { text: '运维管家', className: 'hero-title-highlight' }
                  ]} />
                <p className="hero-paragraph">让我帮助您守护您的系统安全</p>
                <div className="hero-cta">
                  <div
                    onClick={() => navigate('dashboard')}
                    className="button button-primary">一键守护<ArrowRightOutlined /> </div>
                </div>
              </div>
              <div className="home-figure anime-element" ref={figureRef}>
                <svg className="home-figure-placeholder" width="528" height="396" viewBox="0 0 528 396">
                  <rect width="528" height="396" style={{ fill: 'transparent' }} />
                </svg>
                <div className="home-figure-box home-figure-box-01"></div>
                <div className="home-figure-box home-figure-box-02"></div>
                <div className="home-figure-box home-figure-box-03"></div>
                <div className="home-figure-box home-figure-box-04"></div>
                <div className="home-figure-box home-figure-box-05"></div>
                <div className="home-figure-box home-figure-box-06"></div>
                <div className="home-figure-box home-figure-box-07"></div>
                <div className="home-figure-box home-figure-box-08"></div>
                <div className="home-figure-box home-figure-box-09"></div>
                <div className="home-figure-box home-figure-box-10"></div>
                <div className="home-figure-box home-figure-box-routes">
                  <a
                    onClick={() => navigate('abnormal-detection/log')}
                    className="home-figure-box-route">
                    异常检测
                  </a>
                  <a
                    onClick={() => navigate('system-repair/solution')}
                    className="home-figure-box-route">
                    系统修复
                  </a>
                  <a
                    onClick={() => navigate('kylin-ai')}
                    className="home-figure-box-route">
                    Kylin智能管家
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="feature">
          <div className="feature-container">
            <div className="feature-item" style={{ opacity: 1 }}>
              <div className="feature-item-header">
                <Image
                  src={FeatureIcon01}
                  preview={false}
                  className='feature-item-header-img' />
                <div className="feature-item-header-title">
                  系统性能监控
                  <p className="feature-item-header-subtitle">一屏掌控，运筹帷幄之中</p>
                </div>
              </div>
              <div className='feature-item-content-wrapper'>
                <div className="feature-item-content">
                  <ul className="feature-item-content-left">
                    <li>实时数据采集，系统状态一目了然</li>
                    <li>多维图表展示，性能趋势直观呈现</li>
                    <li>智能预警提醒，潜在问题防患未然</li>
                  </ul>
                  <div className="feature-item-content-right">
                    <Image
                      src={FeatureImage01}
                      preview={false}
                      className='feature-item-content-right-item'
                      style={{
                        top: '-30px',
                        left: '40px'
                      }}
                    />
                    <Image
                      src={FeatureImage02}
                      preview={false}
                      className='feature-item-content-right-item'
                      style={{
                        top: '-25px',
                        left: '50px',

                      }}
                    />
                    <Image
                      src={FeatureImage03}
                      preview={false}
                      className='feature-item-content-right-item'
                      style={{
                        left: '60px',
                        top: '-20px'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="feature-item" ref={Card2Ref}>
              <div className="feature-item-header feature-right">
                <Image

                  src={FeatureIcon02}
                  preview={false}
                  className='feature-item-header-img' />
                <div className="feature-item-header-title">
                  异常检测分析
                  <p className="feature-item-header-subtitle">明察秋毫，守护系统安全</p>
                </div>
              </div>
              <div className='feature-item-content-wrapper feature-right'>
                <div className="feature-item-content feature-right">
                  <ul className="feature-item-content-left">
                    <li>全量日志监控，正常异常尽在掌握</li>
                    <li>多样图表呈现，异常趋势清晰可见</li>
                    <li>一键生成报告，PDF格式专业输出</li>
                  </ul>
                  <div className="feature-item-content-right">
                    <Image
                      src={FeatureImage06}
                      preview={false}
                      className='feature-item-content-right-item'
                      style={{
                        top: '-20px',
                        right: '70px',

                      }}
                    />
                    <Image
                      src={FeatureImage05}
                      preview={false}
                      className='feature-item-content-right-item'
                      style={{
                        top: '-15px',
                        right: '60px',

                      }}
                    />
                    <Image
                      src={FeatureImage04}
                      preview={false}
                      className='feature-item-content-right-item'
                      style={{
                        right: '50px',
                        top: '-10px',

                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="feature-item" ref={Card3Ref}>
              <div className="feature-item-header">
                <Image
                  src={FeatureIcon03}
                  preview={false}
                  className='feature-item-header-img' />
                <div className="feature-item-header-title">
                  系统修复管理
                  <p className="feature-item-header-subtitle">
                    知识沉淀，经验传承不断</p>
                </div>
              </div>
              <div className='feature-item-content-wrapper'>
                <div className="feature-item-content">
                  <ul className="feature-item-content-left">
                    <li>个人笔记记录，异常修复心得随手可得</li>
                    <li>常见问题库存，解决方案触手可及</li>
                    <li>修复报告导出，PDF格式规范呈现</li>
                  </ul>
                  <div className="feature-item-content-right">
                    <Image
                      src={FeatureImage07}
                      preview={false}
                      className='feature-item-content-right-item'
                      style={{
                        top: '-30px',
                        left: '40px'
                      }}
                    />
                    <Image
                      src={FeatureImage09}
                      preview={false}
                      className='feature-item-content-right-item'
                      style={{
                        top: '-25px',
                        left: '50px',

                      }}
                    />
                    <Image
                      src={FeatureImage08}
                      preview={false}
                      className='feature-item-content-right-item'
                      style={{
                        left: '60px',
                        top: '-20px'
                      }}
                    />
                  </div>
                </div>
                <Image
                  src={FeatureIcon05}
                  preview={false}
                  className='feature-item-placeholder' />
              </div>
            </div>
            <div className="feature-item" ref={Card4Ref}>
              <div className="feature-item-header feature-right">
                <Image
                  src={FeatureIcon04}
                  preview={false}
                  className='feature-item-header-img' />
                <div className="feature-item-header-title">
                  AI 智能助手
                  <p className="feature-item-header-subtitle">问答无忧，在线解决疑难</p>
                </div>
              </div>
              <div className='feature-item-content-wrapper feature-right'>
                <div className="feature-item-content feature-right">
                  <ul className="feature-item-content-left">
                    <li>智能问答交互，疑难问题即问即答</li>
                    <li>自动生成方案，解决思路清晰明确</li>
                    <li>检测报告输出，AI分析专业可靠</li>
                  </ul>
                  <div className="feature-item-content-right">
                    <Image
                      src={FeatureImage10}
                      preview={false}
                      className='feature-item-content-right-item'
                      style={{
                        top: '-20px',
                        right: '70px',

                      }}
                    />
                    <Image
                      src={FeatureImage11}
                      preview={false}
                      className='feature-item-content-right-item'
                      style={{
                        top: '-15px',
                        right: '60px',

                      }}
                    />
                    <Image
                      src={FeatureImage11}
                      preview={false}
                      className='feature-item-content-right-item'
                      style={{
                        right: '50px',
                        top: '-10px',

                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className='spark'>
          <div
            className='spark-container'>
            <div className='spark-background'>
              <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 434 313" fill="none">
                <path d="M4.60263 257.647L0.454102 267.431C101.348 346.683 154.704 318.896 154.704 195.039C154.704 76.5758 214.489 63.0246 337.707 155.109C378.936 184.344 407.744 185.921 423.11 158.71C437.967 132.401 435.509 80.2313 424.029 0.0131984L423.025 0.0126953C434.314 78.9027 432.816 130.892 418.849 155.626C405.391 179.458 379.579 178.046 340.443 150.295C214.446 56.1323 149.645 70.8198 149.645 195.039C149.645 313.864 102.393 334.464 4.60135 257.647H4.60263Z" fill="url(#paint0_linear_590_214)" />
                <defs>
                  <linearGradient id="paint0_linear_590_214" x1="435.587" y1="153.849" x2="1.71855" y2="153.849" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#4375A5" />
                    <stop offset="1" stop-color="white" stop-opacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className='spark-img'>
              <div >
                <Image
                  className='spark-img-item spark-img-item-1'
                  src={FeatureImage13}
                  preview={false}

                />
              </div>
              <div >
                <Image
                  className='spark-img-item spark-img-item-2'
                  src={FeatureImage14}
                  preview={false}

                />
              </div>
              <div >
                <Image
                  className='spark-img-item spark-img-item-3'
                  src={FeatureImage15}
                  preview={false}
                />
              </div>
              <div
                ref={sparkRef}
                className='spark-img-info'>
                API Provided By Kylin
                <div className="spark-img-info-text-highlight">
                  {
                    sparkStart && <TypeWriter
                      className='spark-img-info-text'
                      text={[{ text: 'Kylin OS，带来无限可能', className: 'spark-img-info-text-highlight' }]}
                    />
                  }
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className='home-footer'>
        <div className='home-footer-left'>
          <div className='home-footer-line' />
          <div className='home-footer-copyright'>
            © 2025 麒麟智眸, all rights reserved
          </div>
        </div>
        <div className='home-footer-right'>
          <div className='home-footer-options'>
            <div className='home-footer-option'>Contact</div>
            <div className='home-footer-option'>About us</div>
            <div className='home-footer-option'>FAQ's</div>
            <div className='home-footer-option'>Thanks</div>
          </div>
          <div className='home-footer-line' />
        </div>
      </footer>
    </div>
  )
}

export default Home;