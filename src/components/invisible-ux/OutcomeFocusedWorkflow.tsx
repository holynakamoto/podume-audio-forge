import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Zap, 
  Share2, 
  Download, 
  CheckCircle, 
  Clock,
  Users,
  TrendingUp 
} from 'lucide-react';
import { useInvisibleUX } from './InvisibleUXProvider';
import { toast } from 'sonner';

interface WorkflowStep {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  outcome?: string;
  timeEstimate?: string;
}

interface OutcomePreview {
  title: string;
  duration: string;
  quality: number;
  platforms: string[];
  estimatedReach: number;
}

interface OutcomeFocusedWorkflowProps {
  content: string;
  contentType: 'text' | 'url' | 'file';
  onComplete?: (result: any) => void;
}

export const OutcomeFocusedWorkflow: React.FC<OutcomeFocusedWorkflowProps> = ({
  content,
  contentType,
  onComplete
}) => {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [outcomePreview, setOutcomePreview] = useState<OutcomePreview | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<string>('podcast');
  const { setProcessing, recordUserAction, state } = useInvisibleUX();

  // Principle 6: Focus on Outcomes, Not Options
  const outcomeTypes = [
    {
      id: 'podcast',
      title: 'Professional Podcast',
      description: 'Complete audio podcast with intro, main content, and outro',
      icon: <Sparkles className="h-5 w-5" />,
      estimatedTime: '2-3 minutes',
      features: ['AI-generated script', 'Professional voice', 'Background music', 'Social assets']
    },
    {
      id: 'quick_audio',
      title: 'Quick Audio Summary',
      description: 'Fast audio summary perfect for social sharing',
      icon: <Zap className="h-5 w-5" />,
      estimatedTime: '30 seconds',
      features: ['Concise summary', 'Multiple voice options', 'Quick delivery']
    },
    {
      id: 'content_suite',
      title: 'Complete Content Suite',
      description: 'Podcast + social posts + newsletter content',
      icon: <Share2 className="h-5 w-5" />,
      estimatedTime: '3-5 minutes',
      features: ['Full podcast', 'Social media posts', 'Email content', 'Analytics insights']
    }
  ];

  // Initialize workflow based on content analysis
  useEffect(() => {
    const initializeWorkflow = () => {
      // Principle 4: Leverage AI to Anticipate and Act
      const baseSteps: WorkflowStep[] = [
        {
          id: 'analyze',
          title: 'Analyzing Content',
          status: 'processing',
          progress: 0,
          timeEstimate: '10-15 seconds'
        },
        {
          id: 'generate',
          title: 'Generating Script',
          status: 'pending',
          progress: 0,
          timeEstimate: '30-45 seconds'
        },
        {
          id: 'synthesize',
          title: 'Creating Audio',
          status: 'pending',
          progress: 0,
          timeEstimate: '60-90 seconds'
        },
        {
          id: 'optimize',
          title: 'Optimizing Quality',
          status: 'pending',
          progress: 0,
          timeEstimate: '15-20 seconds'
        }
      ];

      // Add additional steps based on selected outcome
      if (selectedOutcome === 'content_suite') {
        baseSteps.push({
          id: 'social',
          title: 'Creating Social Assets',
          status: 'pending',
          progress: 0,
          timeEstimate: '30 seconds'
        });
      }

      baseSteps.push({
        id: 'finalize',
        title: 'Finalizing Delivery',
        status: 'pending',
        progress: 0,
        timeEstimate: '5 seconds'
      });

      setSteps(baseSteps);
      
      // Generate outcome preview
      generateOutcomePreview();
    };

    initializeWorkflow();
  }, [selectedOutcome, content]);

  const generateOutcomePreview = () => {
    // Principle 4: Leverage AI to Anticipate and Act
    const wordCount = content.split(/\s+/).length;
    const estimatedDuration = Math.max(1, Math.round(wordCount / 150)); // ~150 words per minute
    
    const preview: OutcomePreview = {
      title: contentType === 'url' && content.includes('linkedin') 
        ? 'Professional Profile Podcast'
        : contentType === 'file'
        ? 'Document-Based Podcast'
        : 'Custom Content Podcast',
      duration: `${estimatedDuration}-${estimatedDuration + 1} minutes`,
      quality: Math.round(state.userConfidence * 100),
      platforms: selectedOutcome === 'content_suite' 
        ? ['Spotify', 'Apple Podcasts', 'LinkedIn', 'Twitter', 'Email']
        : ['Spotify', 'Apple Podcasts', 'Social Media'],
      estimatedReach: Math.round(100 + (state.userConfidence * 400))
    };

    setOutcomePreview(preview);
  };

  // Simulate workflow execution
  const executeWorkflow = async () => {
    setProcessing(true);
    recordUserAction(`workflow_started_${selectedOutcome}`);
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      
      // Update step to processing
      setSteps(prev => prev.map((step, index) => 
        index === i 
          ? { ...step, status: 'processing' as const, progress: 0 }
          : step
      ));

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setSteps(prev => prev.map((step, index) => 
          index === i 
            ? { ...step, progress }
            : step
        ));
      }

      // Complete step
      setSteps(prev => prev.map((step, index) => 
        index === i 
          ? { 
              ...step, 
              status: 'completed' as const, 
              progress: 100,
              outcome: getStepOutcome(step.id)
            }
          : step
      ));

      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setProcessing(false);
    recordUserAction(`workflow_completed_${selectedOutcome}`);
    toast.success('Your podcast is ready!');
    onComplete?.({
      type: selectedOutcome,
      preview: outcomePreview,
      steps: steps
    });
  };

  const getStepOutcome = (stepId: string): string => {
    switch (stepId) {
      case 'analyze': return 'Content structure optimized for audio format';
      case 'generate': return 'Professional script generated with natural flow';
      case 'synthesize': return 'High-quality audio with perfect pronunciation';
      case 'optimize': return 'Audio enhanced with professional post-processing';
      case 'social': return 'Social media assets created for maximum engagement';
      case 'finalize': return 'Ready for immediate distribution';
      default: return 'Step completed successfully';
    }
  };

  const isProcessing = steps.some(step => step.status === 'processing');
  const isCompleted = steps.every(step => step.status === 'completed');

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Principle 6: Focus on Outcomes, Not Options */}
      {!isProcessing && !isCompleted && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {outcomeTypes.map((outcome) => (
            <Card 
              key={outcome.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedOutcome === outcome.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:ring-1 hover:ring-primary/30'
              }`}
              onClick={() => setSelectedOutcome(outcome.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  {outcome.icon}
                  <div>
                    <CardTitle className="text-lg">{outcome.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{outcome.estimatedTime}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{outcome.description}</p>
                <div className="space-y-1">
                  {outcome.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Outcome Preview - Principle 9: Design for Trust and Transparency */}
      {outcomePreview && !isCompleted && (
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Predicted Outcome
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{outcomePreview.duration}</div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{outcomePreview.quality}%</div>
                <div className="text-sm text-muted-foreground">Quality Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{outcomePreview.platforms.length}</div>
                <div className="text-sm text-muted-foreground">Platforms</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{outcomePreview.estimatedReach}+</div>
                <div className="text-sm text-muted-foreground">Est. Reach</div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {outcomePreview.platforms.map((platform) => (
                <Badge key={platform} variant="secondary">{platform}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Steps - Principle 8: Make the Interface Disappear */}
      {(isProcessing || isCompleted) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Creating Your {outcomeTypes.find(o => o.id === selectedOutcome)?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : step.status === 'processing' ? (
                      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-muted rounded-full" />
                    )}
                    <span className={`font-medium ${step.status === 'completed' ? 'text-green-700' : ''}`}>
                      {step.title}
                    </span>
                  </div>
                  
                  {step.status === 'processing' && step.timeEstimate && (
                    <span className="text-sm text-muted-foreground">{step.timeEstimate}</span>
                  )}
                </div>
                
                {step.status !== 'pending' && (
                  <Progress value={step.progress} className="h-2" />
                )}
                
                {step.outcome && (
                  <p className="text-sm text-muted-foreground ml-8">{step.outcome}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      {!isProcessing && !isCompleted && (
        <div className="flex justify-center">
          <Button 
            onClick={executeWorkflow}
            size="lg"
            className="px-8 py-3 text-lg"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Create {outcomeTypes.find(o => o.id === selectedOutcome)?.title}
          </Button>
        </div>
      )}

      {/* Completion Actions */}
      {isCompleted && (
        <div className="flex justify-center gap-4">
          <Button size="lg" className="px-6">
            <Download className="h-5 w-5 mr-2" />
            Download
          </Button>
          <Button size="lg" variant="outline" className="px-6">
            <Share2 className="h-5 w-5 mr-2" />
            Share
          </Button>
        </div>
      )}
    </div>
  );
};