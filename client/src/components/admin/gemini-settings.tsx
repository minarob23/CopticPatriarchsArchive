import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Key, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";

export default function GeminiSettings() {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check current API key status
  const { data: status, isLoading } = useQuery({
    queryKey: ["/api/admin/gemini-status"],
    queryFn: async () => {
      const response = await fetch("/api/admin/gemini-status", {
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      console.log("Gemini Status Response:", data);
      return data as { hasApiKey: boolean; connected: boolean };
    },
  });

  // تأثير لتحديث حالة الاتصال المحلية
  useEffect(() => {
    console.log("Status updated:", status);
    if (status?.connected === true) {
      setIsConnected(true);
    } else if (status && status.connected === false) {
      setIsConnected(false);
    }
  }, [status]);

  // Save API key mutation
  const saveApiKeyMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      const response = await apiRequest("POST", "/api/admin/gemini-api-key", {
        apiKey,
      });
      return response;
    },
    onSuccess: async () => {
      // إعادة تعيين حالة الاتصال المحلية لإظهار الحالة الصفراء
      setIsConnected(false);

      toast({
        title: "✅ تم الحفظ",
        description:
          "تم حفظ مفتاح Gemini API بنجاح - اضغط 'اختبار الاتصال' للتحقق من صحة المفتاح",
        duration: 4000,
      });

      // إعادة تحميل حالة API لإظهار أن المفتاح محفوظ
      await queryClient.invalidateQueries({
        queryKey: ["/api/admin/gemini-status"],
      });

      // تحديث الكاش لإظهار أن المفتاح موجود لكن غير مختبر
      queryClient.setQueryData(
        ["/api/admin/gemini-status"],
        (oldData: any) => ({
          ...oldData,
          hasApiKey: true,
          connected: false,
        }),
      );

      setApiKey("");
    },
    onError: () => {
      toast({
        title: "خطأ في الحفظ",
        description: "فشل في حفظ مفتاح API. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/test-gemini");
      return response;
    },
    onSuccess: async (data: any) => {
      console.log("Test connection result:", data);

      // تحديث الحالة المحلية فوراً
      setIsConnected(true);

      // تحديث الكاش فوراً لضمان عرض الرسالة الخضراء
      queryClient.setQueryData(["/api/admin/gemini-status"], {
        hasApiKey: true,
        connected: true,
      });

      // فرض إعادة تحميل من السيرفر
      await queryClient.refetchQueries({
        queryKey: ["/api/admin/gemini-status"],
        exact: true,
      });

      toast({
        title: "✅ الاتصال ناجح",
        description:
          "تم اختبار اتصال Gemini API بنجاح - جميع الميزات الذكية نشطة الآن",
        duration: 4000,
      });
    },
    onError: (error: any) => {
      console.error("Test connection error:", error);

      // تحديث الحالة المحلية لفشل الاتصال
      setIsConnected(false);

      // تحديث الكاش لإظهار فشل الاتصال
      queryClient.setQueryData(
        ["/api/admin/gemini-status"],
        (oldData: any) => ({
          ...oldData,
          connected: false,
        }),
      );

      toast({
        title: "⚠️ خطأ في الاختبار",
        description:
          "فشل في اختبار الاتصال. تحقق من الاتصال بالإنترنت ومفتاح API.",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال مفتاح API",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    saveApiKeyMutation.mutate(apiKey);
  };

  const handleTestConnection = () => {
    console.log("Testing connection clicked");
    // لا تعيد تعيين الحالة هنا - دع النتيجة تحددها
    testConnectionMutation.mutate();
  };

  return (
    <Card className="border-2 border-purple-200 dark:border-purple-800">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="flex items-center gap-3">
          <Key className="h-6 w-6" />
          <div>
            <CardTitle className="text-xl">إعدادات Gemini AI</CardTitle>
            <p className="text-purple-100 text-sm mt-1">
              قم بتكوين مفتاح Google Gemini API لتفعيل خاصية "اسأل البطريرك"
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            {isLoading || saveApiKeyMutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {saveApiKeyMutation.isPending
                    ? "جاري حفظ المفتاح..."
                    : "جاري فحص حالة مفتاح API..."}
                </span>
              </div>
            ) : testConnectionMutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  جاري اختبار الاتصال...
                </span>
              </div>
            ) : (status?.connected === true && status?.hasApiKey === true) ||
              isConnected ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-30"></div>
                </div>
                <Badge
                  variant="default"
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  مفتاح API نشط ومتصل ✓
                </Badge>
              </div>
            ) : status?.hasApiKey ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-yellow-500 rounded-full animate-ping opacity-30"></div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white shadow-sm"
                >
                  <Key className="h-3 w-3 mr-1" />
                  مفتاح API محفوظ - اضغط اختبار الاتصال
                </Badge>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-30"></div>
                </div>
                <Badge
                  variant="destructive"
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-sm"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  مفتاح API غير مُكوَّن
                </Badge>
              </div>
            )}
          </div>

          {status?.hasApiKey && (
            <div className="flex gap-2">
              <Button
                onClick={handleTestConnection}
                disabled={
                  testConnectionMutation.isPending ||
                  saveApiKeyMutation.isPending ||
                  isLoading
                }
                variant="outline"
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-950 transition-colors"
              >
                {testConnectionMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    جاري الاختبار...
                  </>
                ) : (
                  <>🔗 اختبار الاتصال</>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* API Key Form */}
        <form onSubmit={handleSaveApiKey} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-right font-semibold">
              مفتاح Google Gemini API
            </Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="أدخل مفتاح Gemini API هنا..."
                className="pl-10 text-left"
                dir="ltr"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 text-right">
              يمكنك الحصول على المفتاح من{" "}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          <Button
            type="submit"
            disabled={saveApiKeyMutation.isPending || !apiKey.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {saveApiKeyMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                جاري الحفظ...
              </>
            ) : (
              "حفظ مفتاح API"
            )}
          </Button>
        </form>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 text-left">
            📋 تعليمات الحصول على مفتاح API:
          </h4>
          <ol
            className="text-sm text-blue-700 dark:text-blue-300 space-y-2 list-decimal text-left"
            dir="rtl"
            style={{ paddingRight: "20px" }}
          >
            <li>
              اذهب إلى{" "}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-600"
              >
                Google AI Studio
              </a>
            </li>
            <li>قم بتسجيل الدخول بحساب Google الخاص بك</li>
            <li>انقر على "Create API Key" لإنشاء مفتاح جديد</li>
            <li>انسخ المفتاح والصقه في المربع أعلاه</li>
            <li>انقر على "حفظ مفتاح API" لحفظ الإعدادات</li>
          </ol>
        </div>

        {/* Feature Description */}
        <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
          <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 text-left">
            ✨ ماذا يحدث بعد التكوين؟
          </h4>
          <p
            className="text-sm text-amber-700 dark:text-amber-300 text-left leading-relaxed"
            dir="ltr"
          >
            سيتمكن الزوار من استخدام خاصية "اسأل البطريرك" في الصفحة الرئيسية
            للحصول على إجابات ذكية ومفصلة عن تاريخ البطاركة الأقباط الأرثوذكس مع
            استخدام ذكاء اصطناعي متقدم لفهم الأسئلة والإجابة عليها بدقة
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
