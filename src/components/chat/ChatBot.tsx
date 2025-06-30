
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useContextAwareness } from '@/hooks/useContextAwareness';
import { useIntent } from '@/components/intent/IntentProvider';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  context?: any;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { context, getContextualInsights, trackInteraction } = useContextAwareness();
  const { userIntent } = useIntent();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with context-aware greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const insights = getContextualInsights();
      let greeting = "Hi! I'm your context-aware Podumé assistant. ";
      
      // Customize greeting based on user context
      if (insights.journeyStage === 'discovery') {
        greeting += "I can see you're exploring what we offer. What would you like to know about creating podcasts from your resume?";
      } else if (insights.journeyStage === 'consideration' && userIntent.sectionsViewed.includes('pricing')) {
        greeting += "I notice you've been looking at our pricing. I can help you choose the right package for your needs!";
      } else if (userIntent.timeOnSite > 60) {
        greeting += "You've been exploring for a while - I'm here to help you find exactly what you need!";
      } else {
        greeting += "How can I help you create an amazing podcast today?";
      }

      const initialMessage: Message = {
        id: '1',
        text: greeting,
        sender: 'bot',
        timestamp: new Date(),
        context: { insights, userIntent }
      };

      setMessages([initialMessage]);
    }
  }, [isOpen, messages.length, getContextualInsights, userIntent]);

  const generateContextAwareBotResponse = (userMessage: string): string => {
    const lowercaseMessage = userMessage.toLowerCase();
    const insights = getContextualInsights();
    
    // Context-aware responses based on user journey
    if (insights.journeyStage === 'consideration' && (lowercaseMessage.includes('price') || lowercaseMessage.includes('cost'))) {
      return `Based on your interest in our pricing, I'd recommend starting with our Core package at $9.99. Given that you've been exploring our features, it seems like a great fit! You can always upgrade later. Would you like me to explain what's included?`;
    }
    
    if (insights.journeyStage === 'discovery' && (lowercaseMessage.includes('how') && lowercaseMessage.includes('work'))) {
      return `Perfect timing! Since you're new here, let me walk you through it: Upload your resume or LinkedIn profile, choose your preferred voice style, and our AI creates a professional podcast in minutes. I can see you're on ${userIntent.deviceType} - the process is optimized for your device. Want to see a sample first?`;
    }
    
    // Device-specific responses
    if (userIntent.deviceType === 'mobile' && (lowercaseMessage.includes('upload') || lowercaseMessage.includes('file'))) {
      return `On mobile, you can easily upload your resume by tapping the upload button or taking a photo of your printed resume. Our mobile interface makes it super simple! You can also paste your LinkedIn URL if that's easier.`;
    }
    
    // Time-aware responses
    if (context.preferences.timeOfUse === 'evening' && lowercaseMessage.includes('time')) {
      return `I see it's evening for you! Perfect time to work on your career. Most podcasts are created in just 2-3 minutes, so you'll have your professional audio ready before bedtime. Quick question - are you preparing for job applications?`;
    }
    
    // Engagement-aware responses
    if (userIntent.engagementLevel === 'high' && lowercaseMessage.includes('help')) {
      return `I can see you're really engaged with exploring Podumé! That's awesome. Since you've been actively browsing, you're probably ready to create something amazing. What specific aspect would you like help with - content creation, voice selection, or getting started with your first podcast?`;
    }
    
    // Network-aware responses
    if (context.technical.networkSpeed === 'slow' && lowercaseMessage.includes('audio')) {
      return `I notice you're on a slower connection, so I'll focus on the essentials: We offer multiple AI voice options, and the audio files are optimized for streaming. You can preview voices without downloading large files. Would you like me to show you the most efficient way to create your podcast?`;
    }
    
    // Fallback responses with context
    const contextualEnding = insights.urgency === 'high' ? " Let's get you started quickly!" :
                           userIntent.timeOnSite > 120 ? " You've been thorough in your research - ready to create?" :
                           " Take your time exploring!";
    
    if (lowercaseMessage.includes('voice') || lowercaseMessage.includes('audio')) {
      return `We offer several professional AI voices to match your style and industry.${contextualEnding}`;
    }
    
    return `Great question! I'm here to help with anything about Podumé. Based on your browsing patterns, I think you'd be most interested in our quick-start guide.${contextualEnding}`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    trackInteraction('chatbot_message_sent', { message: inputValue });

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay with context-aware timing
    const typingDelay = context.preferences.engagementStyle === 'quick' ? 800 : 1200;
    
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateContextAwareBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date(),
        context: { userIntent, insights: getContextualInsights() }
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, typingDelay);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    trackInteraction('chatbot_opened');
  };

  const getContextBadge = () => {
    const insights = getContextualInsights();
    return insights.journeyStage;
  };

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 left-6 z-50">
        {!isOpen && (
          <Button
            onClick={handleOpen}
            className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative"
          >
            <MessageCircle className="h-6 w-6" />
            <Brain className="h-3 w-3 absolute -top-1 -right-1 text-amber-200" />
          </Button>
        )}
      </div>

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-50 w-80 h-96 bg-background border border-border rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-purple-600 to-amber-500 rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">AI Assistant</h3>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-white/80">Context-Aware</p>
                  <Badge variant="secondary" className="text-xs">
                    {getContextBadge()}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-amber-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="icon" className="bg-gradient-to-r from-purple-600 to-amber-500">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
