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
  LineChart,
  Line,
  Area,
  AreaChart,
  ScatterChart,
  Scatter,

  Legend
} from "recharts";
import type { Patriarch } from "@shared/schema";

interface ChartsDashboardProps {
  patriarchs: Patriarch[];
}

const COLORS = [
  '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', 
  '#EC4899', '#14B8A6', '#F97316', '#8B5CF6', '#06B6D4',
  '#84CC16', '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6'
];

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

export default function ChartsDashboard({ patriarchs }: ChartsDashboardProps) {
  
  const chartsData = useMemo(() => {
    // توزيع البطاركة حسب العصور
    const eraDistribution = patriarchs.reduce((acc: Record<string, number>, patriarch) => {
      const era = eraLabels[patriarch.era] || patriarch.era;
      acc[era] = (acc[era] || 0) + 1;
      return acc;
    }, {});

    const eraChartData = Object.entries(eraDistribution).map(([era, count], index) => ({
      era: era.length > 15 ? era.substring(0, 15) + "..." : era,
      fullEra: era,
      count,
      color: COLORS[index % COLORS.length]
    })).sort((a, b) => b.count - a.count);

    // توزيع البطاركة عبر القرون
    const centuryDistribution = patriarchs.reduce((acc: Record<number, number>, patriarch) => {
      const century = Math.floor(patriarch.startYear / 100) + 1;
      acc[century] = (acc[century] || 0) + 1;
      return acc;
    }, {});

    const centuryChartData = Object.entries(centuryDistribution)
      .map(([century, count]) => ({
        century: `القرن ${century}`,
        count,
        year: parseInt(century) * 100
      }))
      .sort((a, b) => a.year - b.year);

    // مدة الخدمة
    const serviceData = patriarchs
      .filter(p => p.endYear)
      .map(p => ({
        name: p.arabicName || p.name,
        fullName: p.arabicName || p.name,
        duration: p.endYear! - p.startYear,
        startYear: p.startYear,
        era: eraLabels[p.era] || p.era
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 15);

    // البدع المحاربة
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

    const heresiesChartData = Object.entries(heresiesCount)
      .map(([heresy, count], index) => ({
        heresy: heresy.length > 20 ? heresy.substring(0, 20) + "..." : heresy,
        fullHeresy: heresy,
        count,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // الخط الزمني للبطاركة
    const timelineData = patriarchs
      .sort((a, b) => a.startYear - b.startYear)
      .map(p => ({
        name: p.name,
        startYear: p.startYear,
        endYear: p.endYear || 2025,
        duration: (p.endYear || 2025) - p.startYear,
        era: eraLabels[p.era] || p.era,
        orderNumber: p.orderNumber
      }));

    // إحصائيات متقدمة
    const advancedStats = {
      averageService: Math.round(
        patriarchs
          .filter(p => p.endYear)
          .reduce((sum, p) => sum + (p.endYear! - p.startYear), 0) /
        patriarchs.filter(p => p.endYear).length
      ),
      longestService: Math.max(
        ...patriarchs
          .filter(p => p.endYear)
          .map(p => p.endYear! - p.startYear)
      ),
      shortestService: Math.min(
        ...patriarchs
          .filter(p => p.endYear)
          .map(p => p.endYear! - p.startYear)
      ),
      totalYearsOfService: patriarchs
        .filter(p => p.endYear)
        .reduce((sum, p) => sum + (p.endYear! - p.startYear), 0),
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
      }).length
    };

    return {
      eraChartData,
      centuryChartData,
      serviceData,
      heresiesChartData,
      timelineData,
      advancedStats
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
    <div className="space-y-8" dir="rtl">
      {/* إحصائيات متقدمة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">متوسط مدة الخدمة</p>
                <p className="text-3xl font-bold">{chartsData.advancedStats.averageService}</p>
                <p className="text-blue-200 text-xs">سنة</p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <i className="fas fa-clock text-2xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">أطول مدة خدمة</p>
                <p className="text-3xl font-bold">{chartsData.advancedStats.longestService}</p>
                <p className="text-green-200 text-xs">سنة</p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <i className="fas fa-crown text-2xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">محاربو البدع</p>
                <p className="text-3xl font-bold">{chartsData.advancedStats.defendersCount}</p>
                <p className="text-purple-200 text-xs">بطريرك</p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <i className="fas fa-shield-alt text-2xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">إجمالي سنوات الخدمة</p>
                <p className="text-3xl font-bold">{chartsData.advancedStats.totalYearsOfService}</p>
                <p className="text-orange-200 text-xs">سنة</p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <i className="fas fa-calendar-check text-2xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الرسوم البيانية الرئيسية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* توزيع البطاركة حسب العصور - رسم بياني دائري */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center font-amiri text-lg">توزيع البطاركة عبر العصور التاريخية</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartsData.eraChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ era, count, percent }) => `${era}: ${count} (${(percent * 100).toFixed(1)}%)`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {chartsData.eraChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [value, 'عدد البطاركة']}
                  labelFormatter={(label) => chartsData.eraChartData.find(d => d.era === label)?.fullEra || label}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* توزيع البطاركة عبر القرون - رسم بياني عمودي */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center font-amiri text-lg">توزيع البطاركة عبر القرون</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartsData.centuryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="century" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* رسوم بيانية إضافية */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* مدة الخدمة للبطاركة */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center font-amiri text-lg">أطول فترات الخدمة للبطاركة (رسم بياني)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartsData.serviceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={150}
                  fontSize={11}
                  interval={0}
                />
                <Tooltip 
                  formatter={(value, name, props) => [`${value} سنة`, 'مدة الخدمة']}
                  labelFormatter={(label) => `البابا ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    fontSize: '14px',
                    direction: 'rtl'
                  }}
                />
                <Bar dataKey="duration" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* البدع الأكثر محاربة */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center font-amiri text-lg">البدع الأكثر محاربة</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartsData.heresiesChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="heresy" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={11}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} بطريرك`, 'عدد المحاربين']}
                  labelFormatter={(label) => chartsData.heresiesChartData.find(d => d.heresy === label)?.fullHeresy || label}
                />
                <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* الخط الزمني للبطاركة */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center font-amiri text-lg">الخط الزمني لخدمة البطاركة عبر التاريخ</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={500}>
            <AreaChart data={chartsData.timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="startYear" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'duration') return [`${value} سنة`, 'مدة الخدمة'];
                  return [value, name];
                }}
                labelFormatter={(label) => `بداية الخدمة: ${label}م`}
              />
              <Area 
                type="monotone" 
                dataKey="duration" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* رسم بياني مبعثر للعلاقة بين سنة البداية ومدة الخدمة */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center font-amiri text-lg">العلاقة بين فترة الخدمة والزمن التاريخي</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={chartsData.serviceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="startYear" name="سنة البداية" />
              <YAxis dataKey="duration" name="مدة الخدمة" />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'duration') return [`${value} سنة`, 'مدة الخدمة'];
                  if (name === 'startYear') return [`${value}م`, 'سنة البداية'];
                  return [value, name];
                }}
                labelFormatter={() => ''}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-semibold">{data.name}</p>
                        <p>سنة البداية: {data.startYear}م</p>
                        <p>مدة الخدمة: {data.duration} سنة</p>
                        <p>العصر: {data.era}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter dataKey="duration" fill="#EC4899" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* جدول أطول فترات الخدمة */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center font-amiri text-lg">التصنيف التفصيلي لأطول الخدمات البطريركية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chartsData.serviceData.slice(0, 9).map((patriarch, index) => (
              <div key={`${patriarch.fullName}-${index}`} className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
                <div className="flex items-center space-x-reverse space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">{patriarch.name}</h4>
                    <p className="text-sm text-gray-600">{patriarch.era}</p>
                    <div className="flex items-center space-x-reverse space-x-2 mt-1">
                      <Badge variant="secondary">{patriarch.duration} سنة</Badge>
                      <span className="text-xs text-gray-500">{patriarch.startYear}م</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}