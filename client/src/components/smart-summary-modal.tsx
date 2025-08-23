import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Loading from "@/components/ui/loading";

interface SmartSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PatriarchResult {
  id: number;
  name: string;
  englishName: string;
  orderNumber: number;
  startYear: number;
  endYear?: number;
  era: string;
  shortDescription: string;
}

interface SummaryResponse {
  summary?: string;
  patriarch?: {
    name: string;
    englishName: string;
    orderNumber: number;
    startYear: number;
    endYear?: number;
    era: string;
  };
  multipleResults?: boolean;
  patriarchs?: PatriarchResult[];
  message?: string;
}

export default function SmartSummaryModal({ isOpen, onClose }: SmartSummaryModalProps) {
  const [patriarchName, setPatriarchName] = useState("");
  const [tone, setTone] = useState("easy");
  const [result, setResult] = useState<SummaryResponse | null>(null);
  const [selectedPatriarch, setSelectedPatriarch] = useState<PatriarchResult | null>(null);

  const summaryMutation = useMutation({
    mutationFn: async ({ name, tone }: { name: string; tone: string }) => {
      const response = await fetch("/api/generate-smart-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim(), tone }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "فشل في توليد الملخص");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      if (data.multipleResults) {
        setSelectedPatriarch(null);
      }
    },
    onError: (error) => {
      console.error("Smart summary error:", error);
    },
  });

  const specificSummaryMutation = useMutation({
    mutationFn: async ({ patriarchId, tone }: { patriarchId: number; tone: string }) => {
      const response = await fetch("/api/generate-summary-by-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ patriarchId, tone }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "فشل في توليد الملخص");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error) => {
      console.error("Specific summary error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (patriarchName.trim()) {
      summaryMutation.mutate({ name: patriarchName.trim(), tone });
    }
  };

  const handlePatriarchSelect = (patriarch: PatriarchResult) => {
    setSelectedPatriarch(patriarch);
    specificSummaryMutation.mutate({ patriarchId: patriarch.id, tone });
  };

  const handleClose = () => {
    setResult(null);
    setPatriarchName("");
    setTone("easy");
    setSelectedPatriarch(null);
    onClose();
  };

  const handleNewSearch = () => {
    setResult(null);
    setSelectedPatriarch(null);
    setPatriarchName("");
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

  const isLoading = summaryMutation.isPending || specificSummaryMutation.isPending;
  const hasError = summaryMutation.isError || specificSummaryMutation.isError;
  const errorMessage = summaryMutation.error?.message || specificSummaryMutation.error?.message;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <i className="fas fa-brain ml-3"></i>
            الملخص الذكي لسير البطاركة
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 mt-2">
            أدخل اسم البطريرك واختر نوع اللغة للحصول على ملخص ذكي مفصل عن حياته وإنجازاته
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* نموذج الإدخال */}
          {(!result || result.multipleResults) && (
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="fas fa-search ml-2"></i>
                      اسم أو رقم البطريرك
                    </label>
                    <Input
                      type="text"
                      value={patriarchName}
                      onChange={(e) => setPatriarchName(e.target.value)}
                      placeholder="أدخل اسم أو رقم البطريرك (مثال: أثناسيوس، كيرلس، 117، 118...)"
                      className="text-lg py-6 px-4 bg-white shadow-md border-blue-300 focus:border-blue-500"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="fas fa-palette ml-2"></i>
                      نوع اللغة والأسلوب
                    </label>
                    <Select value={tone} onValueChange={setTone} disabled={isLoading}>
                      <SelectTrigger className="text-lg py-6 bg-white shadow-md border-blue-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(toneLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value} className="text-lg py-3">
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
                    disabled={!patriarchName.trim() || isLoading}
                    className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin ml-2"></i>
                        جاري البحث والتحليل...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-magic ml-2"></i>
                        إنشاء الملخص الذكي
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* حالة التحميل */}
          {isLoading && (
            <Card className="border-blue-200">
              <CardContent className="p-8">
                <Loading />
                <p className="text-center text-gray-600 mt-4">
                  جاري تحليل البيانات وتوليد الملخص الذكي...
                </p>
              </CardContent>
            </Card>
          )}

          {/* النتائج المتعددة */}
          {result?.multipleResults && result.patriarchs && (
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-orange-700 mb-4">
                  <i className="fas fa-list ml-2"></i>
                  {result.message}
                </h3>

                <div className="grid gap-4">
                  {result.patriarchs.map((patriarch) => (
                    <Card
                      key={patriarch.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-blue-300"
                      onClick={() => handlePatriarchSelect(patriarch)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-800 mb-2">
                              {patriarch.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {patriarch.englishName}
                            </p>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {patriarch.shortDescription}
                            </p>
                          </div>
                          <div className="mr-4 text-center">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 mb-2">
                              البابا {patriarch.orderNumber}
                            </Badge>
                            <p className="text-xs text-gray-500">
                              {patriarch.startYear} - {patriarch.endYear || "الآن"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <Button
                            size="sm"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePatriarchSelect(patriarch);
                            }}
                          >
                            {specificSummaryMutation.isPending && selectedPatriarch?.id === patriarch.id ? (
                              <>
                                <i className="fas fa-spinner fa-spin ml-2"></i>
                                جاري التحميل...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-file-alt ml-2"></i>
                                إنشاء الملخص الذكي
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={handleNewSearch}
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    <i className="fas fa-search ml-2"></i>
                    بحث جديد
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* نتيجة الملخص */}
          {result?.summary && (
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-green-700">
                    <i className="fas fa-check-circle ml-2"></i>
                    الملخص الذكي
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNewSearch}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <i className="fas fa-search ml-2"></i>
                      بحث جديد
                    </Button>
                    {result.patriarch && (
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          البابا {result.patriarch.orderNumber}
                        </Badge>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          {result.patriarch.era}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-md border-r-4 border-green-500">
                  <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
                    {result.summary.split('\n').map((paragraph, index) => (
                      paragraph.trim() && (
                        <p key={index} className="mb-4">
                          {paragraph.trim()}
                        </p>
                      )
                    ))}
                  </div>
                </div>

                {result.patriarch && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2">
                      <i className="fas fa-info-circle ml-2"></i>
                      معلومات سريعة
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">الاسم:</span>
                        <p className="text-gray-600">{result.patriarch.name}</p>
                      </div>
                      <div>
                        <span className="font-medium">الاسم الإنجليزي:</span>
                        <p className="text-gray-600">{result.patriarch.englishName}</p>
                      </div>
                      <div>
                        <span className="font-medium">الرقم:</span>
                        <p className="text-gray-600">البابا {result.patriarch.orderNumber}</p>
                      </div>
                      <div>
                        <span className="font-medium">فترة الخدمة:</span>
                        <p className="text-gray-600">
                          {result.patriarch.startYear} - {result.patriarch.endYear || "الآن"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* رسالة الخطأ */}
          {hasError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="text-center text-red-600">
                  <i className="fas fa-exclamation-triangle text-2xl mb-2"></i>
                  <p className="font-medium">حدث خطأ في توليد الملخص</p>
                  <p className="text-sm mt-1">
                    {errorMessage || "يرجى المحاولة مرة أخرى أو التأكد من اسم البطريرك"}
                  </p>
                  <div className="mt-3 text-xs text-red-500">
                    <p>نصائح:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>تأكد من كتابة الاسم بشكل صحيح</li>
                      <li>جرب استخدام جزء من الاسم فقط</li>
                      <li>تأكد من تكوين Gemini API بشكل صحيح</li>
                    </ul>
                  </div>
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={handleNewSearch}
                  >
                    <i className="fas fa-redo ml-2"></i>
                    إعادة المحاولة
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* تعليمات الاستخدام */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-amber-800 mb-2">
                <i className="fas fa-lightbulb ml-2"></i>
                نصائح الاستخدام المحسنة
              </h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• <strong>البحث بكلمة واحدة:</strong> مثل "كيرلس" أو "شنودة" لإظهار جميع البطاركة بهذا الاسم</li>
                <li>• <strong>البحث المحدد:</strong> مثل "كيرلس السادس" أو "شنودة الثالث" للبحث المباشر</li>
                <li>• يمكنك البحث بالاسم العربي أو الإنجليزي</li>
                <li>• الملخص الأكاديمي مناسب للطلاب والباحثين</li>
                <li>• ملخص الأطفال مبسط ومناسب للصغار</li>
                <li>• تأكد من تكوين Gemini API في إعدادات الإدارة أولاً</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}