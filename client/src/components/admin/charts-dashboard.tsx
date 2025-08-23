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
        {/* توزيع البطاركة حسب العصور - رسم بياني عمودي */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="text-center font-amiri text-lg">توزيع البطاركة عبر العصور التاريخية</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart
                data={chartsData.eraChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="era"
                  angle={-35}
                  textAnchor="end"
                  height={120}
                  fontSize={11}
                  interval={0}
                  tick={{ fill: '#333', fontSize: 11, fontWeight: 'bold' }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: '#666' }}
                />
                <Tooltip 
                  formatter={(value) => [`${value} بطريرك`, 'العدد']}
                  labelFormatter={(label) => chartsData.eraChartData.find(d => d.era === label)?.fullEra || label}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: '2px solid #3b82f6',
                    borderRadius: '12px',
                    fontSize: '14px',
                    direction: 'rtl',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                    fontWeight: 'bold'
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartsData.eraChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            {/* قائمة العصور خارج الرسم البياني */}
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-3">
              {chartsData.eraChartData.map((item, index) => (
                <div key={index} className="flex items-center space-x-reverse space-x-2 p-2 bg-gray-50 rounded-lg">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-gray-800">{item.fullEra}</span>
                    <div className="text-xs text-gray-600">{item.count} بطريرك</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* توزيع البطاركة عبر القرون - رسم بياني منطقي */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
            <CardTitle className="text-center font-amiri text-lg">توزيع البطاركة عبر القرون</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={450}>
              <AreaChart data={chartsData.centuryChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorCentury" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#colorCentury)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* رسوم بيانية إضافية */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* مدة الخدمة للبطاركة - رسم بياني عمودي محسن */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
            <CardTitle className="text-center font-amiri text-lg">أطول فترات الخدمة للبطاركة</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={chartsData.serviceData.slice(0, 8)} 
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name"
                  fontSize={11}
                  tick={false}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: '#666' }}
                />
                <Tooltip 
                  formatter={(value, name, props) => [`${value} سنة`, 'مدة الخدمة']}
                  labelFormatter={(label) => `البابا ${label}`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '2px solid #f97316',
                    borderRadius: '12px',
                    fontSize: '14px',
                    direction: 'rtl',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey="duration" 
                  radius={[6, 6, 0, 0]}
                >
                  {chartsData.serviceData.slice(0, 8).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        index === 0 ? '#f59e0b' : 
                        index === 1 ? '#ef4444' : 
                        index === 2 ? '#ec4899' : 
                        '#f97316'
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            {/* قائمة البطاركة خارج الرسم البياني */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              {chartsData.serviceData.slice(0, 8).map((patriarch, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border">
                  <div className="flex items-center space-x-reverse space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">{patriarch.fullName}</h4>
                      <p className="text-xs text-gray-600">{patriarch.era}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <Badge variant="secondary" className="font-bold">{patriarch.duration} سنة</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* البدع الأكثر محاربة - رسم بياني بسيط */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
            <CardTitle className="text-center font-amiri text-lg">البدع الأكثر محاربة</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart 
                data={chartsData.heresiesChartData.slice(0, 6)} 
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="heresy"
                  fontSize={11}
                  tick={false}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: '#666' }}
                />
                <Tooltip 
                  formatter={(value) => [`${value} بطريرك`, 'عدد المحاربين']}
                  labelFormatter={(label) => chartsData.heresiesChartData.find(d => d.heresy === label)?.fullHeresy || label}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '2px solid #dc2626',
                    borderRadius: '12px',
                    fontSize: '14px',
                    direction: 'rtl',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartsData.heresiesChartData.slice(0, 6).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        index === 0 ? '#dc2626' : 
                        index === 1 ? '#ea580c' : 
                        index === 2 ? '#d97706' : 
                        index === 3 ? '#ca8a04' : 
                        index === 4 ? '#65a30d' : 
                        '#6366f1'
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            {/* قائمة البدع خارج الرسم البياني */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {chartsData.heresiesChartData.slice(0, 6).map((heresy, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border">
                  <div className="flex items-center space-x-reverse space-x-3">
                    <div 
                      className="w-6 h-6 rounded-full"
                      style={{ 
                        backgroundColor: index === 0 ? '#dc2626' : 
                          index === 1 ? '#ea580c' : 
                          index === 2 ? '#d97706' : 
                          index === 3 ? '#ca8a04' : 
                          index === 4 ? '#65a30d' : '#6366f1'
                      }}
                    ></div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">{heresy.fullHeresy}</h4>
                    </div>
                  </div>
                  <div>
                    <Badge variant="secondary" className="font-bold">{heresy.count}</Badge>
                  </div>
                </div>
              ))}
            </div>
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