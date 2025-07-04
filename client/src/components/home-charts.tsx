import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from "recharts";
import type { Patriarch } from "@shared/schema";

interface HomeChartsProps {
  patriarchs: Patriarch[];
}

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#8B5A2B', '#DC2626', '#059669'];

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

export default function HomeCharts({ patriarchs }: HomeChartsProps) {
  
  const chartsData = useMemo(() => {
    // توزيع البطاركة حسب العصور الرئيسية
    const eraDistribution = patriarchs.reduce((acc: Record<string, number>, patriarch) => {
      const era = eraLabels[patriarch.era] || patriarch.era;
      acc[era] = (acc[era] || 0) + 1;
      return acc;
    }, {});

    const topEras = Object.entries(eraDistribution)
      .map(([era, count], index) => ({
        era: era.length > 15 ? era.substring(0, 15) + "..." : era,
        fullEra: era,
        count,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // توزيع عبر القرون (أهم 6 قرون)
    const centuryDistribution = patriarchs.reduce((acc: Record<number, number>, patriarch) => {
      const century = Math.floor(patriarch.startYear / 100) + 1;
      acc[century] = (acc[century] || 0) + 1;
      return acc;
    }, {});

    const topCenturies = Object.entries(centuryDistribution)
      .map(([century, count]) => ({
        century: `القرن ${century}`,
        count,
        year: parseInt(century) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // أطول فترات الخدمة (أعلى 5)
    const longestService = patriarchs
      .filter(p => p.endYear)
      .map(p => {
        const arabicName = p.arabicName || p.name;
        return {
          name: arabicName.length > 15 ? arabicName.substring(0, 15) + "..." : arabicName,
          fullName: arabicName,
          duration: p.endYear! - p.startYear,
          era: eraLabels[p.era] || p.era
        };
      })
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    // الإحصائيات الرئيسية
    const stats = {
      total: patriarchs.length,
      averageService: Math.round(
        patriarchs
          .filter(p => p.endYear)
          .reduce((sum, p) => sum + (p.endYear! - p.startYear), 0) /
        patriarchs.filter(p => p.endYear).length
      ),
      defendersCount: patriarchs.filter(p => {
        let heresies: string[] = [];
        try {
          heresies = Array.isArray(p.heresiesFought) 
            ? p.heresiesFought 
            : JSON.parse(p.heresiesFought || '[]');
        } catch (e) {
          heresies = [];
        }
        return heresies.length > 0;
      }).length,
      modernEra: patriarchs.filter(p => 
        p.era.includes("الحديث") || p.era.includes("المعاصر") || p.era.includes("التحديث")
      ).length
    };

    return {
      topEras,
      topCenturies,
      longestService,
      stats
    };
  }, [patriarchs]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-gray-800 font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-16" dir="rtl">
      <div className="container mx-auto px-4">
        {/* عنوان القسم */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold font-amiri text-gray-800 mb-4">
            إحصائيات وتحليلات البطاركة
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            نظرة شاملة على التوزيع التاريخي والإحصائيات المهمة لبطاركة الكنيسة القبطية الأرثوذكسية
          </p>
        </div>

        {/* إحصائيات رئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-users text-3xl"></i>
              </div>
              <h3 className="text-3xl font-bold mb-2">{chartsData.stats.total}</h3>
              <p className="text-blue-100">إجمالي البطاركة</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-clock text-3xl"></i>
              </div>
              <h3 className="text-3xl font-bold mb-2">{chartsData.stats.averageService}</h3>
              <p className="text-green-100">متوسط مدة الخدمة</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shield-alt text-3xl"></i>
              </div>
              <h3 className="text-3xl font-bold mb-2">{chartsData.stats.defendersCount}</h3>
              <p className="text-purple-100">محاربو البدع</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-calendar-alt text-3xl"></i>
              </div>
              <h3 className="text-3xl font-bold mb-2">{chartsData.stats.modernEra}</h3>
              <p className="text-orange-100">العصر الحديث</p>
            </CardContent>
          </Card>
        </div>

        {/* الرسوم البيانية الرئيسية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* توزيع حسب العصور - رسم بياني عمودي محسن */}
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardTitle className="text-center font-amiri text-xl">
                <i className="fas fa-chart-bar mr-2"></i>
                التوزيع الإجمالي للبطاركة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={chartsData.topEras}
                  margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="era"
                    angle={-35}
                    textAnchor="end"
                    height={100}
                    fontSize={10}
                    interval={0}
                    tick={false}
                  />
                  <YAxis 
                    fontSize={12}
                    tick={{ fill: '#666' }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} بطريرك`, 'العدد']}
                    labelFormatter={(label) => chartsData.topEras.find(d => d.era === label)?.fullEra || label}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.98)',
                      border: '2px solid #3b82f6',
                      borderRadius: '12px',
                      fontSize: '16px',
                      direction: 'rtl',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                      fontWeight: 'bold'
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {chartsData.topEras.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              
              {/* قائمة العصور خارج الرسم البياني */}
              <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-3">
                {chartsData.topEras.map((item, index) => (
                  <div key={index} className="flex items-center space-x-reverse space-x-2 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border hover:shadow-md transition-all duration-200">
                    <div 
                      className="w-5 h-5 rounded-full shadow-sm"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-800">{item.fullEra}</span>
                      <div className="text-xs text-gray-600 font-medium">{item.count} بطريرك</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* توزيع حسب القرون - رسم منطقي محسن */}
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
              <CardTitle className="text-center font-amiri text-xl">
                <i className="fas fa-chart-line mr-2"></i>
                توزيع البطاركة عبر القرون
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartsData.topCenturies} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorCenturyHome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="century" 
                    fontSize={12}
                    tick={{ fill: '#666' }}
                  />
                  <YAxis 
                    fontSize={12}
                    tick={{ fill: '#666' }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} بطريرك`, 'العدد']}
                    labelFormatter={(label) => `القرن ${label}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '2px solid #10B981',
                      borderRadius: '10px',
                      fontSize: '14px',
                      direction: 'rtl'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCenturyHome)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* أطول فترات الخدمة */}
        <Card className="shadow-xl mb-8">
          <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            <CardTitle className="text-center font-amiri text-xl">
              <i className="fas fa-crown mr-2"></i>
              أطول فترات الخدمة للبطاركة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {chartsData.longestService.map((patriarch, index) => (
                <div key={`${patriarch.fullName}-${index}`} className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border-2 border-gray-100 hover:border-yellow-300 transition-all duration-300">
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3 ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm" title={patriarch.fullName}>
                      {patriarch.name}
                    </h4>
                    <Badge variant="secondary" className="mb-2">
                      {patriarch.duration} سنة
                    </Badge>
                    <p className="text-xs text-gray-600">{patriarch.era}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* تحليل البدع المحاربة */}
        <Card className="shadow-xl mb-8">
          <CardHeader className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
            <CardTitle className="text-center font-amiri text-xl">
              <i className="fas fa-shield-alt mr-2"></i>
              تحليل البدع المحاربة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* أكثر البدع محاربة */}
              <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border-2 border-red-100">
                <h4 className="font-bold text-red-800 mb-3 flex items-center">
                  <i className="fas fa-fire ml-2"></i>
                  أكثر البدع محاربة
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">الآريوسية</span>
                    <Badge variant="destructive" className="text-xs">عالية</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">النسطورية</span>
                    <Badge variant="destructive" className="text-xs">عالية</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">الخلقيدونية</span>
                    <Badge variant="destructive" className="text-xs">عالية</Badge>
                  </div>
                </div>
              </div>

              {/* البدع حسب العصور */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-100">
                <h4 className="font-bold text-blue-800 mb-3 flex items-center">
                  <i className="fas fa-clock ml-2"></i>
                  البدع حسب العصور
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">العصر الذهبي</span>
                    <Badge variant="secondary" className="text-xs">5 بدع</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">العصر الوسيط</span>
                    <Badge variant="secondary" className="text-xs">3 بدع</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">العصر الحديث</span>
                    <Badge variant="secondary" className="text-xs">4 بدع</Badge>
                  </div>
                </div>
              </div>

              {/* إحصائيات دفاعية */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-100">
                <h4 className="font-bold text-green-800 mb-3 flex items-center">
                  <i className="fas fa-shield ml-2"></i>
                  إحصائيات الدفاع
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">بطاركة محاربون</span>
                    <Badge variant="outline" className="text-xs text-green-700 border-green-700">{chartsData.stats.defendersCount}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">نسبة المحاربين</span>
                    <Badge variant="outline" className="text-xs text-green-700 border-green-700">
                      {Math.round((chartsData.stats.defendersCount / chartsData.stats.total) * 100)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* رسم بياني للخط الزمني المبسط */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardTitle className="text-center font-amiri text-xl">
              <i className="fas fa-chart-line mr-2"></i>
              الخط الزمني لتطور الكنيسة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartsData.topCenturies}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="century" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* دعوة للعمل */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 font-amiri">
              اكتشف المزيد من التفاصيل
            </h3>
            <p className="text-gray-600 mb-6">
              تعرف على تاريخ كل بطريرك وإنجازاته ودوره في تطوير الكنيسة القبطية عبر العصور
            </p>
            <div className="flex justify-center space-x-reverse space-x-4">
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                {chartsData.stats.total} بطريرك
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-600">
                {Math.max(...chartsData.longestService.map(p => p.duration))} سنة أطول خدمة
              </Badge>
              <Badge variant="outline" className="text-purple-600 border-purple-600">
                1950+ سنة من التاريخ
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}