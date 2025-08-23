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
import { Loader2, Plus, X } from "lucide-react";
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
        title: "تم إنشاء البطريرك",
        description: "تم إنشاء البطريرك بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/patriarchs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إنشاء البطريرك",
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
        title: "تم تحديث البطريرك",
        description: "تم تحديث البطريرك بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/patriarchs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تحديث البطريرك",
        description: error.message || "حدث خطأ أثناء تحديث البطريرك",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "خطأ في النموذج",
        description: "الاسم مطلوب",
        variant: "destructive",
      });
      return;
    }

    if (!formData.era.trim()) {
      toast({
        title: "خطأ في النموذج",
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          {patriarch ? "تعديل البطريرك" : "إضافة بطريرك جديد"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم (بالإنجليزية)</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="اسم البطريرك بالإنجليزية"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arabicName">الاسم (بالعربية)</Label>
              <Input
                id="arabicName"
                value={formData.arabicName}
                onChange={(e) => setFormData(prev => ({ ...prev, arabicName: e.target.value }))}
                placeholder="اسم البطريرك بالعربية"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderNumber">رقم الترتيب</Label>
              <Input
                id="orderNumber"
                type="number"
                value={formData.orderNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, orderNumber: parseInt(e.target.value) || 1 }))}
                placeholder="رقم الترتيب"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startYear">سنة البداية</Label>
              <Input
                id="startYear"
                type="number"
                value={formData.startYear}
                onChange={(e) => setFormData(prev => ({ ...prev, startYear: parseInt(e.target.value) || new Date().getFullYear() }))}
                placeholder="سنة البداية"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endYear">سنة النهاية (اختياري)</Label>
              <Input
                id="endYear"
                type="number"
                value={formData.endYear || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, endYear: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="سنة النهاية"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="era">العصر</Label>
              <Select value={formData.era} onValueChange={(value) => setFormData(prev => ({ ...prev, era: value }))}>
                <SelectTrigger>
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

          {/* Custom Era Input */}
          <div className="space-y-2">
            <Label>إضافة عصر جديد</Label>
            <div className="flex gap-2">
              <Input
                value={customEra}
                onChange={(e) => setCustomEra(e.target.value)}
                placeholder="اسم العصر الجديد"
              />
              <Button type="button" onClick={addCustomEra} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="biography">السيرة الذاتية</Label>
            <Textarea
              id="biography"
              value={formData.biography}
              onChange={(e) => setFormData(prev => ({ ...prev, biography: e.target.value }))}
              placeholder="السيرة الذاتية للبطريرك"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contributions">الإسهامات</Label>
            <Textarea
              id="contributions"
              value={formData.contributions}
              onChange={(e) => setFormData(prev => ({ ...prev, contributions: e.target.value }))}
              placeholder="الإسهامات والإنجازات"
              rows={4}
            />
          </div>

          {/* Heresies Section */}
          <div className="space-y-4">
            <Label>البدع المحاربة</Label>
            
            {/* Display selected heresies */}
            {heresiesList.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {heresiesList.map((heresy) => (
                  <Badge key={heresy} variant="secondary" className="flex items-center gap-1">
                    {heresy}
                    <button
                      type="button"
                      onClick={() => removeHeresy(heresy)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Predefined heresies */}
            <div className="space-y-2">
              <Label className="text-sm">البدع المتاحة:</Label>
              <div className="flex flex-wrap gap-2">
                {predefinedHeresies.map((heresy) => (
                  <Button
                    key={heresy}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addPredefinedHeresy(heresy)}
                    disabled={heresiesList.includes(heresy)}
                  >
                    {heresy}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom heresy input */}
            <div className="space-y-2">
              <Label>إضافة بدعة جديدة</Label>
              <div className="flex gap-2">
                <Input
                  value={customHeresy}
                  onChange={(e) => setCustomHeresy(e.target.value)}
                  placeholder="اسم البدعة الجديدة"
                />
                <Button type="button" onClick={addCustomHeresy} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  {patriarch ? "جاري التحديث..." : "جاري الإنشاء..."}
                </>
              ) : (
                patriarch ? "تحديث البطريرك" : "إنشاء البطريرك"
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}