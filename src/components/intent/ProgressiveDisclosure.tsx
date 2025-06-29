
import React, { useState, useEffect } from 'react';
import { useIntent } from './IntentProvider';

interface ProgressiveDisclosureProps {
  children: React.ReactNode;
  triggerCondition: 'timeOnSite' | 'scrollDepth' | 'sectionViewed' | 'interactionCount';
  threshold: number | string;
  delay?: number;
  animationClass?: string;
}

export const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  children,
  triggerCondition,
  threshold,
  delay = 0,
  animationClass = 'animate-fade-in'
}) => {
  const { userIntent } = useIntent();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkCondition = () => {
      switch (triggerCondition) {
        case 'timeOnSite':
          return userIntent.timeOnSite >= (threshold as number);
        case 'scrollDepth':
          return userIntent.scrollDepth >= (threshold as number);
        case 'sectionViewed':
          return userIntent.sectionsViewed.includes(threshold as string);
        case 'interactionCount':
          return userIntent.interactionCount >= (threshold as number);
        default:
          return false;
      }
    };

    if (checkCondition() && !isVisible) {
      if (delay > 0) {
        setTimeout(() => setIsVisible(true), delay * 1000);
      } else {
        setIsVisible(true);
      }
    }
  }, [userIntent, triggerCondition, threshold, delay, isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={animationClass}>
      {children}
    </div>
  );
};
