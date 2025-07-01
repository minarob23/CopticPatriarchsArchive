
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotProps {
  className?: string;
}

export default function Chatbot({ className }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'السلام عليكم! أنا مساعدك الذكي "اسأل البطريرك". يمكنني مساعدتك في التعرف على تاريخ وحياة بطاركة الكنيسة القبطية الأرثوذكسية. كيف يمكنني مساعدتك اليوم؟',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await apiRequest('/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage })
      });

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || 'عذراً، حدث خطأ في الاستجابة.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى لاحقاً.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        content: 'السلام عليكم! أنا مساعدك الذكي "اسأل البطريرك". يمكنني مساعدتك في التعرف على تاريخ وحياة بطاركة الكنيسة القبطية الأرثوذكسية. كيف يمكنني مساعدتك اليوم؟',
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className={`fixed bottom-6 left-6 z-50 chatbot-float ${className}`}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 relative group ring-4 ring-blue-200 ring-opacity-50"
            size="lg"
          >
            {/* Animated background */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-30 animate-pulse"></div>
            
            {/* Main icon */}
            <i className="fas fa-robot text-2xl relative z-10"></i>
            
            {/* Cross badge */}
            <div className="absolute -top-2 -right-2 bg-yellow-500 text-blue-800 text-xs rounded-full h-7 w-7 flex items-center justify-center animate-bounce shadow-lg">
              <i className="fas fa-cross text-sm font-bold"></i>
            </div>
            
            {/* Floating label */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              اسأل البطريرك
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black border-opacity-75"></div>
            </div>
          </Button>
        </DialogTrigger>

        <DialogContent 
          className="w-[95vw] max-w-md h-[600px] p-0 fixed bottom-20 left-6 top-auto translate-x-0 translate-y-0" 
          dir="rtl"
        >
          <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-purple-50">
            {/* Header */}
            <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-reverse space-x-3">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                    <i className="fas fa-cross text-blue-600 text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-amiri">اسأل البطريرك</h3>
                    <p className="text-sm text-blue-100">مساعدك الذكي للتاريخ الكنسي</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  className="text-white hover:bg-white/20"
                >
                  <i className="fas fa-redo text-sm"></i>
                </Button>
              </DialogTitle>
            </DialogHeader>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white ml-2'
                          : 'bg-white shadow-md mr-2 border'
                      }`}
                    >
                      {message.sender === 'bot' && (
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-2">
                            <i className="fas fa-cross text-white text-xs"></i>
                          </div>
                          <Badge variant="secondary" className="text-xs">البطريرك</Badge>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p className={`text-xs mt-2 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString('ar-EG', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white shadow-md p-3 rounded-2xl mr-2 border max-w-[80%]">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-white border-t">
              <div className="flex space-x-reverse space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اكتب سؤالك عن البطاركة..."
                  className="flex-1 rounded-full border-gray-300 focus:border-blue-500"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4"
                >
                  {isLoading ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-paper-plane"></i>
                  )}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs rounded-full"
                  onClick={() => setInputMessage('اخبرني عن القديس مرقس الرسول')}
                >
                  القديس مرقس
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs rounded-full"
                  onClick={() => setInputMessage('من هو أثناسيوس الرسولي؟')}
                >
                  أثناسيوس الرسولي
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs rounded-full"
                  onClick={() => setInputMessage('كيرلس الكبير')}
                >
                  كيرلس الكبير
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
