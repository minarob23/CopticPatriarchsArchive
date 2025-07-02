import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertPatriarchSchema, type InsertPatriarch, type Patriarch } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface PatriarchFormProps {
  patriarch?: Patriarch | null;
  onClose: () => void;
}

const heresiesOptions = [
  { id: "Arianism", label: "الآريوسية" },
  { id: "Nestorianism", label: "النسطورية" },
  { id: "Chalcedonianism", label: "الخلقيدونية" },
  { id: "Gnosticism", label: "الغنوصية" },
  { id: "Paganism", label: "الوثنية" },
  { id: "Roman Persecution", label: "الاضطهاد الروماني" },
  { id: "Manichaeism", label: "المانوية" },
  { id: "Donatism", label: "الدوناتية" },
  { id: "Islamic Extremism", label: "التطرف الإسلامي" },
  { id: "Secularism", label: "العلمانية" },
  { id: "Protestant Missions", label: "الإرساليات البروتستانتية" },
  { id: "Modernism", label: "الحداثة" },
  { id: "Communism", label: "الشيوعية" },
  { id: "Atheism", label: "الإلحاد" },
];

const eraOptions = [
  { value: "العصر الرسولي", label: "العصر الرسولي" },
  { value: "العصر الذهبي", label: "العصر الذهبي" },
  { value: "عصر المجامع", label: "عصر المجامع" },
  { value: "عصر الاضطهاد", label: "عصر الاضطهاد" },
  { value: "العصر القبطي المستقل", label: "العصر القبطي المستقل" },
  { value: "العصر البيزنطي", label: "العصر البيزنطي" },
  { value: "العصر الإسلامي المبكر", label: "العصر الإسلامي المبكر" },
  { value: "العصر العباسي المبكر", label: "العصر العباسي المبكر" },
  { value: "العصر العباسي المتأخر", label: "العصر العباسي المتأخر" },
  { value: "العصر الفاطمي", label: "العصر الفاطمي" },
  { value: "العصر الأيوبي", label: "العصر الأيوبي" },
  { value: "العصر المملوكي", label: "العصر المملوكي" },
  { value: "العصر العثماني", label: "العصر العثماني" },
  { value: "العصر الحديث", label: "العصر الحديث" },
  { value: "العصر المعاصر", label: "العصر المعاصر" },
];

type PatriarchFormData = {
  name: string;
  arabicName?: string;
  orderNumber: number;
  startYear: number;
  endYear?: number;
  era: string;
  contributions: string;
  biography?: string;
  heresiesFought: string[];
};

export default function PatriarchForm({ patriarch, onClose }: PatriarchFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!patriarch;

  // State for custom inputs
  const [newHeresy, setNewHeresy] = useState("");
  const [newEra, setNewEra] = useState("");
  const [customEra, setCustomEra] = useState("");
  const [useCustomEra, setUseCustomEra] = useState(false);

  const form = useForm<PatriarchFormData>({
    defaultValues: {
      name: patriarch?.name || "",
      arabicName: patriarch?.arabicName || "",
      orderNumber: patriarch?.orderNumber || 1,
      startYear: patriarch?.startYear || new Date().getFullYear(),
      endYear: patriarch?.endYear || undefined,
      era: patriarch?.era || "",
      contributions: patriarch?.contributions || "",
      biography: patriarch?.biography || "",
      heresiesFought: patriarch?.heresiesFought || [],
    },
  });

  // Helper functions for managing custom inputs
  const addNewHeresy = () => {
    if (newHeresy.trim()) {
      const currentHeresies = form.getValues("heresiesFought");
      if (!currentHeresies.includes(newHeresy.trim())) {
        form.setValue("heresiesFought", [...currentHeresies, newHeresy.trim()]);
        setNewHeresy("");
      }
    }
  };

  const removeHeresy = (heresyToRemove: string) => {
    const currentHeresies = form.getValues("heresiesFought");
    form.setValue("heresiesFought", currentHeresies.filter(h => h !== heresyToRemove));
  };

  const handleCustomEra = () => {
    if (customEra.trim()) {
      form.setValue("era", customEra.trim());
      setUseCustomEra(false);
      setCustomEra("");
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: PatriarchFormData) => {
      const url = isEditing 
        ? `/api/admin/patriarchs/${patriarch.id}` 
        : "/api/admin/patriarchs";
      const method = isEditing ? "PUT" : "POST";
      
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patriarchs"] });
      toast({
        title: isEditing ? "تم التحديث" : "تم الإنشاء",
        description: isEditing ? "تم تحديث البطريرك بنجاح" : "تم إنشاء البطريرك بنجاح",
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "غير مخول",
          description: "تم تسجيل خروجك. جارٍ تسجيل الدخول مرة أخرى...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "خطأ",
        description: isEditing ? "فشل في تحديث البطريرك" : "فشل في إنشاء البطريرك",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PatriarchFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-amiri">
            {isEditing ? "تعديل بطريرك" : "إضافة بطريرك جديد"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                المعلومات الأساسية
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم الإنجليزي</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: Pope Athanasius the Great" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="arabicName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم العربي</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: البابا أثناسيوس الرسولي" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orderNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الرقم في الترتيب</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="مثال: 20" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>سنة البداية</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="مثال: 328" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>سنة النهاية (اختياري)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="مثال: 373" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="era"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العصر التاريخي</FormLabel>
                    <div className="space-y-3">
                      {!useCustomEra ? (
                        <>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر العصر" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {eraOptions.map((era) => (
                                <SelectItem key={era.value} value={era.value}>
                                  {era.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setUseCustomEra(true)}
                            className="w-full"
                          >
                            أضف عصر جديد
                          </Button>
                        </>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            placeholder="اكتب اسم العصر الجديد"
                            value={customEra}
                            onChange={(e) => setCustomEra(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            onClick={handleCustomEra}
                            disabled={!customEra.trim()}
                            size="sm"
                          >
                            إضافة
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setUseCustomEra(false);
                              setCustomEra("");
                            }}
                            size="sm"
                          >
                            إلغاء
                          </Button>
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Theological Contributions */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                المساهمات اللاهوتية
              </h4>

              <FormField
                control={form.control}
                name="heresiesFought"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البدع التي حاربها</FormLabel>
                    <div className="space-y-4">
                      {/* Pre-defined heresies checkboxes */}
                      <div className="grid grid-cols-2 gap-4">
                        {heresiesOptions.map((heresy) => (
                          <div
                            key={heresy.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <Checkbox
                              checked={field.value?.includes(heresy.id)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                const newValue = checked
                                  ? [...currentValue, heresy.id]
                                  : currentValue.filter((value: string) => value !== heresy.id);
                                field.onChange(newValue);
                              }}
                            />
                            <Label className="font-normal text-sm">
                              {heresy.label}
                            </Label>
                          </div>
                        ))}
                      </div>

                      {/* Add custom heresy */}
                      <div className="border-t pt-4">
                        <Label className="text-sm font-medium">أضف بدعة جديدة</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            placeholder="اكتب اسم البدعة الجديدة"
                            value={newHeresy}
                            onChange={(e) => setNewHeresy(e.target.value)}
                            className="flex-1"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addNewHeresy();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            onClick={addNewHeresy}
                            disabled={!newHeresy.trim()}
                            size="sm"
                          >
                            إضافة
                          </Button>
                        </div>
                      </div>

                      {/* Display selected heresies */}
                      {field.value && field.value.length > 0 && (
                        <div className="border-t pt-4">
                          <Label className="text-sm font-medium mb-2 block">البدع المحددة:</Label>
                          <div className="flex flex-wrap gap-2">
                            {field.value.map((heresy, index) => {
                              const predefinedHeresy = heresiesOptions.find(h => h.id === heresy);
                              const displayName = predefinedHeresy ? predefinedHeresy.label : heresy;
                              
                              return (
                                <div
                                  key={index}
                                  className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                                >
                                  <span>{displayName}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 hover:bg-blue-200"
                                    onClick={() => removeHeresy(heresy)}
                                  >
                                    ×
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contributions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المساهمات الرئيسية</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="اكتب المساهمات التي قدمها البطريرك للكنيسة والإيمان..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="biography"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السيرة والتفاصيل</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={6}
                        placeholder="اكتب سيرة مفصلة عن البطريرك وأعماله..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button 
                type="submit" 
                disabled={mutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {mutation.isPending ? (
                  <>
                    <div className="loading-spinner w-4 h-4 mr-2"></div>
                    {isEditing ? "جارٍ التحديث..." : "جارٍ الحفظ..."}
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    {isEditing ? "تحديث البطريرك" : "حفظ البطريرك"}
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
                disabled={mutation.isPending}
              >
                <i className="fas fa-times mr-2"></i>
                إلغاء
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
