import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import PatriarchTimeline from "@/components/patriarch-timeline";
import PatriarchCard from "@/components/patriarch-card";
import AskPatriarchChatbot from "@/components/ask-patriarch-chatbot";
import SmartSummaryModal from "@/components/smart-summary-modal";
import { useAuth } from "@/hooks/useAuth";
import HomeCharts from "@/components/home-charts";
import Loading from "@/components/ui/loading";
import type { Patriarch } from "@shared/schema";
import { getArabicHeresyName } from "@shared/patriarch-names";
import { MessageCircle, Crown } from "lucide-react";

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
  const [viewMode, setViewMode] = useState<"cards" | "timeline" | "charts">("cards");
  const [showChatbot, setShowChatbot] = useState(false);
  const [showSmartSummary, setShowSmartSummary] = useState(false);



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
                <div className="flex justify-center gap-4 mt-6 flex-wrap">
                  <Button
                    variant={viewMode === "cards" ? "default" : "outline"}
                    onClick={() => setViewMode("cards")}
                    className={`${viewMode === "cards" ? "bg-blue-600 text-white" : "bg-white bg-opacity-20 text-blue-600 border-blue-600"} px-6 py-3`}
                  >
                    <i className="fas fa-th-large ml-2"></i>
                    البطاقات
                  </Button>

                  <Button
                    variant={viewMode === "timeline" ? "default" : "outline"}
                    onClick={() => setViewMode("timeline")}
                    className={`${viewMode === "timeline" ? "bg-purple-600 text-white" : "bg-white bg-opacity-20 text-purple-600 border-purple-600"} px-6 py-3`}
                  >
                    <i className="fas fa-history ml-2"></i>
                    الخط الزمني
                  </Button>

                  <Button
                    variant={viewMode === "charts" ? "default" : "outline"}
                    onClick={() => setViewMode("charts")}
                    className={`${viewMode === "charts" ? "bg-orange-600 text-white" : "bg-white bg-opacity-20 text-orange-600 border-orange-600"} px-6 py-3`}
                  >
                    <i className="fas fa-chart-bar ml-2"></i>
                    الإحصائيات والتحليلات
                  </Button>
                </div>

                {/* Smart Summary Button - Prominent Display */}
                <div className="mt-8 text-center">
                  <Button
                    onClick={() => setShowSmartSummary(true)}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-2xl border-2 border-green-400 hover:border-green-300 transform hover:scale-110 transition-all duration-300 px-12 py-6 text-xl font-bold rounded-2xl animate-pulse hover:animate-none"
                  >
                    <i className="fas fa-brain ml-3 text-2xl"></i>
                    🤖 الملخص الذكي بالذكاء الاصطناعي
                  </Button>
                  <p className="text-green-200 text-sm mt-2 font-medium">
                    احصل على ملخص ذكي ومفصل عن أي بطريرك باستخدام تقنية Gemini AI
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-12">
        {/* Stats Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{filteredPatriarchs.length}</p>
                <p className="text-sm text-gray-600">بطريرك</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {filteredPatriarchs.filter(p => p.heresiesFought.length > 0).length}
                </p>
                <p className="text-sm text-gray-600">محارب بدع</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {new Set(filteredPatriarchs.map(p => p.era)).size}
                </p>
                <p className="text-sm text-gray-600">عصر تاريخي</p>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button
                variant={viewMode === "cards" ? "default" : "outline"}
                onClick={() => setViewMode("cards")}
                className={`${viewMode === "cards" ? "bg-blue-600 text-white" : "bg-white bg-opacity-20 text-blue-600 border-blue-600"} px-6 py-3`}
              >
                <i className="fas fa-th-large ml-2"></i>
                البطاقات
              </Button>

              <Button
                variant={viewMode === "timeline" ? "default" : "outline"}
                onClick={() => setViewMode("timeline")}
                className={`${viewMode === "timeline" ? "bg-purple-600 text-white" : "bg-white bg-opacity-20 text-purple-600 border-purple-600"} px-6 py-3`}
              >
                <i className="fas fa-history ml-2"></i>
                الخط الزمني
              </Button>

              <Button
                variant="outline"
                onClick={() => setViewMode("charts")}
                className={`${
                  viewMode === "charts"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600 hover:bg-blue-50"
                } border-blue-600 shadow-md transform hover:scale-105 transition-all duration-300`}
              >
                <i className="fas fa-chart-bar w-4 h-4 ml-2"></i>
                الإحصائيات والتحليلات
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowSmartSummary(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-600 hover:from-purple-700 hover:to-indigo-700 shadow-md transform hover:scale-105 transition-all duration-300"
              >
                <i className="fas fa-brain w-4 h-4 ml-2"></i>
                الملخص الذكي
              </Button>



              {isAuthenticated && (
                <Button
                  onClick={() => setLocation("/admin")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-6 py-3"
                >
                  <i className="fas fa-cog ml-2"></i>
                  لوحة الإدارة
                </Button>
              )}

              {!isAuthenticated && (
                <Button
                  onClick={() => setLocation("/login")}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3"
                >
                  <i className="fas fa-sign-in-alt ml-2"></i>
                  دخول الإدارة
                </Button>
              )}


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

      {/* Chatbot */}
      {showChatbot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] relative">
            <Button
              onClick={() => setShowChatbot(false)}
              className="absolute top-4 left-4 z-10 rounded-full w-8 h-8 p-0"
              variant="ghost"
            >
              ✕
            </Button>
            <AskPatriarchChatbot />
          </div>
        </div>
      )}

      {/* Smart Summary Modal */}
      <SmartSummaryModal 
        isOpen={showSmartSummary} 
        onClose={() => setShowSmartSummary(false)} 
      />


    </div>
  );
}