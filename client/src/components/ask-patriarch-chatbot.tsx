import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, Send, Loader2, Crown, Lightbulb, Sparkles } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

  const parseTableData = (text: string) => {
    const lines = text.split('\n');
    const tables: Array<{rows: string[][], startIndex: number, endIndex: number}> = [];
    let currentTable: string[][] = [];
    let tableStartIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check if line contains table format
      if (line.includes('|') && line.split('|').length > 2) {
        if (tableStartIndex === -1) {
          tableStartIndex = i;
        }

        // Parse table row
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
        if (cells.length > 0) {
          currentTable.push(cells);
        }
      } else if (currentTable.length > 0) {
        // End of table
        tables.push({
          rows: currentTable,
          startIndex: tableStartIndex,
          endIndex: i - 1
        });
        currentTable = [];
        tableStartIndex = -1;
      }
    }

    // Handle table at end of text
    if (currentTable.length > 0) {
      tables.push({
        rows: currentTable,
        startIndex: tableStartIndex,
        endIndex: lines.length - 1
      });
    }

    return tables;
  };

  const formatText = (text: string) => {
    const tables = parseTableData(text);
    const lines = text.split('\n');
    const processedIndices = new Set<number>();

    // Mark table lines as processed
    tables.forEach(table => {
      for (let i = table.startIndex; i <= table.endIndex; i++) {
        processedIndices.add(i);
      }
    });

    const elements: React.ReactNode[] = [];
    let currentParagraph: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if this line is part of a table
      const table = tables.find(t => i >= t.startIndex && i <= t.endIndex);
      if (table && i === table.startIndex) {
        // Add current paragraph if exists
        if (currentParagraph.length > 0) {
          elements.push(formatParagraph(currentParagraph.join('\n'), elements.length));
          currentParagraph = [];
        }

        // Add table
        elements.push(formatTable(table.rows, elements.length));

        // Skip to end of table
        i = table.endIndex;
        continue;
      }

      if (!processedIndices.has(i)) {
        currentParagraph.push(line);
      }

      // Add paragraph when we hit empty line or end
      if ((line.trim() === '' || i === lines.length - 1) && currentParagraph.length > 0) {
        elements.push(formatParagraph(currentParagraph.join('\n'), elements.length));
        currentParagraph = [];
      }
    }

    return elements;
  };

  const formatTable = (rows: string[][], key: number) => {
    if (rows.length === 0) return null;

    // First row is header if it doesn't contain :--- patterns
    const hasHeaderSeparator = rows.length > 1 && rows[1].some(cell => cell.includes(':---') || cell.includes('---'));
    const headerRow = hasHeaderSeparator ? rows[0] : null;
    const dataRows = hasHeaderSeparator ? rows.slice(2) : rows;

    return (
      <div key={key} className="my-4 overflow-x-auto">
        <Table className="border border-gray-300">
          {headerRow && (
            <TableHeader>
              <TableRow className="bg-blue-50">
                {headerRow.map((cell, cellIndex) => (
                  <TableHead key={cellIndex} className="border border-gray-300 px-4 py-2 font-semibold text-blue-900">
                    {cell}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
          )}
          <TableBody>
            {dataRows.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-gray-50">
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex} className="border border-gray-300 px-4 py-2">
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const formatParagraph = (text: string, key: number) => {
    if (!text.trim()) return null;

    const lines = text.split('\n');

    return (
      <div key={key} className="mb-4">
        {lines.map((line, lineIndex) => {
          const trimmed = line.trim();

          // Headers
          if (trimmed.startsWith('###')) {
            return (
              <h3 key={lineIndex} className="text-lg font-bold text-blue-800 mb-2 border-b-2 border-blue-200 pb-1">
                {trimmed.replace(/^#+\s*/, '')}
              </h3>
            );
          }

          if (trimmed.startsWith('##')) {
            return (
              <h2 key={lineIndex} className="text-xl font-bold text-blue-900 mb-3 border-b-2 border-blue-300 pb-1">
                {trimmed.replace(/^#+\s*/, '')}
              </h2>
            );
          }

          if (trimmed.startsWith('#')) {
            return (
              <h1 key={lineIndex} className="text-2xl font-bold text-blue-950 mb-4 border-b-4 border-blue-400 pb-2">
                {trimmed.replace(/^#+\s*/, '')}
              </h1>
            );
          }

          // Bullet points
          if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
            return (
              <li key={lineIndex} className="list-disc list-inside text-gray-700 mb-1 mr-4">
                {trimmed.replace(/^[\*\-]\s*/, '')}
              </li>
            );
          }

          // Numbered lists
          if (/^\d+\./.test(trimmed)) {
            return (
              <li key={lineIndex} className="list-decimal list-inside text-gray-700 mb-1 mr-4">
                {trimmed.replace(/^\d+\.\s*/, '')}
              </li>
            );
          }

          // Bold text
          const boldFormatted = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

          // Regular paragraphs
          if (trimmed) {
            return (
              <p key={lineIndex} className="text-gray-800 mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: boldFormatted }} />
            );
          }

          return null;
        })}
      </div>
    );
  };

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
                      >
                        {formatText(message.content)}
                      </div>
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