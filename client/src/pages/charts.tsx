
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts";
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

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
  '#ff0000', '#00ffff', '#ff00ff', '#ffff00', '#800080',
  '#008000', '#000080', '#800000', '#808000', '#008080',
  '#c0c0c0', '#808080', '#9999ff', '#993366', '#ffffcc'
];

export default function Charts() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: patriarchs, isLoading } = useQuery<Patriarch[]>({
    queryKey: ["/api/patriarchs"],
    retry: false,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (!patriarchs) {
    return <div>لا توجد بيانات</div>;
  }

  // إعداد البيانات للرسومات البيانية
  const eraData = Object.entries(
    patriarchs.reduce((acc: Record<string, number>, patriarch) => {
      acc[patriarch.era] = (acc[patriarch.era] || 0) + 1;
      return acc;
    }, {})
  )
  .sort(([,a], [,b]) => (b as number) - (a as number))
  .map(([era, count]) => ({
    era: eraLabels[era] || era,
    count: count as number,
    percentage: ((count as number) / patriarchs.length * 100).toFixed(1)
  }));

  // البيانات الزمنية
  const timelineData = patriarchs
    .filter(p => p.startYear)
    .sort((a, b) => a.startYear - b.startYear)
    .reduce((acc: Array<{century: string, count: number}>, patriarch) => {
      const century = Math.floor(patriarch.startYear / 100) + 1;
      const centuryStr = `القرن ${century}`;
      const existing = acc.find(item => item.century === centuryStr);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ century: centuryStr, count: 1 });
      }
      return acc;
    }, []);

  // بيانات محاربي البدع
  const heresyFightersData = [
    {
      category: "محاربو البدع",
      count: patriarchs.filter(p => {
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
      count: patriarchs.filter(p => {
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

  // أكثر البدع شيوعاً
  const heresiesCount = patriarchs.reduce((acc: Record<string, number>, patriarch) => {
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

  const topHeresiesData = Object.entries(heresiesCount)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([heresy, count]) => ({
      heresy,
      count: count as number
    }));

  const chartConfig = {
    count: {
      label: "العدد",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-reverse space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <i className="fas fa-chart-bar text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold font-amiri">الرسومات البيانية</h1>
                <p className="text-blue-100">تحليل شامل لبيانات بطاركة الكنيسة القبطية</p>
              </div>
            </div>
            <div className="flex items-center space-x-reverse space-x-4">
              {isAuthenticated && (
                <Button
                  onClick={() => setLocation("/admin")}
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  <i className="fas fa-arrow-right ml-2"></i>
                  العودة للإدارة
                </Button>
              )}
              <Button
                onClick={() => setLocation("/")}
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <i className="fas fa-home ml-2"></i>
                الصفحة الرئيسية
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* توزيع البطاركة حسب العصور - Bar Chart */}
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardTitle className="font-amiri text-xl">
                <i className="fas fa-history ml-2"></i>
                توزيع البطاركة حسب العصور
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ChartContainer config={chartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eraData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
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
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* توزيع دائري للعصور الرئيسية */}
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardTitle className="font-amiri text-xl">
                <i className="fas fa-chart-pie ml-2"></i>
                التوزيع النسبي للعصور
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ChartContainer config={chartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eraData.slice(0, 8)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ era, percentage }) => `${era}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {eraData.slice(0, 8).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* الخط الزمني للبطاركة */}
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardTitle className="font-amiri text-xl">
                <i className="fas fa-clock ml-2"></i>
                التطور التاريخي حسب القرون
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ChartContainer config={chartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="century" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="count" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* محاربو البدع */}
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardTitle className="font-amiri text-xl">
                <i className="fas fa-shield-alt ml-2"></i>
                محاربو البدع مقابل غير المحاربين
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
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
                      <Cell fill="#6b7280" />
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* أكثر البدع شيوعاً */}
          <Card className="shadow-xl lg:col-span-2">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
              <CardTitle className="font-amiri text-xl">
                <i className="fas fa-exclamation-triangle ml-2"></i>
                أكثر البدع التي حاربها البطاركة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ChartContainer config={chartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topHeresiesData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="heresy" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* إحصائيات سريعة */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold mb-2">{patriarchs.length}</div>
              <div className="text-blue-100">إجمالي البطاركة</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold mb-2">{Object.keys(eraLabels).length}</div>
              <div className="text-green-100">عدد العصور</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold mb-2">{heresyFightersData[0].count}</div>
              <div className="text-purple-100">محاربو البدع</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold mb-2">{Object.keys(heresiesCount).length}</div>
              <div className="text-amber-100">أنواع البدع</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
