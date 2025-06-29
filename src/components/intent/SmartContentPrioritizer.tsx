
import React, { useEffect } from 'react';
import { useIntent } from './IntentProvider';

interface SmartContentPrioritizerProps {
  children: React.ReactNode;
  sectionId: string;
  priority: 'high' | 'medium' | 'low';
  showCondition?: (userIntent: any) => boolean;
}

export const SmartContentPrioritizer: React.FC<SmartContentPrioritizerProps> = ({
  children,
  sectionId,
  priority,
  showCondition
}) => {
  const { userIntent, trackSectionView } = useIntent();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackSectionView(sectionId);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById(sectionId);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [sectionId, trackSectionView]);

  // Determine if content should be shown based on user intent
  const shouldShow = () => {
    if (showCondition) {
      return showCondition(userIntent);
    }

    // Default prioritization logic
    if (userIntent.engagementLevel === 'low' && priority === 'low') {
      return false;
    }

    if (userIntent.deviceType === 'mobile' && priority === 'low') {
      return false;
    }

    return true;
  };

  // Determine order/styling based on user intent
  const getOrderClass = () => {
    if (userIntent.primaryGoal === 'pricing' && sectionId === 'pricing') {
      return 'order-first';
    }
    if (userIntent.primaryGoal === 'join_community' && sectionId === 'community') {
      return 'order-first';
    }
    if (userIntent.primaryGoal === 'create_podcast' && sectionId === 'hero') {
      return 'order-first';
    }
    return '';
  };

  if (!shouldShow()) {
    return null;
  }

  return (
    <div id={sectionId} className={getOrderClass()}>
      {children}
    </div>
  );
};
