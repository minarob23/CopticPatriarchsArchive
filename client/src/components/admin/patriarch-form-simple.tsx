
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
import { Loader2, Plus, X, Crown, Calendar, Globe, Book, Shield, User } from "lucide-react";
import type { Patriarch } from "@shared/schema";

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
  const [customHeresy, setCustomHeresy] = useState("");
  const [heresiesList, setHeresiesList] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: patriarch?.name || "",
    arabicName: patriarch?.arabicName || "",
    orderNumber: patriarch?.orderNumber || 1,
    startYear: patriarch?.startYear || new Date().getFullYear(),
    endYear: patriarch?.endYear || undefined,
    era: patriarch?.era || "",
    biography: patriarch?.biography || "",
    contributions: patriarch?.contributions || "",
  });

  // Initialize heresies from patriarch data
  useEffect(() => {
    if (patriarch?.heresiesFought) {
      try {
        const heresies = Array.isArray(patriarch.heresiesFought) 
          ? patriarch.heresiesFought 
          : JSON.parse(patriarch.heresiesFought || '[]');
        setHeresiesList(heresies);
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
        title: "✨ تم إنشاء البطريرك",
        description: "تم إنشاء البطريرك بنجاح",
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
        title: "✅ تم تحديث البطريرك",
        description: "تم تحديث البطريرك بنجاح",
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
        description: "الاسم مطلوب",
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
      contributions: formData.contributions || "",
      heresiesFought: JSON.stringify(heresiesList),
      active: true,
    };

    if (patriarch) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const addCustomHeresy = () => {
    if (customHeresy.trim() && !heresiesList.includes(customHeresy.trim())) {
      const newList = [...heresiesList, customHeresy.trim()];
      setHeresiesList(newList);
      setCustomHeresy("");
    }
  };

  const removeHeresy = (heresy: string) => {
    const newList = heresiesList.filter(h => h !== heresy);
    setHeresiesList(newList);
  };

  const addPredefinedHeresy = (heresy: string) => {
    if (!heresiesList.includes(heresy)) {
      const newList = [...heresiesList, heresy];
      setHeresiesList(newList);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <CardHeader className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
          
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Crown className="h-8 w-8 text-white drop-shadow-lg" />
              <CardTitle className="text-3xl font-bold text-white drop-shadow-lg">
                {patriarch ? "✏️ تعديل البطريرك" : "➕ إضافة بطريرك جديد"}
              </CardTitle>
              <Crown className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
            <p className="text-amber-100 text-lg font-medium">
              {patriarch ? "تحديث بيانات البطريرك" : "إضافة بطريرك جديد إلى قائمة البطاركة"}
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-6">
                <User className="h-5 w-5 text-amber-600" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">المعلومات الأساسية</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    الاسم (بالإنجليزية) *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="اسم البطريرك بالإنجليزية"
                    className="border-amber-300 focus:border-amber-500 focus:ring-amber-500 transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arabicName" className="text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    الاسم (بالعربية)
                  </Label>
                  <Input
                    id="arabicName"
                    value={formData.arabicName}
                    onChange={(e) => setFormData(prev => ({ ...prev, arabicName: e.target.value }))}
                    placeholder="اسم البطريرك بالعربية"
                    className="border-amber-300 focus:border-amber-500 focus:ring-amber-500 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orderNumber" className="text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    رقم الترتيب *
                  </Label>
                  <Input
                    id="orderNumber"
                    type="number"
                    value={formData.orderNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderNumber: parseInt(e.target.value) || 1 }))}
                    placeholder="رقم الترتيب"
                    className="border-amber-300 focus:border-amber-500 focus:ring-amber-500 transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="era" className="text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    العصر *
                  </Label>
                  <Select value={formData.era} onValueChange={(value) => setFormData(prev => ({ ...prev, era: value }))}>
                    <SelectTrigger className="border-amber-300 focus:border-amber-500 focus:ring-amber-500">
                      <SelectValue placeholder="اختر العصر" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedEras.map((era) => (
                        <SelectItem key={era} value={era}>
                          {era}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Time Period Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="h-5 w-5 text-amber-600" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">الفترة الزمنية</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startYear" className="text-gray-700 dark:text-gray-300 font-semibold">
                    سنة البداية *
                  </Label>
                  <Input
                    id="startYear"
                    type="number"
                    value={formData.startYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, startYear: parseInt(e.target.value) || new Date().getFullYear() }))}
                    placeholder="سنة البداية"
                    className="border-amber-300 focus:border-amber-500 focus:ring-amber-500 transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endYear" className="text-gray-700 dark:text-gray-300 font-semibold">
                    سنة النهاية (اختياري)
                  </Label>
                  <Input
                    id="endYear"
                    type="number"
                    value={formData.endYear || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, endYear: e.target.value ? parseInt(e.target.value) : undefined }))}
                    placeholder="سنة النهاية"
                    className="border-amber-300 focus:border-amber-500 focus:ring-amber-500 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Heresies Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="h-5 w-5 text-red-600" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">البدع المحاربة</h3>
              </div>
              
              {/* Display selected heresies */}
              {heresiesList.length > 0 && (
                <div className="mb-4">
                  <Label className="text-gray-700 dark:text-gray-300 font-semibold mb-2 block">
                    البدع المختارة:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {heresiesList.map((heresy) => (
                      <Badge key={heresy} variant="destructive" className="flex items-center gap-1 bg-red-100 text-red-800 border border-red-300">
                        <Shield className="h-3 w-3" />
                        {heresy}
                        <button
                          type="button"
                          onClick={() => removeHeresy(heresy)}
                          className="ml-1 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Predefined heresies */}
              <div className="space-y-3">
                <Label className="text-gray-700 dark:text-gray-300 font-semibold">
                  البدع المتاحة:
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {predefinedHeresies.map((heresy) => (
                    <Button
                      key={heresy}
                      type="button"
                      variant={heresiesList.includes(heresy) ? "default" : "outline"}
                      size="sm"
                      onClick={() => addPredefinedHeresy(heresy)}
                      disabled={heresiesList.includes(heresy)}
                      className={`text-sm transition-all duration-300 ${
                        heresiesList.includes(heresy) 
                          ? "bg-red-600 hover:bg-red-700 text-white" 
                          : "border-red-300 text-red-700 hover:bg-red-50"
                      }`}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {heresy}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom heresy input */}
              <div className="mt-4 space-y-2">
                <Label className="text-gray-700 dark:text-gray-300 font-semibold">
                  إضافة بدعة جديدة:
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={customHeresy}
                    onChange={(e) => setCustomHeresy(e.target.value)}
                    placeholder="اسم البدعة الجديدة"
                    className="flex-1 border-red-300 focus:border-red-500 focus:ring-red-500"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomHeresy())}
                  />
                  <Button 
                    type="button" 
                    onClick={addCustomHeresy} 
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Biography and Contributions Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-6">
                <Book className="h-5 w-5 text-amber-600" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">السيرة والإسهامات</h3>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="biography" className="text-gray-700 dark:text-gray-300 font-semibold">
                    السيرة الذاتية
                  </Label>
                  <Textarea
                    id="biography"
                    value={formData.biography}
                    onChange={(e) => setFormData(prev => ({ ...prev, biography: e.target.value }))}
                    placeholder="السيرة الذاتية للبطريرك..."
                    rows={4}
                    className="border-amber-300 focus:border-amber-500 focus:ring-amber-500 transition-all duration-300 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contributions" className="text-gray-700 dark:text-gray-300 font-semibold">
                    الإسهامات والإنجازات
                  </Label>
                  <Textarea
                    id="contributions"
                    value={formData.contributions}
                    onChange={(e) => setFormData(prev => ({ ...prev, contributions: e.target.value }))}
                    placeholder="الإسهامات والإنجازات..."
                    rows={4}
                    className="border-amber-300 focus:border-amber-500 focus:ring-amber-500 transition-all duration-300 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin ml-2" />
                    {patriarch ? "جاري التحديث..." : "جاري الإنشاء..."}
                  </>
                ) : (
                  <>
                    <Crown className="h-5 w-5 ml-2" />
                    {patriarch ? "💫 تحديث البطريرك" : "✨ إنشاء البطريرك"}
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300"
              >
                ❌ إلغاء
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
