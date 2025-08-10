/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadFull } from 'tsparticles';
const LinksBackground: React.FC<{ options: any, className?: string, children: React.ReactNode }> = ({ options, className, children }) => {
  const [init, setInit] = useState(false);

  // 初始化tsparticles引擎
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  return (
    <div className={`particle-container ${className || ''}`}>
      {init && (
        <Particles
          id="particle"
          options={options}
        />
      )}
      <div className='particle-child-content'>
        {children}
      </div>
    </div>
  )
}

export default LinksBackground;