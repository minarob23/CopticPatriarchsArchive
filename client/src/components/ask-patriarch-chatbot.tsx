import { useState, useEffect, useRef } from "react";
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
      content: '🔍 مرحباً بك في البحث الذكي المطور! أنا خبير تاريخ الكنيسة القبطية الأرثوذكسية مع إمكانية الوصول للمصادر التالية:\n\n📚 **المصادر المتاحة:**\n• قاعدة البيانات الرئيسية للبطاركة\n• ملفات البيانات التاريخية الخارجية\n• المراجع النصية الإضافية\n• المعرفة التاريخية العامة\n\nيمكنني مساعدتك في العثور على أي معلومة عن البطاركة، الأحداث التاريخية، البدع، الإنجازات الكنسية، والسياق التاريخي. اسأل عن أي شيء تريد معرفته! 🏛️✨',
      timestamp: new Date()
    }
  ]);

  const [question, setQuestion] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const askPatriarchMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest('POST', '/api/ask-patriarch', { question });
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for messages from search buttons
  useEffect(() => {
    const handleSendToChatbot = (event: CustomEvent) => {
      const message = event.detail.message;
      if (message && message.trim()) {
        setQuestion(message);
        // Auto-submit the question
        setTimeout(() => {
          const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: message,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, userMessage]);
          askPatriarchMutation.mutate(message);
        }, 100);
      }
    };

    window.addEventListener('sendToChatbot', handleSendToChatbot as EventListener);
    return () => {
      window.removeEventListener('sendToChatbot', handleSendToChatbot as EventListener);
    };
  }, [askPatriarchMutation]);

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
    "من هو أول بطريرك للكنيسة القبطية وما هو السياق التاريخي لتأسيس الكنيسة؟",
    "قارن بين البطاركة في العصر الحديث والعصور القديمة من ناحية التحديات",
    "ما هي أهم البدع التي حاربها البطاركة وكيف أثرت على تطور العقيدة؟",
    "أخبرني عن تأثير البطاركة على المجتمع المصري عبر التاريخ",
    "ما هي أبرز الإنجازات المعمارية والثقافية للبطاركة؟",
    "كيف تطورت مؤسسة البطريركية عبر العصور المختلفة؟"
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

        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 overflow-hidden bg-white dark:bg-gray-900 m-2 rounded-lg border border-amber-200 dark:border-amber-800">
            <ScrollArea className="h-full w-full">
              <div className="p-4 space-y-4 min-h-full">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-3 duration-500`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-lg ${
                        message.type === 'user'
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-200 dark:shadow-blue-900/30'
                          : 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900 dark:to-orange-900 text-amber-900 dark:text-amber-100 border border-amber-300 dark:border-amber-700 shadow-amber-200 dark:shadow-amber-900/30'
                      }`}
                    >
                      {message.type === 'patriarch' && (
                        <div className="flex items-center gap-2 mb-2 animate-in fade-in duration-300">
                          <Crown className="h-4 w-4 text-amber-600 animate-pulse" />
                          <span className="font-semibold text-sm bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">البطريرك الخبير</span>
                          <Sparkles className="h-3 w-3 text-amber-500 animate-spin" />
                        </div>
                      )}
                      <div 
                        className="whitespace-pre-wrap leading-relaxed text-sm"
                        dangerouslySetInnerHTML={{
                          __html: message.content
                            // Handle tables with | separators
                            .replace(/\|([^|\n]+)\|([^|\n]+)\|([^|\n]+)\|/g, 
                              '<table class="w-full border-collapse border border-amber-300 dark:border-amber-700 my-3 text-xs"><tr><td class="border border-amber-300 dark:border-amber-700 p-2 bg-amber-50 dark:bg-amber-900/30">$1</td><td class="border border-amber-300 dark:border-amber-700 p-2 bg-amber-50 dark:bg-amber-900/30">$2</td><td class="border border-amber-300 dark:border-amber-700 p-2 bg-amber-50 dark:bg-amber-900/30">$3</td></tr></table>')
                            
                            // Handle table headers with :--- separators
                            .replace(/\|([^|\n]+)\|([^|\n]+)\|([^|\n]+)\|\s*\n\s*\|[\s\-:]+\|[\s\-:]+\|[\s\-:]+\|/g,
                              '<table class="w-full border-collapse border border-amber-300 dark:border-amber-700 my-3 text-xs"><thead><tr><th class="border border-amber-300 dark:border-amber-700 p-2 bg-amber-100 dark:bg-amber-800 font-bold">$1</th><th class="border border-amber-300 dark:border-amber-700 p-2 bg-amber-100 dark:bg-amber-800 font-bold">$2</th><th class="border border-amber-300 dark:border-amber-700 p-2 bg-amber-100 dark:bg-amber-800 font-bold">$3</th></tr></thead><tbody>')
                            
                            // Handle ### headings
                            .replace(/###\s*(.*?)$/gm, '<h3 class="text-lg font-bold text-amber-700 dark:text-amber-300 mt-4 mb-2 border-b border-amber-300 dark:border-amber-700 pb-1">$1</h3>')
                            
                            // Handle ## headings  
                            .replace(/##\s*(.*?)$/gm, '<h2 class="text-xl font-bold text-amber-800 dark:text-amber-200 mt-5 mb-3 border-b-2 border-amber-400 dark:border-amber-600 pb-2">$1</h2>')
                            
                            // Handle # headings
                            .replace(/#\s*(.*?)$/gm, '<h1 class="text-2xl font-bold text-amber-900 dark:text-amber-100 mt-6 mb-4 border-b-2 border-amber-500 dark:border-amber-500 pb-2">$1</h1>')
                            
                            // Handle bullet points with *
                            .replace(/^\*\s*(.*?)$/gm, '<li class="text-amber-800 dark:text-amber-200 mb-1 mr-4">• $1</li>')
                            
                            // Handle numbered lists
                            .replace(/^(\d+)\.\s*(.*?)$/gm, '<li class="text-amber-800 dark:text-amber-200 mb-1 mr-4">$1. $2</li>')
                            
                            // Handle bold text
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-amber-800 dark:text-amber-200">$1</strong>')
                            
                            // Handle italic text
                            .replace(/\*(.*?)\*/g, '<em class="italic text-amber-700 dark:text-amber-300">$1</em>')
                            
                            // Wrap consecutive list items in ul tags
                            .replace(/((<li[^>]*>.*?<\/li>\s*){2,})/g, '<ul class="list-none mr-4 my-2">$1</ul>')
                            
                            // Handle line breaks
                            .replace(/\n/g, '<br/>')
                        }}
                      />
                      <div className="text-xs opacity-70 mt-2 text-left">
                        {message.timestamp.toLocaleTimeString('ar-EG')}
                      </div>
                    </div>
                  </div>
                ))}

                {askPatriarchMutation.isPending && (
                  <div className="flex justify-start animate-in slide-in-from-bottom-3 duration-500">
                    <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 text-amber-900 dark:text-amber-100 border border-amber-300 dark:border-amber-700 p-4 rounded-xl shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
                          <div className="absolute inset-0 animate-ping">
                            <Loader2 className="h-5 w-5 text-amber-400 opacity-30" />
                          </div>
                        </div>
                        <span className="text-sm font-medium">البطريرك يعد الإجابة...</span>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Extra padding at bottom to ensure last message is visible */}
                <div className="h-4"></div>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Fixed Bottom Panel */}
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-amber-950/20 border-t border-amber-200 dark:border-amber-800 p-4 flex-shrink-0">
            {/* Suggested Questions */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <Lightbulb className="h-5 w-5 text-amber-600 animate-pulse drop-shadow-sm" />
                  <div className="absolute -inset-1 bg-amber-400/20 rounded-full blur-sm animate-pulse"></div>
                </div>
                <span className="text-base text-amber-800 dark:text-amber-200 font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  أسئلة مقترحة للبدء
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-amber-300 via-orange-300 to-transparent"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {suggestedQuestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-xl border-2 border-amber-300/60 dark:border-amber-700/60 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/40 dark:via-orange-900/40 dark:to-yellow-900/40 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-xl hover:shadow-amber-500/25 transition-all duration-300 hover:scale-[1.02] animate-in slide-in-from-bottom-4 fade-in-0"
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      animationDuration: '400ms',
                      animationFillMode: 'both'
                    }}
                  >
                    {/* Glowing background on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-200/0 via-amber-200/50 to-amber-200/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <Button
                      variant="ghost"
                      className="relative w-full h-auto p-4 text-right justify-start bg-transparent hover:bg-transparent transition-all duration-300 min-h-[65px] z-10"
                      onClick={() => setQuestion(suggestion)}
                      disabled={askPatriarchMutation.isPending}
                    >
                      {/* Icon */}
                      <div className="absolute top-3 right-3 opacity-40 group-hover:opacity-80 transition-all duration-300 group-hover:scale-110">
                        <Lightbulb className="h-4 w-4 text-amber-600 group-hover:text-amber-700" />
                      </div>

                      <div className="w-full pr-8">
                        <span className="text-sm leading-relaxed text-amber-800 dark:text-amber-200 font-medium group-hover:text-amber-900 dark:group-hover:text-amber-100 transition-colors duration-300 text-right block">
                          {suggestion}
                        </span>

                        {/* Animated underline */}
                        <div className="h-0.5 bg-gradient-to-r from-amber-500/80 to-orange-500/80 mt-2 w-0 group-hover:w-full transition-all duration-400 ease-out rounded-full"></div>
                      </div>
                    </Button>

                    {/* Subtle glow effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-amber-400/20 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-300 -z-10"></div>
                  </div>
                ))}
              </div>

              {/* Decorative line */}
              <div className="mt-4 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent"></div>
            </div>

            {/* Question Input */}
            <form onSubmit={handleSubmit} className="w-full">
              <div className="flex gap-3 items-stretch w-full">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="اكتب سؤالك هنا..."
                  className="flex-1 text-right border-amber-300 dark:border-amber-700 focus:border-amber-500 focus:ring-amber-500 transition-all duration-300 rounded-lg shadow-sm text-sm h-12 px-4 bg-white dark:bg-gray-800"
                  disabled={askPatriarchMutation.isPending}
                  dir="rtl"
                />
                <Button
                  type="submit"
                  disabled={!question.trim() || askPatriarchMutation.isPending}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 h-12 min-w-[48px] flex items-center justify-center"
                >
                  {askPatriarchMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
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