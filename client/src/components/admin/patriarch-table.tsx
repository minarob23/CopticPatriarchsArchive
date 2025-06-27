import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Patriarch } from "@shared/schema";

interface PatriarchTableProps {
  patriarchs: Patriarch[];
  onEdit: (patriarch: Patriarch) => void;
}

const eraLabels: Record<string, string> = {
  apostolic: "العصر الرسولي",
  golden: "العصر الذهبي",
  councils: "عصر المجامع",
  persecution: "عصر الاضطهاد",
  modern: "العصر الحديث",
};

const eraColors: Record<string, string> = {
  apostolic: "bg-blue-100 text-blue-800",
  golden: "bg-yellow-100 text-yellow-800",
  councils: "bg-purple-100 text-purple-800",
  persecution: "bg-red-100 text-red-800",
  modern: "bg-green-100 text-green-800",
};

export default function PatriarchTable({ patriarchs, onEdit }: PatriarchTableProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/patriarchs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patriarchs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "تم الحذف",
        description: "تم حذف البطريرك بنجاح",
      });
      setDeleteId(null);
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
        description: "فشل في حذف البطريرك",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  if (patriarchs.length === 0) {
    return (
      <div className="text-center py-8">
        <i className="fas fa-database text-4xl text-gray-400 mb-4"></i>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد بيانات</h3>
        <p className="text-gray-500">لا يوجد بطاركة لعرضهم</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الفترة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المساهمة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العصر</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patriarchs.map((patriarch) => (
              <tr key={patriarch.id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                        <i className="fas fa-user text-white"></i>
                      </div>
                    </div>
                    <div className="mr-4">
                      <div className="text-sm font-medium text-gray-900">{patriarch.arabicName || patriarch.name}</div>
                      <div className="text-sm text-gray-500">البابا {patriarch.orderNumber}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {patriarch.startYear} - {patriarch.endYear || "الآن"} م
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {patriarch.contributions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={eraColors[patriarch.era] || "bg-gray-100 text-gray-800"}>
                    {eraLabels[patriarch.era] || patriarch.era}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-reverse space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(patriarch)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(patriarch.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف بيانات هذا البطريرك؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "جارٍ الحذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
