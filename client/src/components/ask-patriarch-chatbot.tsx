import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, Send, Loader2, Crown, Lightbulb } from "lucide-react";

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
      content: 'السلام عليكم، أنا هنا للإجابة على أسئلتكم حول تاريخ البطاركة الأقباط الأرثوذكس عبر العصور. اسألوني عن أي بطريرك أو فترة تاريخية تريدون معرفة المزيد عنها.',
      timestamp: new Date()
    }
  ]);
  
  const [question, setQuestion] = useState('');

  const askPatriarchMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest('/api/ask-patriarch', 'POST', { question });
      return response.answer;
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
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
        <CardHeader className="text-center bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-t-lg">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Crown className="h-8 w-8" />
            <CardTitle className="text-2xl font-bold">اسأل البطريرك</CardTitle>
            <Crown className="h-8 w-8" />
          </div>
          <p className="text-amber-100 font-medium">
            استكشف تاريخ الكنيسة القبطية الأرثوذكسية مع خبير ذكي يعرف كل شيء عن البطاركة
          </p>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Chat Messages */}
          <ScrollArea className="h-96 mb-6 p-4 bg-white dark:bg-gray-900 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 border border-amber-300 dark:border-amber-700'
                    }`}
                  >
                    {message.type === 'patriarch' && (
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="h-4 w-4" />
                        <span className="font-semibold text-sm">البطريرك الخبير</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString('ar-EG')}
                    </div>
                  </div>
                </div>
              ))}
              
              {askPatriarchMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 border border-amber-300 dark:border-amber-700 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>البطريرك يعد الإجابة...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Suggested Questions */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                أسئلة مقترحة:
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestedQuestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-right justify-start h-auto p-3 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                  onClick={() => setQuestion(suggestion)}
                  disabled={askPatriarchMutation.isPending}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          <Separator className="my-4 bg-amber-300 dark:bg-amber-700" />

          {/* Question Input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="اكتب سؤالك هنا..."
                className="flex-1 text-right border-amber-300 dark:border-amber-700 focus:border-amber-500 focus:ring-amber-500"
                disabled={askPatriarchMutation.isPending}
                dir="rtl"
              />
              <Button
                type="submit"
                disabled={!question.trim() || askPatriarchMutation.isPending}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6"
              >
                {askPatriarchMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
              💡 يمكنك أن تسأل عن أي بطريرك أو فترة تاريخية أو موضوع متعلق بتاريخ الكنيسة القبطية
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}