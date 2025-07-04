
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Plus, X, Crown, Calendar, BookOpen, Shield, User, MapPin, Sparkles, Save, RotateCcw } from "lucide-react";
import type { Patriarch, InsertPatriarch } from "@shared/schema";

interface PatriarchFormProps {
  patriarch?: Patriarch;
  onClose: () => void;
  onSuccess?: () => void;
}

const predefinedEras = [
  "العصر الرسولي",
  "العصر الذهبي", 
  "عصر المجامع",
  "عصر الاضطهاد",
  "العصر الحديث",
  "العصر الإسلامي المبكر",
  "العصر العثماني",
  "العصر الفاطمي",
  "العصر المملوكي",
  "العصر القبطي المستقل",
  "العصر العباسي",
  "العصر البيزنطي",
  "العصر الأيوبي",
  "العصر المعاصر",
  "العصر الحديث المبكر",
  "عصر محمد علي",
  "عصر التحديث"
];

const predefinedHeresies = [
  "الآريوسية",
  "النسطورية", 
  "الأوطاخية",
  "الدوناتية",
  "المانوية",
  "الغنوسية",
  "الأبولينارية",
  "الأبيونية",
  "الملكانية",
  "البرجوازية",
  "الإسلام",
  "الكاثوليكية",
  "البروتستانتية"
];

export default function PatriarchForm({ patriarch, onClose, onSuccess }: PatriarchFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [customEra, setCustomEra] = useState("");
  const [customHeresy, setCustomHeresy] = useState("");
  const [heresiesList, setHeresiesList] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: patriarch?.name || "",
    arabicName: patriarch?.arabicName || "",
    orderNumber: patriarch?.orderNumber || 1,
    startYear: patriarch?.startYear || new Date().getFullYear(),
    endYear: patriarch?.endYear || undefined,
    era: patriarch?.era || "",
    biography: patriarch?.biography || "",
    contributions: patriarch?.contributions || "",
    active: patriarch?.active ?? true,
  });

  // Initialize heresies from patriarch data
  useEffect(() => {
    if (patriarch?.heresiesFought) {
      try {
        let heresies: string[] = [];
        if (Array.isArray(patriarch.heresiesFought)) {
          heresies = patriarch.heresiesFought;
        } else if (typeof patriarch.heresiesFought === 'string') {
          if (patriarch.heresiesFought.trim() !== '' && patriarch.heresiesFought !== '[]') {
            heresies = JSON.parse(patriarch.heresiesFought);
          }
        }
        setHeresiesList(Array.isArray(heresies) ? heresies : []);
      } catch (e) {
        console.error('Error parsing heresies:', e);
        setHeresiesList([]);
      }
    }
  }, [patriarch]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/admin/patriarchs', data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "🎉 تم إنشاء البطريرك بنجاح",
        description: "تم إضافة البطريرك الجديد إلى قاعدة البيانات",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/patriarchs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "❌ خطأ في إنشاء البطريرك",
        description: error.message || "حدث خطأ أثناء إنشاء البطريرك",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!patriarch?.id) throw new Error("معرف البطريرك مطلوب");
      const response = await apiRequest('PUT', `/api/admin/patriarchs/${patriarch.id}`, data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "✅ تم تحديث البطريرك بنجاح",
        description: "تم حفظ جميع التغييرات بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/patriarchs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "❌ خطأ في تحديث البطريرك",
        description: error.message || "حدث خطأ أثناء تحديث البطريرك",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "⚠️ خطأ في النموذج",
        description: "الاسم باللغة الإنجليزية مطلوب",
        variant: "destructive",
      });
      return;
    }

    if (!formData.era.trim()) {
      toast({
        title: "⚠️ خطأ في النموذج",
        description: "العصر مطلوب",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      ...formData,
      heresiesFought: JSON.stringify(heresiesList),
    };

    if (patriarch) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const addCustomEra = () => {
    if (customEra.trim()) {
      setFormData(prev => ({ ...prev, era: customEra.trim() }));
      setCustomEra("");
      toast({
        title: "✨ تم إضافة عصر جديد",
        description: `تم إضافة "${customEra.trim()}" كعصر جديد`,
      });
    }
  };

  const addCustomHeresy = () => {
    if (customHeresy.trim() && !heresiesList.includes(customHeresy.trim())) {
      const newList = [...heresiesList, customHeresy.trim()];
      setHeresiesList(newList);
      setCustomHeresy("");
      toast({
        title: "🛡️ تم إضافة بدعة جديدة",
        description: `تم إضافة "${customHeresy.trim()}" إلى قائمة البدع المحاربة`,
      });
    }
  };

  const removeHeresy = (heresy: string) => {
    const newList = heresiesList.filter(h => h !== heresy);
    setHeresiesList(newList);
    toast({
      title: "🗑️ تم حذف البدعة",
      description: `تم حذف "${heresy}" من القائمة`,
    });
  };

  const addPredefinedHeresy = (heresy: string) => {
    if (!heresiesList.includes(heresy)) {
      const newList = [...heresiesList, heresy];
      setHeresiesList(newList);
      toast({
        title: "✅ تم إضافة البدعة",
        description: `تم إضافة "${heresy}" إلى قائمة البدع المحاربة`,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      arabicName: "",
      orderNumber: 1,
      startYear: new Date().getFullYear(),
      endYear: undefined,
      era: "",
      biography: "",
      contributions: "",
      active: true,
    });
    setHeresiesList([]);
    setCustomEra("");
    setCustomHeresy("");
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border-2 border-blue-200/50 shadow-2xl">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="white" fill-opacity="0.1"%3E%3Cpath d="M20 20c0 11.046-8.954 20-20 20v20h40V20H20z"/%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
          <div className="relative flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <Crown className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold">
                {patriarch ? "✏️ تعديل البطريرك" : "➕ إضافة بطريرك جديد"}
              </CardTitle>
              <p className="text-blue-100 mt-2">
                {patriarch ? "قم بتحديث معلومات البطريرك" : "أضف بطريرك جديد إلى قاعدة البيانات"}
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)] p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-blue-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">المعلومات الأساسية</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-lg font-semibold text-gray-700">
                    📝 الاسم (بالإنجليزية) *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="اسم البطريرك بالإنجليزية"
                    className="text-lg p-4 border-2 border-blue-200 focus:border-blue-500 rounded-lg"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="arabicName" className="text-lg font-semibold text-gray-700">
                    🇦🇪 الاسم (بالعربية)
                  </Label>
                  <Input
                    id="arabicName"
                    value={formData.arabicName}
                    onChange={(e) => setFormData(prev => ({ ...prev, arabicName: e.target.value }))}
                    placeholder="اسم البطريرك بالعربية"
                    className="text-lg p-4 border-2 border-blue-200 focus:border-blue-500 rounded-lg"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="orderNumber" className="text-lg font-semibold text-gray-700">
                    🔢 رقم الترتيب *
                  </Label>
                  <Input
                    id="orderNumber"
                    type="number"
                    value={formData.orderNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderNumber: parseInt(e.target.value) || 1 }))}
                    placeholder="رقم الترتيب"
                    className="text-lg p-4 border-2 border-blue-200 focus:border-blue-500 rounded-lg"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="era" className="text-lg font-semibold text-gray-700">
                    🏛️ العصر *
                  </Label>
                  <Select value={formData.era} onValueChange={(value) => setFormData(prev => ({ ...prev, era: value }))}>
                    <SelectTrigger className="text-lg p-4 border-2 border-blue-200 focus:border-blue-500 rounded-lg">
                      <SelectValue placeholder="اختر العصر" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {predefinedEras.map((era) => (
                        <SelectItem key={era} value={era} className="text-lg p-3">
                          {era}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Time Period Section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-green-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">الفترة الزمنية</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="startYear" className="text-lg font-semibold text-gray-700">
                    📅 سنة البداية *
                  </Label>
                  <Input
                    id="startYear"
                    type="number"
                    value={formData.startYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, startYear: parseInt(e.target.value) || new Date().getFullYear() }))}
                    placeholder="سنة البداية"
                    className="text-lg p-4 border-2 border-green-200 focus:border-green-500 rounded-lg"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="endYear" className="text-lg font-semibold text-gray-700">
                    🏁 سنة النهاية (اختياري)
                  </Label>
                  <Input
                    id="endYear"
                    type="number"
                    value={formData.endYear || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, endYear: e.target.value ? parseInt(e.target.value) : undefined }))}
                    placeholder="سنة النهاية"
                    className="text-lg p-4 border-2 border-green-200 focus:border-green-500 rounded-lg"
                  />
                </div>
              </div>

              {/* Custom Era Input */}
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <Label className="text-lg font-semibold text-gray-700 mb-3 block">
                  ✨ إضافة عصر جديد
                </Label>
                <div className="flex gap-3">
                  <Input
                    value={customEra}
                    onChange={(e) => setCustomEra(e.target.value)}
                    placeholder="اسم العصر الجديد"
                    className="text-lg p-3 border-2 border-yellow-200 focus:border-yellow-500 rounded-lg"
                  />
                  <Button 
                    type="button" 
                    onClick={addCustomEra} 
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6"
                    disabled={!customEra.trim()}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Biography and Contributions Section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-purple-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">السيرة والإسهامات</h3>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="biography" className="text-lg font-semibold text-gray-700">
                    📜 السيرة الذاتية
                  </Label>
                  <Textarea
                    id="biography"
                    value={formData.biography}
                    onChange={(e) => setFormData(prev => ({ ...prev, biography: e.target.value }))}
                    placeholder="السيرة الذاتية للبطريرك"
                    rows={5}
                    className="text-lg p-4 border-2 border-purple-200 focus:border-purple-500 rounded-lg resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="contributions" className="text-lg font-semibold text-gray-700">
                    🌟 الإسهامات والإنجازات
                  </Label>
                  <Textarea
                    id="contributions"
                    value={formData.contributions}
                    onChange={(e) => setFormData(prev => ({ ...prev, contributions: e.target.value }))}
                    placeholder="الإسهامات والإنجازات"
                    rows={5}
                    className="text-lg p-4 border-2 border-purple-200 focus:border-purple-500 rounded-lg resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Heresies Section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-red-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Shield className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">البدع المحاربة</h3>
              </div>
              
              {/* Display selected heresies */}
              {heresiesList.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-3">البدع المختارة:</h4>
                  <div className="flex flex-wrap gap-3">
                    {heresiesList.map((heresy) => (
                      <Badge 
                        key={heresy} 
                        variant="secondary" 
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-red-100 text-red-800 border border-red-200 rounded-full"
                      >
                        <Shield className="h-4 w-4" />
                        {heresy}
                        <button
                          type="button"
                          onClick={() => removeHeresy(heresy)}
                          className="ml-2 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Predefined heresies */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">البدع المتاحة:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {predefinedHeresies.map((heresy) => (
                    <Button
                      key={heresy}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addPredefinedHeresy(heresy)}
                      disabled={heresiesList.includes(heresy)}
                      className="p-3 border-2 border-red-200 hover:bg-red-50 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      {heresy}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom heresy input */}
              <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
                <Label className="text-lg font-semibold text-gray-700 mb-3 block">
                  🛡️ إضافة بدعة جديدة
                </Label>
                <div className="flex gap-3">
                  <Input
                    value={customHeresy}
                    onChange={(e) => setCustomHeresy(e.target.value)}
                    placeholder="اسم البدعة الجديدة"
                    className="text-lg p-3 border-2 border-red-200 focus:border-red-500 rounded-lg"
                  />
                  <Button 
                    type="button" 
                    onClick={addCustomHeresy} 
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6"
                    disabled={!customHeresy.trim() || heresiesList.includes(customHeresy.trim())}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-3" />
                    {patriarch ? "جاري التحديث..." : "جاري الإنشاء..."}
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-3" />
                    {patriarch ? "💾 تحديث البطريرك" : "➕ إنشاء البطريرك"}
                  </>
                )}
              </Button>
              
              {!patriarch && (
                <Button 
                  type="button" 
                  onClick={resetForm}
                  disabled={isLoading}
                  variant="outline"
                  className="border-2 border-gray-300 hover:bg-gray-50 text-gray-700 text-lg py-4 rounded-xl"
                >
                  <RotateCcw className="h-5 w-5 mr-3" />
                  🔄 إعادة تعيين
                </Button>
              )}
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
                className="border-2 border-red-300 hover:bg-red-50 text-red-700 text-lg py-4 rounded-xl"
              >
                <X className="h-5 w-5 mr-3" />
                ❌ إلغاء
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
