import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import PatriarchTimeline from "@/components/patriarch-timeline";
import PatriarchCard from "@/components/patriarch-card";
import Loading from "@/components/ui/loading";
import type { Patriarch } from "@shared/schema";
import { getArabicHeresyName } from "@shared/patriarch-names";

const eraLabels: Record<string, string> = {
  // English keys (for backwards compatibility)
  apostolic: "العصر الرسولي",
  golden: "العصر الذهبي", 
  councils: "عصر المجامع",
  persecution: "عصر الاضطهاد",
  modern: "العصر الحديث",
  
  // Arabic keys (actual database values)
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

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedEra, setSelectedEra] = useState("all");
  const [selectedHeresies, setSelectedHeresies] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"cards" | "timeline">("cards");

  const { data: patriarchs, isLoading } = useQuery<Patriarch[]>({
    queryKey: ["/api/patriarchs", { search: searchQuery, era: selectedEra !== "all" ? selectedEra : undefined }],
    retry: false,
  });

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  // Extract unique heresies for filtering
  const allHeresies = Array.from(
    new Set(
      (patriarchs || []).flatMap(p => {
        const heresies = Array.isArray(p.heresiesFought) 
          ? p.heresiesFought 
          : JSON.parse(p.heresiesFought || '[]');
        return heresies;
      })
    )
  ).sort();

  // Filter patriarchs based on search criteria
  const filteredPatriarchs = (patriarchs || []).filter(patriarch => {
    const matchesSearch = !searchQuery || 
      patriarch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patriarch.biography?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEra = selectedEra === "all" || patriarch.era === selectedEra;

    const matchesHeresies = selectedHeresies.length === 0 || 
      selectedHeresies.some(heresy => {
        let heresies = [];
        try {
          heresies = Array.isArray(patriarch.heresiesFought) 
            ? patriarch.heresiesFought 
            : JSON.parse(patriarch.heresiesFought || '[]');
        } catch (e) {
          heresies = [];
        }
        return heresies.includes(heresy);
      });

    return matchesSearch && matchesEra && matchesHeresies;
  });

  const handleHeresyToggle = (heresy: string) => {
    setSelectedHeresies(prev => 
      prev.includes(heresy) 
        ? prev.filter(h => h !== heresy)
        : [...prev, heresy]
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir="rtl">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white bg-opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-yellow-300 bg-opacity-20 rounded-full blur-2xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <i className="fas fa-church text-4xl"></i>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold font-amiri mb-4 bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent">
                بطاركة الكنيسة القبطية الأرثوذكسية
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-6 leading-relaxed">
                رحلة عبر التاريخ مع أعظم رجال الإيمان في المسيحية الشرقية
              </p>
              <p className="text-lg text-blue-200 max-w-3xl mx-auto">
                اكتشف تاريخ وحياة بطاركة الكنيسة القبطية الأرثوذكسية عبر العصور، 
                من العصر الرسولي حتى يومنا هذا
              </p>
            </div>

            {/* Search Section */}
            <Card className="bg-white bg-opacity-10 backdrop-blur-md border-white border-opacity-20 shadow-2xl">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Main Search */}
                  <div className="md:col-span-2">
                    <div className="relative">
                      <i className="fas fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      <Input
                        type="text"
                        placeholder="ابحث عن بطريرك بالاسم أو السيرة الذاتية..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-4 pr-12 py-4 text-lg bg-white bg-opacity-90 border-none rounded-xl shadow-lg focus:shadow-xl transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Search Button */}
                  <div>
                    <Button
                      onClick={handleSearch}
                      className="w-full py-4 text-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin ml-2"></i>
                          جاري البحث...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-search ml-2"></i>
                          بحث
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Era Filter */}
                  <div>
                    <Select value={selectedEra} onValueChange={setSelectedEra}>
                      <SelectTrigger className="py-4 text-lg bg-white bg-opacity-90 border-none rounded-xl shadow-lg">
                        <SelectValue placeholder="اختر العصر" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع العصور</SelectItem>
                        {Object.entries(eraLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Advanced Filters */}
                {allHeresies.length > 0 && (
                  <div className="mt-6">
                    <p className="text-white text-sm font-medium mb-3">
                      <i className="fas fa-filter ml-2"></i>
                      تصفية حسب البدع المحاربة:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {allHeresies.slice(0, 6).map(heresy => (
                        <Badge
                          key={heresy}
                          variant={selectedHeresies.includes(heresy) ? "default" : "outline"}
                          className={`cursor-pointer transition-all duration-200 ${
                            selectedHeresies.includes(heresy) 
                              ? "bg-yellow-400 text-black hover:bg-yellow-500" 
                              : "bg-white bg-opacity-20 text-white hover:bg-white hover:bg-opacity-30"
                          }`}
                          onClick={() => handleHeresyToggle(heresy)}
                        >
                          {getArabicHeresyName(heresy)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* View Mode Toggle */}
                <div className="flex justify-center gap-4 mt-6">
                  <Button
                    variant={viewMode === "cards" ? "default" : "outline"}
                    onClick={() => setViewMode("cards")}
                    className={`${viewMode === "cards" ? "bg-yellow-400 text-black" : "bg-white bg-opacity-20 text-white border-white border-opacity-30"} hover:bg-yellow-500 transition-all duration-200`}
                  >
                    <i className="fas fa-th-large ml-2"></i>
                    عرض بطاقات
                  </Button>
                  <Button
                    variant={viewMode === "timeline" ? "default" : "outline"}
                    onClick={() => setViewMode("timeline")}
                    className={`${viewMode === "timeline" ? "bg-yellow-400 text-black" : "bg-white bg-opacity-20 text-white border-white border-opacity-30"} hover:bg-yellow-500 transition-all duration-200`}
                  >
                    <i className="fas fa-clock ml-2"></i>
                    الخط الزمني
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-12">
        {/* Stats Bar - Enhanced Beautiful Design */}
        <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl shadow-2xl p-8 mb-12 border border-white/20 backdrop-blur-sm overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            {/* Header Section */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold font-amiri text-gray-800 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                نظرة سريعة على الإحصائيات
              </h2>
              <p className="text-gray-600">ملخص شامل للبيانات المتاحة</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* البطاركة */}
              <Card className="group hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium mb-1">إجمالي</p>
                      <p className="text-4xl font-bold mb-1">{filteredPatriarchs.length}</p>
                      <p className="text-blue-200 text-lg font-semibold">بطريرك</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                      <i className="fas fa-users text-2xl"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* محاربو البدع */}
              <Card className="group hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium mb-1">المدافعون</p>
                      <p className="text-4xl font-bold mb-1">
                        {filteredPatriarchs.filter(p => {
                          let heresies = [];
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
                      <p className="text-purple-200 text-lg font-semibold">محارب بدع</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                      <i className="fas fa-shield-alt text-2xl"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* العصور التاريخية */}
              <Card className="group hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl border-0 bg-gradient-to-br from-green-500 to-green-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium mb-1">التنوع</p>
                      <p className="text-4xl font-bold mb-1">
                        {new Set(filteredPatriarchs.map(p => p.era)).size}
                      </p>
                      <p className="text-green-200 text-lg font-semibold">عصر تاريخي</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                      <i className="fas fa-history text-2xl"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {isAuthenticated && (
                <Button
                  onClick={() => setLocation("/admin")}
                  className="group bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 font-semibold"
                >
                  <div className="flex items-center space-x-reverse space-x-2">
                    <i className="fas fa-cog group-hover:rotate-180 transition-transform duration-500"></i>
                    <span>لوحة الإدارة</span>
                  </div>
                </Button>
              )}

              {!isAuthenticated && (
                <Button
                  onClick={() => setLocation("/login")}
                  className="group bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 font-semibold"
                >
                  <div className="flex items-center space-x-reverse space-x-2">
                    <i className="fas fa-sign-in-alt group-hover:translate-x-1 transition-transform duration-300"></i>
                    <span>دخول الإدارة</span>
                  </div>
                </Button>
              )}

              {/* Additional Info Button */}
              <Button
                variant="outline"
                className="group border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-700 px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm"
              >
                <div className="flex items-center space-x-reverse space-x-2">
                  <i className="fas fa-info-circle group-hover:scale-110 transition-transform duration-300"></i>
                  <span>المزيد من التفاصيل</span>
                </div>
              </Button>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-200/50">
              <div className="text-center group hover:scale-105 transition-transform duration-200">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <i className="fas fa-crown text-white"></i>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.max(...filteredPatriarchs.filter(p => p.endYear).map(p => p.endYear! - p.startYear), 0)}
                </p>
                <p className="text-sm text-gray-600">أطول خدمة (سنة)</p>
              </div>
              
              <div className="text-center group hover:scale-105 transition-transform duration-200">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <i className="fas fa-calendar-alt text-white"></i>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.round(
                    filteredPatriarchs
                      .filter(p => p.endYear)
                      .reduce((sum, p) => sum + (p.endYear! - p.startYear), 0) /
                    (filteredPatriarchs.filter(p => p.endYear).length || 1)
                  )}
                </p>
                <p className="text-sm text-gray-600">متوسط الخدمة</p>
              </div>

              <div className="text-center group hover:scale-105 transition-transform duration-200">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <i className="fas fa-star text-white"></i>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {filteredPatriarchs.filter(p => 
                    p.era.includes("الحديث") || p.era.includes("المعاصر") || p.era.includes("التحديث")
                  ).length}
                </p>
                <p className="text-sm text-gray-600">العصر الحديث</p>
              </div>

              <div className="text-center group hover:scale-105 transition-transform duration-200">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <i className="fas fa-book text-white"></i>
                </div>
                <p className="text-2xl font-bold text-gray-800">1900+</p>
                <p className="text-sm text-gray-600">سنة تاريخ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Display */}
        {viewMode === "timeline" ? (
          <PatriarchTimeline patriarchs={filteredPatriarchs} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredPatriarchs.map((patriarch) => (
              <PatriarchCard key={patriarch.id} patriarch={patriarch} />
            ))}
          </div>
        )}

        {filteredPatriarchs.length === 0 && (
          <Card className="text-center py-16">
            <CardContent>
              <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد نتائج</h3>
              <p className="text-gray-500">جرب تغيير معايير البحث أو المرشحات</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}