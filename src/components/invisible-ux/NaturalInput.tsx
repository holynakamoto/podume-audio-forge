import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Upload, Link, Sparkles } from 'lucide-react';
import { useInvisibleUX } from './InvisibleUXProvider';
import { toast } from 'sonner';

interface NaturalInputProps {
  onContentDetected: (content: string, type: 'text' | 'url' | 'file' | 'voice') => void;
  placeholder?: string;
}

export const NaturalInput: React.FC<NaturalInputProps> = ({
  onContentDetected,
  placeholder = "Tell me what you'd like to create, paste a LinkedIn URL, upload a file, or just speak naturally..."
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { recordUserAction, anticipateUserNeed, state } = useInvisibleUX();

  // Principle 3: Design for Natural Expression
  const detectContentType = useCallback((text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const linkedinRegex = /linkedin\.com\/in\/[^\s]+/i;
    
    if (linkedinRegex.test(text)) {
      return 'linkedin_profile';
    } else if (urlRegex.test(text)) {
      return 'general_url';
    } else if (text.length > 100) {
      return 'long_content';
    } else {
      return 'intent_description';
    }
  }, []);

  // Principle 4: Leverage AI to Anticipate and Act
  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    if (value.length > 10) {
      const contentType = detectContentType(value);
      
      // Anticipate user needs based on input pattern
      if (contentType === 'linkedin_profile') {
        anticipateUserNeed('linkedin_podcast_creation');
      } else if (contentType === 'long_content') {
        anticipateUserNeed('content_optimization');
      }
    }
  };

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    
    const contentType = detectContentType(inputValue);
    recordUserAction(`natural_input_${contentType}`);
    onContentDetected(inputValue, 'text');
    
    toast.success('Content detected! Processing your request...');
    setInputValue('');
  };

  // Voice input using Web Speech API
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice input not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      recordUserAction('voice_input_started');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      handleInputChange(transcript);
      recordUserAction('voice_input_completed');
      toast.success('Voice input captured!');
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Voice input failed. Please try again.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Drag and drop functionality
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      recordUserAction('file_dropped');
      
      if (file.type === 'application/pdf') {
        onContentDetected(file.name, 'file');
        toast.success('PDF detected! Processing your document...');
      } else {
        toast.error('Please upload a PDF file');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      recordUserAction('file_selected');
      onContentDetected(file.name, 'file');
      toast.success('File selected! Processing...');
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Principle 9: Design for Trust and Transparency */}
      {state.anticipatedNeeds.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            <span>I can help you with: {state.anticipatedNeeds[0].replace('_', ' ')}</span>
          </div>
        </div>
      )}

      {/* Natural input area */}
      <div 
        className={`relative border-2 border-dashed rounded-lg transition-all duration-200 ${
          isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/20 hover:border-primary/40'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-6 space-y-4">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[80px] border-0 bg-transparent resize-none focus-visible:ring-0 text-lg"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit();
              }
            }}
          />
          
          {isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-lg">
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-lg font-medium text-primary">Drop your file here</p>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between p-4 border-t bg-muted/20">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={startVoiceInput}
              disabled={isListening}
              className="flex items-center gap-2"
            >
              <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse text-red-500' : ''}`} />
              {isListening ? 'Listening...' : 'Voice'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Create Podcast
          </Button>
        </div>
      </div>

      {/* Quick actions based on detected patterns */}
      {inputValue && (
        <div className="flex flex-wrap gap-2">
          {detectContentType(inputValue) === 'linkedin_profile' && (
            <Button variant="outline" size="sm" onClick={handleSubmit}>
              <Link className="h-4 w-4 mr-2" />
              Import LinkedIn Profile
            </Button>
          )}
          {inputValue.length > 100 && (
            <Button variant="outline" size="sm" onClick={handleSubmit}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate from Text
            </Button>
          )}
        </div>
      )}
    </div>
  );
};