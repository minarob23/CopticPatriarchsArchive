import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import PatriarchTimeline from "@/components/patriarch-timeline";
import PatriarchCard from "@/components/patriarch-card";
import AskPatriarchChatbot from "@/components/ask-patriarch-chatbot";
import Loading from "@/components/ui/loading";
import type { Patriarch } from "@shared/schema";
import { getArabicHeresyName } from "@shared/patriarch-names";
import { MessageCircle, Crown } from "lucide-react";

const eraLabels: Record<string, string> = {
  apostolic: "العصر الرسولي",
  golden: "العصر الذهبي", 
  councils: "عصر المجامع",
  persecution: "عصر الاضطهاد",
  modern: "العصر الحديث",
};

export default function Landing() {
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
      (patriarchs || []).flatMap(p => p.heresiesFought)
    )
  ).sort();

  // Filter patriarchs based on search criteria
  const filteredPatriarchs = (patriarchs || []).filter(patriarch => {
    const matchesSearch = !searchQuery || 
      patriarch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patriarch.biography?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEra = selectedEra === "all" || patriarch.era === selectedEra;

    const matchesHeresies = selectedHeresies.length === 0 || 
      selectedHeresies.some(heresy => patriarch.heresiesFought.includes(heresy));

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

            {isAuthenticated && (
              <Button
                onClick={() => setLocation("/admin")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              >
                <i className="fas fa-cog ml-2"></i>
                لوحة الإدارة
              </Button>
            )}

            {!isAuthenticated && (
              <Button
                onClick={() => setLocation("/login")}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <i className="fas fa-sign-in-alt ml-2"></i>
                دخول الإدارة
              </Button>
            )}
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

      {/* Floating Ask Patriarch Button */}
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            size="lg"
            className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-2xl rounded-full p-4 h-16 w-16 md:w-auto md:h-auto md:px-6 md:py-3 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6" />
              <span className="hidden md:inline font-bold">💬 اسأل البطريرك</span>
            </div>
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-2xl p-0 overflow-hidden" side="right">
          <SheetHeader className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6">
            <SheetTitle className="text-right text-xl font-bold flex items-center justify-center gap-3">
              <Crown className="h-6 w-6" />
              💬 اسأل البطريرك - الخبير الذكي
              <Crown className="h-6 w-6" />
            </SheetTitle>
          </SheetHeader>
          <div className="p-6 h-full overflow-auto">
            <AskPatriarchChatbot />
          </div>
        </SheetContent>
      </Sheet>

      {/* Footer */}
      <footer className="bg-blue-600 text-white py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-reverse space-x-4 mb-4">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                  <i className="fas fa-cross text-blue-600 text-lg"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold font-amiri">بطاركة الكنيسة القبطية</h3>
                  <p className="text-blue-200 text-sm">الأرثوذكسية</p>
                </div>
              </div>
              <p className="text-blue-200 leading-relaxed">
                قاعدة بيانات تاريخية شاملة للبطاركة الذين حافظوا على الإيمان الأرثوذكسي عبر التاريخ.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 font-amiri">روابط مهمة</h4>
              <ul className="space-y-2">
                <li><button onClick={() => setLocation("/about")} className="text-blue-200 hover:text-white transition-colors duration-200">عن الموقع</button></li>
                <li><button onClick={() => setLocation("/church-history")} className="text-blue-200 hover:text-white transition-colors duration-200">تاريخ الكنيسة</button></li>
                <li><button onClick={() => setLocation("/references")} className="text-blue-200 hover:text-white transition-colors duration-200">المراجع</button></li>
                <li><button onClick={() => setLocation("/contact")} className="text-blue-200 hover:text-white transition-colors duration-200">اتصل بنا</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 font-amiri">معلومات تقنية</h4>
              <ul className="space-y-2 text-blue-200">
                <li><i className="fas fa-database ml-2"></i>قاعدة بيانات PostgreSQL</li>
                <li><i className="fas fa-shield-alt ml-2"></i>حماية متقدمة للبيانات</li>
                <li><i className="fas fa-mobile-alt ml-2"></i>متوافق مع جميع الأجهزة</li>
                <li><i className="fas fa-search ml-2"></i>بحث متقدم وفلترة</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-400 pt-8 mt-8 text-center">
            <p className="text-blue-200">
              © 2025 بطاركة الكنيسة القبطية الأرثوذكسية. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}