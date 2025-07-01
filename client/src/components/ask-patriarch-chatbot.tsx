import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, Send, Loader2, Crown, Lightbulb, Sparkles } from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'patriarch';
  content: string;
  timestamp: Date;
}

export default function AskPatriarchChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'patriarch',
      content: 'نعمة ربنا يسوع المسيح تكون معكم جميعاً. أنا هنا للإجابة على أسئلتكم حول تاريخ البطاركة الأقباط الأرثوذكس عبر العصور. اسألوني عن أي بطريرك أو فترة تاريخية تريدون معرفة المزيد عنها.',
      timestamp: new Date()
    }
  ]);
  
  const [question, setQuestion] = useState('');

  const askPatriarchMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest('/api/ask-patriarch', 'POST', { question });
      return response.json().then(data => data.answer);
    },
    onSuccess: (answer) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'patriarch',
        content: answer,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
    },
    onError: (error) => {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'patriarch',
        content: 'عذراً، حدث خطأ أثناء معالجة سؤالك. يرجى المحاولة مرة أخرى.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentQuestion = question;
    setQuestion('');

    // Send to AI
    askPatriarchMutation.mutate(currentQuestion);
  };

  const suggestedQuestions = [
    "من هو أول بطريرك للكنيسة القبطية؟",
    "أخبرني عن البطاركة في العصر الحديث",
    "ما هي أهم البدع التي حاربها البطاركة؟",
    "من هم البطاركة الذين عاشوا أطول فترة؟"
  ];

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in-0 duration-500 max-h-screen">
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg flex-1 flex flex-col shadow-xl backdrop-blur-sm min-h-0">
        <div className="p-1.5 border-b border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-100/50 to-orange-100/50 dark:from-amber-900/30 dark:to-orange-900/30 flex-shrink-0">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Sparkles className="h-2.5 w-2.5 text-amber-600 animate-pulse" />
            <Crown className="h-3 w-3 text-amber-700 animate-bounce" />
            <Sparkles className="h-2.5 w-2.5 text-amber-600 animate-pulse delay-150" />
          </div>
          <p className="text-amber-700 dark:text-amber-300 text-xs text-center font-medium leading-tight">
            استكشف تاريخ الكنيسة القبطية الأرثوذكسية مع خبير ذكي يعرف كل شيء عن البطاركة
          </p>
        </div>
        
        <div className="flex-1 flex flex-col relative overflow-hidden min-h-0">
          {/* Chat Messages */}
          <div className="flex-1 p-1.5 overflow-hidden min-h-0">
            <ScrollArea className="h-full p-1.5 bg-white dark:bg-gray-900 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="space-y-1.5 pb-2">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-3 duration-500`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`max-w-[85%] p-1.5 rounded-lg shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-md ${
                      message.type === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-200 dark:shadow-blue-900/30'
                        : 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900 dark:to-orange-900 text-amber-900 dark:text-amber-100 border border-amber-300 dark:border-amber-700 shadow-amber-200 dark:shadow-amber-900/30'
                    }`}
                  >
                    {message.type === 'patriarch' && (
                      <div className="flex items-center gap-1 mb-0.5 animate-in fade-in duration-300">
                        <Crown className="h-2.5 w-2.5 text-amber-600 animate-pulse" />
                        <span className="font-semibold text-xs bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">البطريرك الخبير</span>
                        <Sparkles className="h-2 w-2 text-amber-500 animate-spin" />
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed text-xs">
                      {message.content}
                    </p>
                    <div className="text-xs opacity-60 mt-0.5">
                      {message.timestamp.toLocaleTimeString('ar-EG')}
                    </div>
                  </div>
                </div>
              ))}
              
              {askPatriarchMutation.isPending && (
                <div className="flex justify-start animate-in slide-in-from-bottom-3 duration-500">
                  <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 text-amber-900 dark:text-amber-100 border border-amber-300 dark:border-amber-700 p-1.5 rounded-lg shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="relative">
                        <Loader2 className="h-3 w-3 animate-spin text-amber-600" />
                        <div className="absolute inset-0 animate-ping">
                          <Loader2 className="h-3 w-3 text-amber-400 opacity-30" />
                        </div>
                      </div>
                      <span className="text-xs font-medium">البطريرك يعد الإجابة...</span>
                      <div className="flex gap-0.5">
                        <div className="w-1 h-1 bg-amber-500 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-amber-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1 h-1 bg-amber-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          </div>

          {/* Fixed Bottom Panel */}
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-amber-950/20 border-t border-amber-200 dark:border-amber-800 p-1.5 flex-shrink-0">
            {/* Suggested Questions */}
            <div className="mb-1">
              <div className="flex items-center gap-1 mb-1">
                <Lightbulb className="h-2 w-2 text-amber-600 animate-pulse" />
                <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">أسئلة مقترحة:</span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {suggestedQuestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-right justify-start h-5 px-1.5 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-950/30 dark:hover:to-orange-950/30 transition-all duration-300 text-xs w-full"
                    onClick={() => setQuestion(suggestion)}
                    disabled={askPatriarchMutation.isPending}
                  >
                    <span className="truncate text-xs">{suggestion}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Question Input */}
            <form onSubmit={handleSubmit}>
              <div className="flex gap-1 items-center">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="اكتب سؤالك هنا..."
                  className="flex-1 text-right border-amber-300 dark:border-amber-700 focus:border-amber-500 focus:ring-amber-500 transition-all duration-300 rounded-md shadow-sm text-xs h-6 px-2"
                  disabled={askPatriarchMutation.isPending}
                  dir="rtl"
                />
                <Button
                  type="submit"
                  disabled={!question.trim() || askPatriarchMutation.isPending}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 h-6 min-w-[24px]"
                >
                  {askPatriarchMutation.isPending ? (
                    <Loader2 className="h-2 w-2 animate-spin" />
                  ) : (
                    <Send className="h-2 w-2" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}