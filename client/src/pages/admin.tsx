import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PatriarchTable from "@/components/admin/patriarch-table";
import PatriarchForm from "@/components/admin/patriarch-form";
import GeminiSettings from "@/components/admin/gemini-settings";
import Loading from "@/components/ui/loading";
import type { Patriarch } from "@shared/schema";

const eraLabels: Record<string, string> = {
  apostolic: "العصر الرسولي",
  golden: "العصر الذهبي",
  councils: "عصر المجامع",
  persecution: "عصر الاضطهاد",
  modern: "العصر الحديث",
};

const eras = [
  { value: "all", label: "جميع العصور" },
  { value: "apostolic", label: "العصر الرسولي" },
  { value: "golden", label: "العصر الذهبي" },
  { value: "councils", label: "عصر المجامع" },
  { value: "persecution", label: "عصر الاضطهاد" },
  { value: "modern", label: "العصر الحديث" },
];

export default function Admin() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEra, setSelectedEra] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingPatriarch, setEditingPatriarch] = useState<Patriarch | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
      return;
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Update date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const { data: allPatriarchs, isLoading: patriarchsLoading } = useQuery<Patriarch[]>({
    queryKey: ["/api/patriarchs"],
    retry: false,
    enabled: !!isAuthenticated,
  });

  // Filter patriarchs based on search and era
  const patriarchs = allPatriarchs?.filter(patriarch => {
    const matchesSearch = !searchQuery || 
      patriarch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patriarch.arabicName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEra = selectedEra === "all" || patriarch.era === selectedEra;
    
    return matchesSearch && matchesEra;
  }) || [];

  // Calculate stats from all patriarchs data (not filtered)
  const stats = allPatriarchs ? {
    total: allPatriarchs.length,
    byEra: allPatriarchs.reduce((acc: Record<string, number>, patriarch) => {
      acc[patriarch.era] = (acc[patriarch.era] || 0) + 1;
      return acc;
    }, {}),
    totalDefenders: allPatriarchs.filter(p => p.heresiesFought.length > 0).length
  } : null;

  const finalStats = stats;

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
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

  const handleExportData = () => {
    if (!patriarchs || patriarchs.length === 0) {
      toast({
        title: "لا توجد بيانات",
        description: "لا توجد بيانات لتصديرها",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const headers = ["الاسم", "الرقم", "سنة البداية", "سنة النهاية", "العصر", "المساهمات", "البدع المحاربة"];
    const csvContent = [
      headers.join(","),
      ...patriarchs.map(p => [
        `"${p.name}"`,
        p.orderNumber,
        p.startYear,
        p.endYear || "",
        `"${eraLabels[p.era] || p.era}"`,
        `"${p.contributions}"`,
        `"${p.heresiesFought.join('; ')}"`
      ].join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `بطاركة_الكنيسة_القبطية_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "تم التصدير",
      description: "تم تصدير البيانات بنجاح",
    });
  };

  const handleGenerateReport = () => {
    if (!finalStats || !patriarchs) {
      toast({
        title: "لا توجد بيانات",
        description: "لا توجد بيانات كافية لإنشاء التقرير",
        variant: "destructive",
      });
      return;
    }

    // Generate comprehensive report
    const reportContent = `
تقرير شامل - بطاركة الكنيسة القبطية الأرثوذكسية
تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}

===============================================

الإحصائيات العامة:
• إجمالي البطاركة: ${finalStats.total}
• محاربو البدع: ${finalStats.totalDefenders}
• نسبة محاربي البدع: ${((finalStats.totalDefenders / finalStats.total) * 100).toFixed(1)}%

التوزيع حسب العصور:
${Object.entries(finalStats.byEra).map(([era, count]) => 
  `• ${eraLabels[era] || era}: ${count} بطريرك`
).join('\n')}

===============================================

قائمة البطاركة التفصيلية:

${patriarchs.map((p, index) => `
${index + 1}. ${p.name}
   الرقم: البابا ${p.orderNumber}
   الفترة: ${p.startYear} - ${p.endYear || "الآن"} م
   العصر: ${eraLabels[p.era] || p.era}
   المساهمات: ${p.contributions}
   البدع المحاربة: ${p.heresiesFought.length > 0 ? p.heresiesFought.join(', ') : 'لا توجد'}
`).join('\n')}

===============================================

ملاحظات:
• هذا التقرير تم إنشاؤه تلقائيًا من قاعدة البيانات
• البيانات محدثة حتى تاريخ إنشاء التقرير
• جميع المعلومات مستندة إلى المصادر التاريخية المعتمدة
`;

    // Create and download report
    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `تقرير_بطاركة_الكنيسة_القبطية_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();

    toast({
      title: "تم إنشاء التقرير",
      description: "تم إنشاء التقرير الشامل بنجاح",
    });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50" dir="rtl">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-reverse space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <i className="fas fa-tachometer-alt text-2xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold font-amiri">لوحة تحكم الإدارة</h2>
                <div className="flex items-center space-x-reverse space-x-3">
                  <p className="text-blue-100 text-sm">
                    مرحبًا بك 
                    <span className="font-semibold text-yellow-200 mx-1">
                      {(user as any)?.name || 'المدير'}
                    </span>
                    - إدارة بيانات البطاركة
                  </p>
                  <div className="hidden md:flex items-center bg-white bg-opacity-10 rounded-lg px-3 py-1 backdrop-blur-sm">
                    <div className="flex items-center space-x-reverse space-x-2">
                      <i className="fas fa-calendar-alt text-yellow-300 text-sm"></i>
                      <span className="text-blue-100 text-xs font-medium">
                        {currentDateTime.toLocaleDateString('ar-EG', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <div className="w-px h-4 bg-blue-300 opacity-50"></div>
                      <i className="fas fa-clock text-yellow-300 text-sm"></i>
                      <span className="text-blue-100 text-xs font-medium font-mono">
                        {currentDateTime.toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-reverse space-x-4">
              <span className="text-blue-200">{(user as any)?.firstName || "الأدمن"}</span>
              <Button 
                variant="secondary" 
                onClick={() => {
                  // Check if demo user
                  if (localStorage.getItem('demo-auth')) {
                    localStorage.removeItem('demo-auth');
                    setLocation("/login");
                  } else {
                    window.location.href = "/api/logout";
                  }
                }}
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
        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">إجمالي البطاركة</p>
                  <p className="text-4xl font-bold">{finalStats?.total || 0}</p>
                  <p className="text-yellow-200 text-xs mt-1">مسجل في قاعدة البيانات</p>
                </div>
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <i className="fas fa-users text-3xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">العصر الحديث</p>
                  <p className="text-4xl font-bold">{finalStats?.byEra?.modern || 0}</p>
                  <p className="text-green-200 text-xs mt-1">بطريرك</p>
                </div>
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <i className="fas fa-calendar-alt text-3xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">محاربو البدع</p>
                  <p className="text-4xl font-bold">{finalStats?.totalDefenders || 0}</p>
                  <p className="text-purple-200 text-xs mt-1">
                    {finalStats?.total ? `${((finalStats.totalDefenders / finalStats.total) * 100).toFixed(1)}%` : '0%'} من المجموع
                  </p>
                </div>
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <i className="fas fa-shield-alt text-3xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">العصر الذهبي</p>
                  <p className="text-4xl font-bold">{finalStats?.byEra?.golden || 0}</p>
                  <p className="text-blue-200 text-xs mt-1">أزهى فترات الكنيسة</p>
                </div>
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <i className="fas fa-crown text-3xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Era Distribution Chart */}
        <Card className="mb-8 shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white relative">
            <div className="absolute inset-0 bg-black bg-opacity-10"></div>
            <CardTitle className="font-amiri text-xl relative z-10 flex items-center">
              <i className="fas fa-history ml-3 text-2xl"></i>
              توزيع البطاركة الـ 118 حسب العصور التاريخية
              <span className="mr-auto bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                {finalStats?.total || 0} بطريرك
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Historical Eras List */}
              <div className="lg:col-span-2 space-y-3">
                {Object.entries(finalStats?.byEra || {})
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .map(([era, count], index) => {
                    const eraColors = {
                      'العصر الرسولي': 'from-purple-500 to-purple-700',
                      'العصر الذهبي': 'from-yellow-500 to-amber-600',
                      'عصر المجامع': 'from-blue-500 to-blue-700',
                      'عصر الاضطهاد': 'from-red-500 to-red-700',
                      'العصر القبطي المستقل': 'from-green-500 to-green-700',
                      'العصر البيزنطي': 'from-indigo-500 to-indigo-700',
                      'العصر الإسلامي المبكر': 'from-teal-500 to-teal-700',
                      'العصر العباسي المبكر': 'from-cyan-500 to-cyan-700',
                      'العصر العباسي': 'from-slate-500 to-slate-700',
                      'العصر الفاطمي المبكر': 'from-emerald-500 to-emerald-700',
                      'العصر الفاطمي': 'from-lime-500 to-lime-700',
                      'العصر الفاطمي المتأخر': 'from-orange-500 to-orange-700',
                      'العصر الأيوبي المبكر': 'from-rose-500 to-rose-700',
                      'العصر الأيوبي': 'from-pink-500 to-pink-700',
                      'العصر الأيوبي المتأخر': 'from-fuchsia-500 to-fuchsia-700',
                      'العصر المملوكي المبكر': 'from-violet-500 to-violet-700',
                      'العصر المملوكي': 'from-sky-500 to-sky-700',
                      'العصر المملوكي المتأخر': 'from-blue-600 to-blue-800',
                      'العصر العثماني المبكر': 'from-indigo-600 to-indigo-800',
                      'العصر العثماني': 'from-purple-600 to-purple-800',
                      'العصر العثماني المتأخر': 'from-pink-600 to-pink-800',
                      'العصر الحديث المبكر': 'from-green-600 to-green-800',
                      'عصر محمد علي': 'from-yellow-600 to-yellow-800',
                      'عصر التحديث': 'from-orange-600 to-orange-800',
                      'العصر الحديث': 'from-red-600 to-red-800',
                      'العصر المعاصر': 'from-emerald-600 to-emerald-800'
                    };
                    
                    const gradient = eraColors[era as keyof typeof eraColors] || 'from-gray-500 to-gray-700';
                    const percentage = ((count as number) / (finalStats?.total || 1) * 100).toFixed(1);
                    
                    return (
                      <div key={era} 
                           className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${gradient} p-5 text-white shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-xl`}>
                        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1 font-amiri">{era}</h3>
                            <div className="flex items-center space-x-reverse space-x-3">
                              <span className="text-3xl font-bold">{count}</span>
                              <span className="text-sm opacity-90">بطريرك</span>
                              <div className="mr-auto bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-medium">
                                {percentage}%
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                              <span className="text-xl font-bold">{index + 1}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="mt-3 bg-white bg-opacity-20 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-white bg-opacity-80 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              
              {/* Summary Statistics */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <i className="fas fa-church text-3xl text-white"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">مجموع البطاركة</h3>
                    <p className="text-5xl font-black text-amber-600 mb-2">{finalStats?.total || 0}</p>
                    <p className="text-gray-600 text-sm">بطريرك عبر التاريخ</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                    <i className="fas fa-clock ml-2 text-blue-600"></i>
                    معلومات تاريخية
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">أول بطريرك:</span>
                      <span className="font-medium text-gray-800">القديس مرقس الرسول (61م)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">البطريرك الحالي:</span>
                      <span className="font-medium text-gray-800">تواضروس الثاني (2012م)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">مدة التاريخ:</span>
                      <span className="font-medium text-gray-800">1964 سنة</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">عدد العصور:</span>
                      <span className="font-medium text-gray-800">{Object.keys(finalStats?.byEra || {}).length} عصر</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Gemini AI Settings */}
        <div className="mb-8">
          <GeminiSettings />
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
          <Button 
            variant="secondary"
            onClick={handleExportData}
          >
            <i className="fas fa-download ml-2"></i>
            تصدير البيانات
          </Button>
          <Button 
            variant="outline"
            onClick={handleGenerateReport}
          >
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
