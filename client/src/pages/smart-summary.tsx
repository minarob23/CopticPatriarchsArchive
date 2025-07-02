
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Loading from "@/components/ui/loading";
import { useLocation } from "wouter";

interface SummaryResponse {
  summary: string;
  patriarch?: {
    name: string;
    orderNumber: number;
    startYear: number;
    endYear?: number;
    era: string;
  };
}

export default function SmartSummary() {
  const [, setLocation] = useLocation();
  const [patriarchName, setPatriarchName] = useState("");
  const [tone, setTone] = useState("easy");
  const [result, setResult] = useState<SummaryResponse | null>(null);

  const summaryMutation = useMutation({
    mutationFn: async ({ name, tone }: { name: string; tone: string }) => {
      const response = await fetch("/api/generate-smart-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, tone }),
      });

      if (!response.ok) {
        throw new Error("فشل في توليد الملخص");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (patriarchName.trim()) {
      summaryMutation.mutate({ name: patriarchName.trim(), tone });
    }
  };

  const toneLabels = {
    easy: "لغة سهلة ومبسطة",
    academic: "لغة أكاديمية ومتخصصة", 
    kids: "ملخص مناسب للأطفال"
  };

  const toneIcons = {
    easy: "fas fa-user-friends",
    academic: "fas fa-graduation-cap",
    kids: "fas fa-child"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50" dir="rtl">
      {/* Home Button */}
      <Button
        onClick={() => setLocation("/")}
        variant="outline"
        className="fixed top-4 right-4 z-10 bg-white/90 backdrop-blur-sm border-green-300 text-green-600 hover:bg-green-50 shadow-lg"
      >
        <i className="fas fa-home ml-2"></i>
        الصفحة الرئيسية
      </Button>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 via-teal-600 to-green-800 text-white relative overflow-hidden"></div>
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white bg-opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-yellow-300 bg-opacity-20 rounded-full blur-2xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <i className="fas fa-brain text-4xl"></i>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold font-amiri mb-4 bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent">
                الملخص الذكي للبطاركة
              </h1>
              <p className="text-xl md:text-2xl text-green-100 mb-6 leading-relaxed">
                احصل على ملخص ذكي ومفصل عن أي بطريرك من بطاركة الكنيسة القبطية
              </p>
              <p className="text-lg text-green-200 max-w-3xl mx-auto">
                استخدم الذكاء الاصطناعي للحصول على معلومات شاملة ومنسقة عن حياة ومساهمات البطاركة
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Form Section */}
          <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                <i className="fas fa-brain ml-3"></i>
                إنشاء ملخص ذكي
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    <i className="fas fa-search ml-2"></i>
                    اسم البطريرك
                  </label>
                  <Input
                    type="text"
                    value={patriarchName}
                    onChange={(e) => setPatriarchName(e.target.value)}
                    placeholder="أدخل اسم البطريرك (مثال: أثناسيوس، كيرلس، شنودة، تواضروس...)"
                    className="text-xl py-6 px-6 bg-white shadow-lg border-green-300 focus:border-green-500 rounded-xl"
                    disabled={summaryMutation.isPending}
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    <i className="fas fa-palette ml-2"></i>
                    نوع اللغة والأسلوب
                  </label>
                  <Select value={tone} onValueChange={setTone} disabled={summaryMutation.isPending}>
                    <SelectTrigger className="text-xl py-6 bg-white shadow-lg border-green-300 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(toneLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value} className="text-lg py-4">
                          <div className="flex items-center gap-3">
                            <i className={toneIcons[value as keyof typeof toneIcons]}></i>
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={!patriarchName.trim() || summaryMutation.isPending}
                  className="w-full py-8 text-xl bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-xl transform hover:scale-105 transition-all duration-300 rounded-xl"
                >
                  {summaryMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin ml-3 text-xl"></i>
                      جاري توليد الملخص الذكي...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic ml-3 text-xl"></i>
                      إنشاء الملخص الذكي
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Loading State */}
          {summaryMutation.isPending && (
            <Card className="border-green-200 shadow-lg">
              <CardContent className="p-12">
                <Loading />
                <p className="text-center text-gray-600 mt-6 text-lg">
                  جاري تحليل البيانات وتوليد الملخص الذكي...
                </p>
              </CardContent>
            </Card>
          )}

          {/* Results Section */}
          {result && (
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-blue-50 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-green-700">
                    <i className="fas fa-check-circle ml-3"></i>
                    الملخص الذكي جاهز
                  </h3>
                  {result.patriarch && (
                    <div className="flex gap-3">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
                        البابا {result.patriarch.orderNumber}
                      </Badge>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-lg px-4 py-2">
                        {result.patriarch.era}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl p-8 shadow-lg border-r-4 border-green-500">
                  <div className="prose prose-xl max-w-none text-gray-800 leading-relaxed">
                    {result.summary.split('\n').map((paragraph, index) => (
                      paragraph.trim() && (
                        <p key={index} className="mb-6 text-lg leading-relaxed">
                          {paragraph.trim()}
                        </p>
                      )
                    ))}
                  </div>
                </div>

                {result.patriarch && (
                  <div className="mt-6 p-6 bg-gray-50 rounded-xl">
                    <h4 className="font-bold text-gray-700 mb-4 text-xl">
                      <i className="fas fa-info-circle ml-2"></i>
                      معلومات سريعة
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-lg">
                      <div>
                        <span className="font-bold">الاسم:</span>
                        <p className="text-gray-600">{result.patriarch.name}</p>
                      </div>
                      <div>
                        <span className="font-bold">الرقم:</span>
                        <p className="text-gray-600">البابا {result.patriarch.orderNumber}</p>
                      </div>
                      <div>
                        <span className="font-bold">فترة الخدمة:</span>
                        <p className="text-gray-600">
                          {result.patriarch.startYear} - {result.patriarch.endYear || "الآن"}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold">العصر:</span>
                        <p className="text-gray-600">{result.patriarch.era}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {summaryMutation.isError && (
            <Card className="border-red-200 bg-red-50 shadow-lg">
              <CardContent className="p-8">
                <div className="text-center text-red-600">
                  <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
                  <p className="font-bold text-xl">حدث خطأ في توليد الملخص</p>
                  <p className="text-lg mt-2">يرجى المحاولة مرة أخرى أو التأكد من اسم البطريرك</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-lg">
            <CardContent className="p-6">
              <h4 className="font-bold text-amber-800 mb-4 text-xl">
                <i className="fas fa-lightbulb ml-2"></i>
                نصائح للاستخدام
              </h4>
              <ul className="text-lg text-amber-700 space-y-2">
                <li>• يمكنك البحث بالاسم العربي أو الإنجليزي</li>
                <li>• جرب أنواع اللغة المختلفة حسب الجمهور المستهدف</li>
                <li>• الملخص الأكاديمي مناسب للطلاب والباحثين</li>
                <li>• ملخص الأطفال مبسط ومناسب للصغار</li>
                <li>• تأكد من كتابة الاسم بشكل صحيح للحصول على أفضل النتائج</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
