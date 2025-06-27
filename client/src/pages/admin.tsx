import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PatriarchTable from "@/components/admin/patriarch-table";
import PatriarchForm from "@/components/admin/patriarch-form";
import Loading from "@/components/ui/loading";
import type { Patriarch } from "@shared/schema";

export default function Admin() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEra, setSelectedEra] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingPatriarch, setEditingPatriarch] = useState<Patriarch | null>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats } = useQuery<{
    total: number;
    byEra: Record<string, number>;
    totalDefenders: number;
  }>({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  const { data: patriarchs, isLoading: patriarchsLoading } = useQuery<Patriarch[]>({
    queryKey: ["/api/patriarchs", searchQuery, selectedEra],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return <Loading />;
  }

  const handleAddPatriarch = () => {
    setEditingPatriarch(null);
    setShowForm(true);
  };

  const handleEditPatriarch = (patriarch: Patriarch) => {
    setEditingPatriarch(patriarch);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPatriarch(null);
  };

  const eras = [
    { value: "all", label: "جميع الفترات" },
    { value: "apostolic", label: "العصر الرسولي" },
    { value: "golden", label: "العصر الذهبي" },
    { value: "councils", label: "عصر المجامع" },
    { value: "persecution", label: "عصر الاضطهاد" },
    { value: "modern", label: "العصر الحديث" },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Admin Header */}
      <div className="admin-panel text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-reverse space-x-4">
              <i className="fas fa-tachometer-alt text-2xl"></i>
              <div>
                <h2 className="text-xl font-bold font-amiri">لوحة تحكم الإدارة</h2>
                <p className="text-blue-200 text-sm">إدارة بيانات البطاركة</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-reverse space-x-4">
              <span className="text-blue-200">{(user as any)?.firstName || "الأدمن"}</span>
              <Button 
                variant="secondary" 
                onClick={() => window.location.href = "/api/logout"}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                تسجيل خروج
                <i className="fas fa-sign-out-alt mr-2"></i>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-r-4 border-yellow-400">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">إجمالي البطاركة</p>
                  <p className="text-3xl font-bold text-blue-600">{stats?.total || 0}</p>
                </div>
                <i className="fas fa-users text-yellow-400 text-3xl"></i>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-r-4 border-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">العصر الحديث</p>
                  <p className="text-3xl font-bold text-green-600">{stats?.byEra?.modern || 0}</p>
                </div>
                <i className="fas fa-calendar text-green-500 text-3xl"></i>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-r-4 border-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">محاربو البدع</p>
                  <p className="text-3xl font-bold text-purple-600">{stats?.totalDefenders || 0}</p>
                </div>
                <i className="fas fa-shield-alt text-purple-500 text-3xl"></i>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-r-4 border-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">آخر تحديث</p>
                  <p className="text-sm font-semibold text-blue-600">اليوم</p>
                </div>
                <i className="fas fa-clock text-blue-500 text-3xl"></i>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button 
            onClick={handleAddPatriarch}
            className="bg-yellow-400 text-black hover:bg-yellow-500"
          >
            <i className="fas fa-plus ml-2"></i>
            إضافة بطريرك جديد
          </Button>
          <Button variant="secondary">
            <i className="fas fa-download ml-2"></i>
            تصدير البيانات
          </Button>
          <Button variant="outline">
            <i className="fas fa-chart-bar ml-2"></i>
            تقرير شامل
          </Button>
        </div>
        
        {/* Search and Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-amiri">البحث والفلترة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                type="text"
                placeholder="البحث بالاسم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select value={selectedEra} onValueChange={setSelectedEra}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفترة" />
                </SelectTrigger>
                <SelectContent>
                  {eras.map((era) => (
                    <SelectItem key={era.value} value={era.value}>
                      {era.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="جميع المساهمات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المساهمات</SelectItem>
                  <SelectItem value="arianism">محاربة الآريوسية</SelectItem>
                  <SelectItem value="nestorianism">محاربة النسطورية</SelectItem>
                  <SelectItem value="monophysitism">محاربة المونوفيزية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* Patriarchs Management Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-amiri">إدارة البطاركة</CardTitle>
          </CardHeader>
          <CardContent>
            {patriarchsLoading ? (
              <div className="flex justify-center py-8">
                <div className="loading-spinner"></div>
              </div>
            ) : (
              <PatriarchTable 
                patriarchs={patriarchs || []} 
                onEdit={handleEditPatriarch}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Patriarch Form Modal */}
      {showForm && (
        <PatriarchForm
          patriarch={editingPatriarch}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
