import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Info, Sparkles } from 'lucide-react';
import { useInvisibleUX } from './InvisibleUXProvider';

interface ContentQuality {
  score: number;
  issues: string[];
  suggestions: string[];
  confidence: number;
}

interface InvisibleGuardrailsProps {
  content?: string;
  contentType?: 'text' | 'url' | 'file';
  onQualityUpdate?: (quality: ContentQuality) => void;
}

export const InvisibleGuardrails: React.FC<InvisibleGuardrailsProps> = ({
  content,
  contentType,
  onQualityUpdate
}) => {
  const [quality, setQuality] = useState<ContentQuality>({
    score: 0.8,
    issues: [],
    suggestions: [],
    confidence: 0.7
  });
  const [showDetails, setShowDetails] = useState(false);
  const { updateQualityScore, state } = useInvisibleUX();

  // Principle 5: Build Invisible Guardrails
  useEffect(() => {
    if (!content) return;

    const analyzeContent = () => {
      const issues: string[] = [];
      const suggestions: string[] = [];
      let score = 1.0;

      // Content length analysis
      if (content.length < 50) {
        issues.push('Content might be too brief for a meaningful podcast');
        suggestions.push('Consider adding more context or details');
        score -= 0.2;
      } else if (content.length > 5000) {
        suggestions.push('Content is quite lengthy - we can help optimize it');
        score -= 0.1;
      }

      // LinkedIn URL validation
      if (contentType === 'url' && content.includes('linkedin.com/in/')) {
        if (!content.match(/linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/)) {
          issues.push('LinkedIn URL format seems incomplete');
          suggestions.push('Make sure you copied the full profile URL');
          score -= 0.3;
        } else {
          suggestions.push('Great! LinkedIn profiles create excellent podcasts');
          score += 0.1;
        }
      }

      // General URL validation
      if (contentType === 'url' && !content.match(/^https?:\/\/.+/)) {
        issues.push('URL format appears invalid');
        suggestions.push('Make sure the URL starts with http:// or https://');
        score -= 0.4;
      }

      // Content quality heuristics
      const wordCount = content.split(/\s+/).length;
      if (wordCount < 10) {
        issues.push('Very brief content detected');
        suggestions.push('Adding more information will create a richer podcast');
        score -= 0.2;
      }

      // Professional context detection
      const professionalKeywords = ['experience', 'career', 'skills', 'achievements', 'work', 'company', 'role'];
      const hasProfessionalContext = professionalKeywords.some(keyword => 
        content.toLowerCase().includes(keyword)
      );
      
      if (hasProfessionalContext) {
        suggestions.push('Professional content detected - perfect for podcast creation!');
        score += 0.1;
      }

      // Calculate confidence based on content analysis
      const confidence = Math.min(
        0.5 + (wordCount / 100) * 0.3 + (hasProfessionalContext ? 0.2 : 0),
        1.0
      );

      const newQuality = {
        score: Math.max(0.1, Math.min(1.0, score)),
        issues,
        suggestions,
        confidence
      };

      setQuality(newQuality);
      updateQualityScore(newQuality.score);
      onQualityUpdate?.(newQuality);
    };

    const debounceTimer = setTimeout(analyzeContent, 500);
    return () => clearTimeout(debounceTimer);
  }, [content, contentType, updateQualityScore, onQualityUpdate]);

  // Principle 9: Design for Trust and Transparency
  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 0.8) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 0.6) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  if (!content) return null;

  return (
    <div className="w-full space-y-3">
      {/* Quality indicator - subtle but informative */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-3">
          {getQualityIcon(quality.score)}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Content Quality</span>
              <Badge variant="outline" className={getQualityColor(quality.score)}>
                {Math.round(quality.score * 100)}%
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Confidence: {Math.round(quality.confidence * 100)}%
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-primary hover:underline"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {/* Progress indicator */}
      <Progress value={quality.score * 100} className="h-2" />

      {/* Detailed feedback - only shown when requested */}
      {showDetails && (
        <div className="space-y-3">
          {/* Issues */}
          {quality.issues.length > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium text-yellow-800">Areas to consider:</div>
                  {quality.issues.map((issue, index) => (
                    <div key={index} className="text-sm text-yellow-700">• {issue}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Suggestions */}
          {quality.suggestions.length > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium text-blue-800">Suggestions:</div>
                  {quality.suggestions.map((suggestion, index) => (
                    <div key={index} className="text-sm text-blue-700">• {suggestion}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Trust indicators */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Info className="h-3 w-3" />
              Trust Level: {state.trustLevel}
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Analysis Confidence: {Math.round(quality.confidence * 100)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};