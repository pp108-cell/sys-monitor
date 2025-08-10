import { useEffect, useState, type FC } from "react";
import './index.less';

type TextSegment = string | {
  text: string;
  className: string;
};

const TypeWriter: FC<{
  text: TextSegment[] | string;
  className: string;
  delay?: number
}> = ({
  text,
  className,
  delay = 100
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentCharIndex, setCurrentCharIndex] = useState(0);

    const textArray = typeof text === 'string' ? [text] : text;

    useEffect(() => {
      const timeout = setTimeout(() => {
        const currentSegment = textArray[currentIndex];
        const currentText = typeof currentSegment === 'string'
          ? currentSegment
          : currentSegment.text;

        if (currentCharIndex < currentText.length) {
          setCurrentCharIndex(prev => prev + 1);
        } else if (currentIndex < textArray.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setCurrentCharIndex(0);
        }
      }, delay);

      return () => clearTimeout(timeout);
    }, [currentIndex, currentCharIndex, textArray, delay]);

    return (
      <div className={`type-writer ${className}`}>
        {textArray.map((segment, index) => {
          if (index > currentIndex) return null;

          const segmentText = typeof segment === 'string' ? segment : segment.text;
          const segmentClass = typeof segment === 'string' ? '' : segment.className;

          if (index === currentIndex) {
            return (
              <span key={index} className={segmentClass}>
                {segmentText.slice(0, currentCharIndex)}
              </span>
            );
          }

          return (
            <span key={index} className={segmentClass}>
              {segmentText}
            </span>
          );
        })}
      </div>
    );
  };

export default TypeWriter;
