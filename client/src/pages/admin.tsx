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
import Loading from "@/components/ui/loading";
import type { Patriarch } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

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
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showChatbotConfig, setShowChatbotConfig] = useState(false);

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

  const queryClient = useQueryClient();
  const navigate = useLocation()[1];

  const { data: chatbotStatus } = useQuery({
    queryKey: ["/api/admin/chatbot/status"],
    retry: false,
  });

  const configChatbotMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      return apiRequest('/api/admin/chatbot/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });
    },
    onSuccess: () => {
      toast({ title: "تم تكوين Gemini API بنجاح", variant: "default" });
      setGeminiApiKey("");
      setShowChatbotConfig(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/chatbot/status"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        navigate("/login");
        return;
      }
      toast({ 
        title: "خطأ في تكوين API", 
        description: "تأكد من صحة مفتاح API",
        variant: "destructive" 
      });
    }
  });


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
    // Implementation for comprehensive reporting
    toast({ title: "ميزة التقرير الشامل قيد التطوير", variant: "default" });
  };

  const handleConfigureChatbot = () => {
    if (!geminiApiKey.trim()) {
      toast({ title: "يرجى إدخال مفتاح Gemini API", variant: "destructive" });
      return;
    }
    configChatbotMutation.mutate(geminiApiKey);
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

        {/* Era Distribution Chart */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="font-amiri text-lg">
              <i className="fas fa-chart-pie ml-2"></i>
              توزيع البطاركة حسب العصور التاريخية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {Object.entries(finalStats?.byEra || {}).map(([era, count]) => (
                  <div key={era} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-blue-500 ml-3"></div>
                      <span className="font-medium">{eraLabels[era] || era}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-blue-600 ml-2">{count}</span>
                      <span className="text-sm text-gray-500">بطريرك</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center">
                <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <i className="fas fa-church text-6xl text-blue-600 mb-2"></i>
                    <p className="text-lg font-bold text-gray-700">
                      {finalStats?.total || 0} بطريرك
                    </p>
                    <p className="text-sm text-gray-500">في التاريخ القبطي</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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

           <Button
            variant="outline"
            onClick={() => setShowChatbotConfig(true)}
          >
            <i className="fas fa-cog ml-2"></i>
            تكوين شات بوت "اسأل البطريرك"
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

        {/* Chatbot Configuration Dialog */}
        {showChatbotConfig && (
          <Card className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold font-amiri">إعداد شات بوت "اسأل البطريرك"</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChatbotConfig(false)}
                >
                  <i className="fas fa-times"></i>
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مفتاح Google Gemini API
                  </label>
                  <Input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="أدخل مفتاح Gemini API..."
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    احصل على مفتاح API من Google AI Studio
                  </p>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center text-blue-700">
                    <i className="fas fa-info-circle ml-2"></i>
                    <span className="text-sm">الحالة الحالية:</span>
                  </div>
                  <p className="text-sm mt-1">
                    {chatbotStatus?.configured ? (
                      <span className="text-green-600">
                        <i className="fas fa-check ml-1"></i>
                        الشات بوت مُكوّن ويعمل بشكل صحيح
                      </span>
                    ) : (
                      <span className="text-orange-600">
                        <i className="fas fa-exclamation-triangle ml-1"></i>
                        الشات بوت غير مُكوّن - يحتاج مفتاح API
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleConfigureChatbot}
                    disabled={configChatbotMutation.isPending}
                    className="flex-1"
                  >
                    {configChatbotMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin ml-2"></i>
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save ml-2"></i>
                        حفظ الإعدادات
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowChatbotConfig(false)}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
    </div>
  );
}