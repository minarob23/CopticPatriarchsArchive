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
    <div className="w-full h-full flex flex-col animate-in fade-in-0 duration-500">
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg flex-1 flex flex-col shadow-xl backdrop-blur-sm">
        <div className="p-2 border-b border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-100/50 to-orange-100/50 dark:from-amber-900/30 dark:to-orange-900/30">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Sparkles className="h-3 w-3 text-amber-600 animate-pulse" />
            <Crown className="h-4 w-4 text-amber-700 animate-bounce" />
            <Sparkles className="h-3 w-3 text-amber-600 animate-pulse delay-150" />
          </div>
          <p className="text-amber-700 dark:text-amber-300 text-xs text-center font-medium leading-relaxed">
            استكشف تاريخ الكنيسة القبطية الأرثوذكسية مع خبير ذكي يعرف كل شيء عن البطاركة
          </p>
        </div>
        
        <div className="p-2 flex-1 flex flex-col">
          {/* Chat Messages */}
          <ScrollArea className="flex-1 mb-2 p-2 bg-white dark:bg-gray-900 rounded-lg border border-amber-200 dark:border-amber-800 min-h-0">
            <div className="space-y-2">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-3 duration-500`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`max-w-[85%] p-2 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-lg ${
                      message.type === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-200 dark:shadow-blue-900/30'
                        : 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900 dark:to-orange-900 text-amber-900 dark:text-amber-100 border border-amber-300 dark:border-amber-700 shadow-amber-200 dark:shadow-amber-900/30'
                    }`}
                  >
                    {message.type === 'patriarch' && (
                      <div className="flex items-center gap-1 mb-1 animate-in fade-in duration-300">
                        <Crown className="h-3 w-3 text-amber-600 animate-pulse" />
                        <span className="font-semibold text-xs bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">البطريرك الخبير</span>
                        <Sparkles className="h-2 w-2 text-amber-500 animate-spin" />
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed text-sm">
                      {message.content}
                    </p>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('ar-EG')}
                    </div>
                  </div>
                </div>
              ))}
              
              {askPatriarchMutation.isPending && (
                <div className="flex justify-start animate-in slide-in-from-bottom-3 duration-500">
                  <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 text-amber-900 dark:text-amber-100 border border-amber-300 dark:border-amber-700 p-2 rounded-xl shadow-md">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                        <div className="absolute inset-0 animate-ping">
                          <Loader2 className="h-4 w-4 text-amber-400 opacity-30" />
                        </div>
                      </div>
                      <span className="text-xs font-medium">البطريرك يعد الإجابة...</span>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Suggested Questions */}
          <div className="mb-2">
            <div className="flex items-center gap-1 mb-2 animate-in fade-in duration-300">
              <Lightbulb className="h-3 w-3 text-amber-600 animate-pulse" />
              <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                أسئلة مقترحة:
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestedQuestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-right justify-start h-auto p-2 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-950/30 dark:hover:to-orange-950/30 transition-all duration-300 hover:scale-105 hover:shadow-md animate-in slide-in-from-bottom-2 duration-500 text-xs"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setQuestion(suggestion)}
                  disabled={askPatriarchMutation.isPending}
                >
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-2 w-2 opacity-50" />
                    <span>{suggestion}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <Separator className="my-2 bg-amber-300 dark:bg-amber-700" />

          {/* Question Input */}
          <form onSubmit={handleSubmit} className="animate-in slide-in-from-bottom-2 duration-500">
            <div className="flex gap-1.5 items-center">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="اكتب سؤالك هنا..."
                className="flex-1 text-right border-amber-300 dark:border-amber-700 focus:border-amber-500 focus:ring-amber-500 transition-all duration-300 focus:scale-[1.01] rounded-md shadow-sm text-sm h-7 px-2"
                disabled={askPatriarchMutation.isPending}
                dir="rtl"
              />
              <Button
                type="submit"
                disabled={!question.trim() || askPatriarchMutation.isPending}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-2 rounded-md shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 h-7 min-w-[28px]"
              >
                {askPatriarchMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Send className="h-3 w-3 transition-transform duration-200 hover:translate-x-1" />
                )}
              </Button>
            </div>
            
            <p className="text-xs text-amber-600 dark:text-amber-400 text-center mt-1">
              💡 يمكنك أن تسأل عن أي بطريرك أو فترة تاريخية أو موضوع متعلق بتاريخ الكنيسة القبطية
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}