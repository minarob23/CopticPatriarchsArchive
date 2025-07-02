
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";
import PatriarchTable from "@/components/admin/patriarch-table";
import PatriarchForm from "@/components/admin/patriarch-form";
import GeminiSettings from "@/components/admin/gemini-settings";
import Loading from "@/components/ui/loading";
import type { Patriarch } from "@shared/schema";

const eraLabels: Record<string, string> = {
  "العصر الرسولي": "العصر الرسولي",
  "العصر الذهبي": "العصر الذهبي",
  "عصر المجامع": "عصر المجامع", 
  "عصر الاضطهاد": "عصر الاضطهاد",
  "العصر الحديث": "العصر الحديث",
  "العصر الإسلامي المبكر": "العصر الإسلامي المبكر",
  "العصر العثماني": "العصر العثماني",
  "العصر الفاطمي": "العصر الفاطمي",
  "العصر المملوكي المتأخر": "العصر المملوكي المتأخر",
  "العصر المملوكي": "العصر المملوكي",
  "العصر القبطي المستقل": "العصر القبطي المستقل",
  "العصر العثماني المتأخر": "العصر العثماني المتأخر",
  "العصر العباسي المبكر": "العصر العباسي المبكر",
  "العصر البيزنطي": "العصر البيزنطي",
  "العصر الأيوبي": "العصر الأيوبي",
  "العصر العباسي": "العصر العباسي",
  "العصر الفاطمي المتأخر": "العصر الفاطمي المتأخر",
  "عصر التحديث": "عصر التحديث",
  "العصر الحديث المبكر": "العصر الحديث المبكر",
  "العصر المعاصر": "العصر المعاصر",
  "العصر الأيوبي المتأخر": "العصر الأيوبي المتأخر",
  "العصر العثماني المبكر": "العصر العثماني المبكر",
  "العصر الأيوبي المبكر": "العصر الأيوبي المبكر",
  "العصر المملوكي المبكر": "العصر المملوكي المبكر",
  "عصر محمد علي": "عصر محمد علي",
  "العصر الفاطمي المبكر": "العصر الفاطمي المبكر"
};

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

export default function Admin() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedPatriarch, setSelectedPatriarch] = useState<Patriarch | null>(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const { data: patriarchs, isLoading } = useQuery<Patriarch[]>({
    queryKey: ["/api/patriarchs"],
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/patriarchs/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete patriarch");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patriarchs"] });
    },
  });

  const handleEdit = (patriarch: Patriarch) => {
    setSelectedPatriarch(patriarch);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا البطريرك؟")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedPatriarch(null);
    queryClient.invalidateQueries({ queryKey: ["/api/patriarchs"] });
  };

  // إعداد بيانات الرسومات البيانية
  const eraDistribution = Object.entries(
    (patriarchs || []).reduce((acc: Record<string, number>, patriarch) => {
      acc[patriarch.era] = (acc[patriarch.era] || 0) + 1;
      return acc;
    }, {})
  ).map(([era, count]) => ({
    era: eraLabels[era] || era,
    count: count as number
  }));

  const centuryData = (patriarchs || []).reduce((acc: Record<string, number>, patriarch) => {
    const startYear = patriarch.startYear;
    if (startYear) {
      const century = Math.ceil(startYear / 100);
      const centuryLabel = `القرن ${century}`;
      acc[centuryLabel] = (acc[centuryLabel] || 0) + 1;
    }
    return acc;
  }, {});

  const centuryChartData = Object.entries(centuryData)
    .sort(([a], [b]) => {
      const aNum = parseInt(a.replace('القرن ', ''));
      const bNum = parseInt(b.replace('القرن ', ''));
      return aNum - bNum;
    })
    .map(([century, count]) => ({
      century,
      count: count as number
    }));

  const heresyData = (patriarchs || []).reduce((acc: Record<string, number>, patriarch) => {
    let heresies: string[] = [];
    try {
      heresies = Array.isArray(patriarch.heresiesFought) 
        ? patriarch.heresiesFought 
        : JSON.parse(patriarch.heresiesFought || '[]');
    } catch (e) {
      heresies = [];
    }
    
    heresies.forEach(heresy => {
      acc[heresy] = (acc[heresy] || 0) + 1;
    });
    return acc;
  }, {});

  const topHeresiesData = Object.entries(heresyData)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 8)
    .map(([heresy, count]) => ({
      heresy,
      count: count as number
    }));

  const heresyFightersData = [
    {
      category: "محاربو البدع",
      count: (patriarchs || []).filter(p => {
        let heresies: string[] = [];
        try {
          heresies = Array.isArray(p.heresiesFought) 
            ? p.heresiesFought 
            : JSON.parse(p.heresiesFought || '[]');
        } catch (e) {
          heresies = [];
        }
        return heresies.length > 0;
      }).length
    },
    {
      category: "غير محاربين",
      count: (patriarchs || []).filter(p => {
        let heresies: string[] = [];
        try {
          heresies = Array.isArray(p.heresiesFought) 
            ? p.heresiesFought 
            : JSON.parse(p.heresiesFought || '[]');
        } catch (e) {
          heresies = [];
        }
        return heresies.length === 0;
      }).length
    }
  ];

  const chartConfig = {
    count: {
      label: "العدد",
      color: "hsl(var(--chart-1))",
    },
  };

  if (authLoading || isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold font-amiri text-gray-800 mb-2">
              لوحة إدارة البطاركة
            </h1>
            <p className="text-lg text-gray-600">
              إدارة وتحليل بيانات بطاركة الكنيسة القبطية الأرثوذكسية
            </p>
          </div>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
          >
            <i className="fas fa-home ml-2"></i>
            العودة للرئيسية
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-blue-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">إجمالي البطاركة</p>
                  <p className="text-3xl font-bold">{(patriarchs || []).length}</p>
                </div>
                <i className="fas fa-users text-4xl text-blue-200"></i>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">محاربو البدع</p>
                  <p className="text-3xl font-bold">
                    {(patriarchs || []).filter(p => {
                      let heresies: string[] = [];
                      try {
                        heresies = Array.isArray(p.heresiesFought) 
                          ? p.heresiesFought 
                          : JSON.parse(p.heresiesFought || '[]');
                      } catch (e) {
                        heresies = [];
                      }
                      return heresies.length > 0;
                    }).length}
                  </p>
                </div>
                <i className="fas fa-shield-alt text-4xl text-green-200"></i>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">العصور التاريخية</p>
                  <p className="text-3xl font-bold">
                    {new Set((patriarchs || []).map(p => p.era)).size}
                  </p>
                </div>
                <i className="fas fa-clock text-4xl text-purple-200"></i>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">البدع المحاربة</p>
                  <p className="text-3xl font-bold">{Object.keys(heresyData).length}</p>
                </div>
                <i className="fas fa-ban text-4xl text-orange-200"></i>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="patriarchs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="patriarchs">إدارة البطاركة</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
            <TabsTrigger value="charts">الرسومات البيانية</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          {/* Patriarchs Management */}
          <TabsContent value="patriarchs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold font-amiri">إدارة البطاركة</h2>
              <Button
                onClick={() => {
                  setSelectedPatriarch(null);
                  setShowForm(true);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <i className="fas fa-plus ml-2"></i>
                إضافة بطريرك جديد
              </Button>
            </div>

            {showForm && (
              <PatriarchForm
                patriarch={selectedPatriarch}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setShowForm(false);
                  setSelectedPatriarch(null);
                }}
              />
            )}

            <PatriarchTable
              patriarchs={patriarchs || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
            />
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold font-amiri">تحليلات مفصلة</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-amiri">إحصائيات سريعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>متوسط فترة الحكم:</span>
                    <span className="font-bold">
                      {(patriarchs || []).length > 0 
                        ? Math.round(
                            (patriarchs || [])
                              .filter(p => p.startYear && p.endYear)
                              .reduce((sum, p) => sum + (p.endYear! - p.startYear!), 0) /
                            (patriarchs || []).filter(p => p.startYear && p.endYear).length
                          )
                        : 0} سنة
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>أطول فترة حكم:</span>
                    <span className="font-bold">
                      {Math.max(
                        ...(patriarchs || [])
                          .filter(p => p.startYear && p.endYear)
                          .map(p => p.endYear! - p.startYear!)
                      ) || 0} سنة
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>أقصر فترة حكم:</span>
                    <span className="font-bold">
                      {Math.min(
                        ...(patriarchs || [])
                          .filter(p => p.startYear && p.endYear)
                          .map(p => p.endYear! - p.startYear!)
                      ) || 0} سنة
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-amiri">أهم العصور</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {eraDistribution
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 5)
                      .map((era) => (
                        <div key={era.era} className="flex justify-between items-center">
                          <span className="text-sm">{era.era}</span>
                          <span className="font-bold text-blue-600">{era.count}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Charts */}
          <TabsContent value="charts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold font-amiri">الرسومات البيانية التفصيلية</h2>
              <Button
                onClick={() => setLocation("/charts")}
                variant="outline"
              >
                <i className="fas fa-external-link-alt ml-2"></i>
                عرض في صفحة منفصلة
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* توزيع البطاركة حسب العصور */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-amiri text-lg">توزيع البطاركة حسب العصور</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={eraDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="era" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          fontSize={10}
                        />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* محاربو البدع */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-amiri text-lg">محاربو البدع</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={heresyFightersData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ category, count }) => `${category}: ${count}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          <Cell fill="#ef4444" />
                          <Cell fill="#94a3b8" />
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* التطور التاريخي */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-amiri text-lg">التطور التاريخي حسب القرون</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={centuryChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="century" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* أكثر البدع شيوعاً */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-amiri text-lg">أكثر البدع شيوعاً</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topHeresiesData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis 
                          dataKey="heresy" 
                          type="category" 
                          width={100}
                          fontSize={10}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold font-amiri">الإعدادات</h2>
            <GeminiSettings />
          </TabsContent>
        </Tabs>

        {deleteMutation.isError && (
          <Alert className="mt-4">
            <AlertDescription>
              حدث خطأ أثناء حذف البطريرك. يرجى المحاولة مرة أخرى.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
