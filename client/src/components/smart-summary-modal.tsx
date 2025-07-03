
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

export default function SmartSummaryModal({ isOpen, onClose }: SmartSummaryModalProps) {
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

  const traditionalMutation = useMutation({
    mutationFn: async ({ name, tone }: { name: string; tone: string }) => {
      const response = await fetch("/api/generate-traditional-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, tone }),
      });

      if (!response.ok) {
        throw new Error("فشل في إنشاء الملخص التقليدي");
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

  const handleTraditionalSummary = () => {
    if (patriarchName.trim()) {
      traditionalMutation.mutate({ name: patriarchName.trim(), tone });
    }
  };

  const handleClose = () => {
    setResult(null);
    setPatriarchName("");
    setTone("easy");
    onClose();
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
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-search ml-2"></i>
                    اسم البطريرك
                  </label>
                  <Input
                    type="text"
                    value={patriarchName}
                    onChange={(e) => setPatriarchName(e.target.value)}
                    placeholder="أدخل اسم البطريرك (مثال: أثناسيوس، كيرلس، شنودة...)"
                    className="text-lg py-6 px-4 bg-white shadow-md border-blue-300 focus:border-blue-500"
                    disabled={summaryMutation.isPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-palette ml-2"></i>
                    نوع اللغة والأسلوب
                  </label>
                  <Select value={tone} onValueChange={setTone} disabled={summaryMutation.isPending}>
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

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={!patriarchName.trim() || summaryMutation.isPending}
                    className="flex-1 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    {summaryMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin ml-2"></i>
                        جاري توليد الملخص...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-magic ml-2"></i>
                        إنشاء الملخص الذكي
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={handleTraditionalSummary}
                    disabled={!patriarchName.trim() || traditionalMutation.isPending}
                    className="flex-1 py-6 text-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    {traditionalMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin ml-2"></i>
                        جاري إنشاء الملخص...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-book ml-2"></i>
                        الملخص التقليدي
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* نتيجة الملخص */}
          {summaryMutation.isPending && (
            <Card className="border-blue-200">
              <CardContent className="p-8">
                <Loading />
                <p className="text-center text-gray-600 mt-4">
                  جاري تحليل البيانات وتوليد الملخص الذكي...
                </p>
              </CardContent>
            </Card>
          )}

          {traditionalMutation.isPending && (
            <Card className="border-amber-200">
              <CardContent className="p-8">
                <Loading />
                <p className="text-center text-gray-600 mt-4">
                  جاري إنشاء الملخص التقليدي...
                </p>
              </CardContent>
            </Card>
          )}

          {result && (
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-green-700">
                    <i className="fas fa-check-circle ml-2"></i>
                    الملخص الذكي
                  </h3>
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
                        <span className="font-medium">الرقم:</span>
                        <p className="text-gray-600">البابا {result.patriarch.orderNumber}</p>
                      </div>
                      <div>
                        <span className="font-medium">فترة الخدمة:</span>
                        <p className="text-gray-600">
                          {result.patriarch.startYear} - {result.patriarch.endYear || "الآن"}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">العصر:</span>
                        <p className="text-gray-600">{result.patriarch.era}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {summaryMutation.isError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="text-center text-red-600">
                  <i className="fas fa-exclamation-triangle text-2xl mb-2"></i>
                  <p className="font-medium">حدث خطأ في توليد الملخص الذكي</p>
                  <p className="text-sm mt-1">يرجى المحاولة مرة أخرى أو جرب الملخص التقليدي</p>
                </div>
              </CardContent>
            </Card>
          )}

          {traditionalMutation.isError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="text-center text-red-600">
                  <i className="fas fa-exclamation-triangle text-2xl mb-2"></i>
                  <p className="font-medium">حدث خطأ في إنشاء الملخص التقليدي</p>
                  <p className="text-sm mt-1">يرجى المحاولة مرة أخرى</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* تعليمات الاستخدام */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-amber-800 mb-3">
                <i className="fas fa-lightbulb ml-2"></i>
                نصائح للاستخدام
              </h4>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-blue-800 mb-2">
                    <i className="fas fa-magic ml-1"></i>
                    الملخص الذكي (AI)
                  </h5>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• يستخدم الذكاء الاصطناعي لتحليل عميق</li>
                    <li>• معلومات إضافية من مصادر متنوعة</li>
                    <li>• أسلوب متطور وشامل</li>
                    <li>• يتطلب اتصال بالإنترنت</li>
                  </ul>
                </div>
                
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <h5 className="font-medium text-orange-800 mb-2">
                    <i className="fas fa-book ml-1"></i>
                    الملخص التقليدي
                  </h5>
                  <ul className="text-xs text-orange-700 space-y-1">
                    <li>• يعتمد على البيانات المحفوظة فقط</li>
                    <li>• سريع ولا يتطلب إنترنت قوي</li>
                    <li>• موجز ومباشر</li>
                    <li>• مناسب عند تعطل الذكاء الاصطناعي</li>
                  </ul>
                </div>
              </div>
              
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• يمكنك البحث بالاسم العربي أو الإنجليزي</li>
                <li>• جرب أنواع اللغة المختلفة حسب الجمهور المستهدف</li>
                <li>• الملخص الأكاديمي مناسب للطلاب والباحثين</li>
                <li>• ملخص الأطفال مبسط ومناسب للصغار</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
