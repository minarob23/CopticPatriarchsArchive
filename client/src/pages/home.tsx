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

  // Build query parameters properly
  const queryParams = new URLSearchParams();
  if (searchQuery && searchQuery.trim()) {
    queryParams.set('search', searchQuery.trim());
  }
  if (selectedEra !== 'all') {
    queryParams.set('era', selectedEra);
  }
  if (selectedHeresies.length > 0) {
    queryParams.set('heresies', selectedHeresies.join(','));
  }

  const { data: patriarchs = [], isLoading, refetch } = useQuery<Patriarch[]>({
    queryKey: ["/api/patriarchs", searchQuery, selectedEra, selectedHeresies],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery?.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (selectedEra && selectedEra !== 'all') {
        params.append('era', selectedEra);
      }
      if (selectedHeresies.length > 0) {
        params.append('heresies', selectedHeresies.join(','));
      }

      const response = await fetch(`/api/patriarchs?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch patriarchs');
      }
      return response.json();
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const handleSearch = () => {
    const trimmedInput = searchInput.trim();
    console.log('Manual search triggered for:', trimmedInput);
    setSearchQuery(trimmedInput);
  };

  // Real-time search with debounce effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmedInput = searchInput.trim();
      console.log('Auto search triggered for:', trimmedInput);
      setSearchQuery(trimmedInput);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Auto-search when filters change
  useEffect(() => {
    console.log('Filters changed - forcing refetch:', { selectedEra, selectedHeresies });
    refetch();
  }, [selectedEra, selectedHeresies, searchQuery, refetch]);

  // Extract unique eras from database
  const uniqueEras = Array.from(new Set((patriarchs || []).map(p => p.era))).filter(Boolean).sort();

  // Extract unique heresies for filtering with proper parsing
  const allHeresies = Array.from(
    new Set(
      (patriarchs || []).flatMap(p => {
        let heresies = [];
        try {
          if (Array.isArray(p.heresiesFought)) {
            heresies = p.heresiesFought;
          } else if (typeof p.heresiesFought === 'string') {
            const heresiesString = p.heresiesFought;
            if (heresiesString.startsWith('{') && heresiesString.endsWith('}')) {
              // PostgreSQL array format
              const cleanString = heresiesString.slice(1, -1);
              heresies = cleanString.split(',').map(item => item.replace(/"/g, '').trim()).filter(item => item !== '');
            } else if (heresiesString.trim().startsWith('[')) {
              // JSON array format
              heresies = JSON.parse(heresiesString || '[]');
            } else if (heresiesString.includes(',')) {
              // Comma-separated format
              heresies = heresiesString.split(',').map(item => item.trim()).filter(item => item !== '');
            } else if (heresiesString.trim()) {
              // Single heresy
              heresies = [heresiesString.trim()];
            }
          }
        } catch (e) {
          console.error('Error parsing heresies for patriarch:', p.name, e);
          heresies = [];
        }
        return heresies;
      })
    )
  ).filter(Boolean);

  // Define preferred heresies order - الأريوسية should ALWAYS be first
  const sortedHeresies = [];

  // Force الأريوسية to be first if it exists
  if (allHeresies.includes('الأريوسية')) {
    sortedHeresies.push('الأريوسية');
  }

  // Add other important heresies in preferred order
  const preferredOrder = ['النسطورية', 'الخلقيدونية', 'الغنوصية', 'المونوثيليتية', 'الأبوليناريوسية', 'السابيلية'];
  preferredOrder.forEach(heresy => {
    if (allHeresies.includes(heresy) && !sortedHeresies.includes(heresy)) {
      sortedHeresies.push(heresy);
    }
  });

  // Add remaining heresies alphabetically
  const remainingHeresies = allHeresies
    .filter(heresy => !sortedHeresies.includes(heresy))
    .sort((a, b) => a.localeCompare(b, 'ar'));

  sortedHeresies.push(...remainingHeresies);

  console.log('All extracted heresies:', allHeresies);
  console.log('Sorted heresies (الأريوسية forced first):', sortedHeresies);

  // Use patriarchs directly from backend - no frontend filtering needed
  const filteredPatriarchs = patriarchs || [];

  const handleHeresyToggle = (heresy: string) => {
    setSelectedHeresies(prev => {
      const newSelection = prev.includes(heresy)
        ? prev.filter(h => h !== heresy)
        : [...prev, heresy];
      console.log('Heresy selection changed:', newSelection);
      return newSelection;
    });
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
                        placeholder="ابحث عن بطريرك بالاسم أو السيرة... (اكتب واضغط Enter)"
                        value={searchInput}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setSearchInput(newValue);
                          console.log('Search input changed:', newValue);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSearch();
                          }
                        }}
                        className="pl-4 pr-12 py-4 text-lg bg-white bg-opacity-90 border-none rounded-xl shadow-lg focus:shadow-xl transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Search Button */}
                  <div>
                    <Button
                      onClick={handleSearch}
                      className="w-full py-4 text-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          جاري البحث...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-search mr-2"></i>
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
                        <SelectItem value="all">جميع العصور ({filteredPatriarchs.length})</SelectItem>
                        {uniqueEras.map((era) => {
                          const count = patriarchs?.filter(p => p.era === era).length || 0;
                          return (
                            <SelectItem key={era} value={era}>{era} ({count})</SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Heresies Filter - الأريوسية appears first */}
                {sortedHeresies.length > 0 && (
                  <div className="mt-6">
                    <p className="text-white text-sm font-medium mb-3">
                      <i className="fas fa-filter ml-2"></i>
                      تصفية حسب البدع المحاربة:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sortedHeresies.slice(0, 12).map((heresy) => (
                        <Badge
                          key={heresy}
                          variant={selectedHeresies.includes(heresy) ? "default" : "outline"}
                          className={`cursor-pointer transition-all duration-200 ${
                            selectedHeresies.includes(heresy)
                              ? "bg-yellow-400 text-black hover:bg-yellow-500"
                              : "bg-white bg-opacity-20 text-white hover:bg-white hover:bg-opacity-30"
                          } ${heresy === 'الأريوسية' ? 'ring-2 ring-yellow-300 font-bold text-lg' : ''}`}
                          onClick={() => handleHeresyToggle(heresy)}
                        >
                          {heresy === 'الأريوسية' && '⭐ '}
                          {getArabicHeresyName(heresy)}
                          {heresy === 'الأريوسية' && ' (الأهم)'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clear Filters Button */}
                {(searchQuery || selectedEra !== "all" || selectedHeresies.length > 0) && (
                  <div className="flex justify-center mt-4">
                    <Button
                      onClick={() => {
                        setSearchQuery("");
                        setSearchInput("");
                        setSelectedEra("all");
                        setSelectedHeresies([]);
                      }}
                      variant="outline"
                      className="bg-white bg-opacity-20 text-white border-white border-opacity-30 hover:bg-white hover:bg-opacity-30"
                    >
                      <i className="fas fa-times ml-2"></i>
                      إزالة جميع الفلاتر
                    </Button>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-12">
        {/* Stats Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          {/* Active Filters Display */}
          {(searchQuery || selectedEra !== "all" || selectedHeresies.length > 0) && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium mb-2">الفلاتر المطبقة:</p>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge className="bg-blue-100 text-blue-800">
                    بحث: "{searchQuery}"
                  </Badge>
                )}
                {selectedEra !== "all" && (
                  <Badge className="bg-purple-100 text-purple-800">
                    العصر: {selectedEra}
                  </Badge>
                )}
                {selectedHeresies.map(heresy => (
                  <Badge key={heresy} className="bg-red-100 text-red-800">
                    بدعة: {heresy}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{filteredPatriarchs.length}</p>
                <p className="text-sm text-gray-600">
                  بطريرك {(searchQuery || selectedEra !== "all" || selectedHeresies.length > 0) && "مطابق"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {filteredPatriarchs.filter(p => {
                    let heresies = [];
                    try {
                      if (Array.isArray(p.heresiesFought)) {
                        heresies = p.heresiesFought;
                      } else if (typeof p.heresiesFought === 'string') {
                        const heresiesString = p.heresiesFought;
                        if (heresiesString.startsWith('{') && heresiesString.endsWith('}')) {
                          const cleanString = heresiesString.slice(1, -1);
                          heresies = cleanString.split(',').map(item => item.replace(/"/g, '').trim()).filter(item => item !== '');
                        } else {
                          heresies = JSON.parse(heresiesString || '[]');
                        }
                      }
                    } catch (e) {
                      heresies = [];
                    }
                    return heresies.length > 0;
                  }).length}
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

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap justify-center md:justify-start">
              <Button
                onClick={() => setShowChatbot(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 px-6 py-3 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <i className="fas fa-comments ml-2"></i>
                اسأل البطريرك
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
        ) : viewMode === "charts" ? (
          <HomeCharts patriarchs={filteredPatriarchs} />
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