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
  { id: "arianism", label: "الآريوسية" },
  { id: "nestorianism", label: "النسطورية" },
  { id: "monophysitism", label: "المونوفيزية" },
  { id: "gnosticism", label: "الغنوصية" },
];

const eraOptions = [
  { value: "apostolic", label: "العصر الرسولي" },
  { value: "golden", label: "العصر الذهبي" },
  { value: "councils", label: "عصر المجامع" },
  { value: "persecution", label: "عصر الاضطهاد" },
  { value: "modern", label: "العصر الحديث" },
];

export default function PatriarchForm({ patriarch, onClose }: PatriarchFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!patriarch;

  const form = useForm<InsertPatriarch>({
    resolver: zodResolver(insertPatriarchSchema),
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

  const mutation = useMutation({
    mutationFn: async (data: InsertPatriarch) => {
      const url = isEditing 
        ? `/api/admin/patriarchs/${patriarch.id}` 
        : "/api/admin/patriarchs";
      const method = isEditing ? "PUT" : "POST";
      
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patriarchs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
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

  const onSubmit = (data: InsertPatriarch) => {
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
                render={() => (
                  <FormItem>
                    <FormLabel>البدع التي حاربها</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      {heresiesOptions.map((heresy) => (
                        <FormField
                          key={heresy.id}
                          control={form.control}
                          name="heresiesFought"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={heresy.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(heresy.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, heresy.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== heresy.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {heresy.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
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
