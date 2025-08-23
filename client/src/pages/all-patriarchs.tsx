
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Search, Filter, Crown, Calendar, Award, BookOpen } from "lucide-react";

interface PatriarchData {
  id: number;
  name: string;
  arabicName?: string;
  orderNumber: number;
  startYear: number;
  endYear?: number;
  era: string;
  contributions: string;
  biography?: string;
  heresiesList: string[];
  serviceDuration: number;
  displayName: string;
  isCurrentPatriarch: boolean;
  centuryStart: number;
  formattedPeriod: string;
  shortBio: string;
}

interface AllPatriarchsResponse {
  patriarchs: PatriarchData[];
  totalCount: number;
  metadata: {
    totalPatriarchs: number;
    currentPatriarch: PatriarchData;
    firstPatriarch: PatriarchData;
    eras: string[];
    averageService: number;
  };
}

export default function AllPatriarchs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEra, setSelectedEra] = useState("all");
  const [sortBy, setSortBy] = useState("order");

  const { data: patriarchsData, isLoading } = useQuery<AllPatriarchsResponse>({
    queryKey: ["/api/patriarchs", { showAll: true }],
    queryFn: async () => {
      const response = await fetch("/api/patriarchs?showAll=true");
      if (!response.ok) throw new Error("Failed to fetch patriarchs");
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل البطاركة...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patriarchsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 p-8">
        <div className="max-w-6xl mx-auto text-center py-12">
          <p className="text-red-600">حدث خطأ في تحميل البيانات</p>
        </div>
      </div>
    );
  }

  // Filter and sort patriarchs
  let filteredPatriarchs = patriarchsData.patriarchs.filter(patriarch => {
    const matchesSearch = !searchTerm || 
      patriarch.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patriarch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patriarch.contributions.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEra = selectedEra === "all" || patriarch.era === selectedEra;

    return matchesSearch && matchesEra;
  });

  // Sort patriarchs
  switch (sortBy) {
    case "order":
      filteredPatriarchs.sort((a, b) => a.orderNumber - b.orderNumber);
      break;
    case "duration":
      filteredPatriarchs.sort((a, b) => b.serviceDuration - a.serviceDuration);
      break;
    case "era":
      filteredPatriarchs.sort((a, b) => a.startYear - b.startYear);
      break;
    case "name":
      filteredPatriarchs.sort((a, b) => a.displayName.localeCompare(b.displayName, 'ar'));
      break;
  }

  const { metadata } = patriarchsData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-4 font-amiri">
            <Crown className="inline-block w-10 h-10 ml-3 text-yellow-600" />
            جميع بطاركة الكنيسة القبطية الأرثوذكسية
          </h1>
          <p className="text-xl text-gray-700">
            رحلة عبر {metadata.totalPatriarchs} بطريرك عبر {Math.round((new Date().getFullYear() - metadata.firstPatriarch.startYear))} سنة من التاريخ المقدس
          </p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Crown className="w-6 h-6 text-blue-600 ml-2" />
                <span className="text-2xl font-bold text-blue-600">{metadata.totalPatriarchs}</span>
              </div>
              <p className="text-sm text-gray-600">إجمالي البطاركة</p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="w-6 h-6 text-green-600 ml-2" />
                <span className="text-2xl font-bold text-green-600">{metadata.averageService}</span>
              </div>
              <p className="text-sm text-gray-600">متوسط سنوات الخدمة</p>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-6 h-6 text-amber-600 ml-2" />
                <span className="text-xl font-bold text-amber-600">{metadata.currentPatriarch.displayName}</span>
              </div>
              <p className="text-sm text-gray-600">البطريرك الحالي</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="w-6 h-6 text-purple-600 ml-2" />
                <span className="text-2xl font-bold text-purple-600">{metadata.eras.length}</span>
              </div>
              <p className="text-sm text-gray-600">العصور التاريخية</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث في الأسماء والمساهمات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>

              <Select value={selectedEra} onValueChange={setSelectedEra}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر العصر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع العصور</SelectItem>
                  {metadata.eras.map(era => (
                    <SelectItem key={era} value={era}>{era}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="الترتيب حسب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order">الترتيب التاريخي</SelectItem>
                  <SelectItem value="duration">مدة الخدمة</SelectItem>
                  <SelectItem value="era">العصر</SelectItem>
                  <SelectItem value="name">الاسم</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setSelectedEra("all");
                setSortBy("order");
              }}>
                <Filter className="w-4 h-4 ml-2" />
                مسح المرشحات
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            عرض {filteredPatriarchs.length} من {metadata.totalPatriarchs} بطريرك
          </p>
        </div>

        {/* Patriarchs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatriarchs.map((patriarch) => (
            <Card 
              key={patriarch.id}
              className={`hover:shadow-lg transition-shadow duration-300 ${
                patriarch.isCurrentPatriarch 
                  ? 'border-gold-400 bg-gradient-to-br from-amber-50 to-yellow-50' 
                  : 'border-gray-200'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge 
                    variant="secondary" 
                    className={
                      patriarch.isCurrentPatriarch 
                        ? 'bg-gold-100 text-gold-800' 
                        : 'bg-blue-100 text-blue-800'
                    }
                  >
                    البطريرك #{patriarch.orderNumber}
                  </Badge>
                  {patriarch.isCurrentPatriarch && (
                    <Badge className="bg-green-500">الحالي</Badge>
                  )}
                </div>
                
                <CardTitle className="text-lg leading-relaxed font-amiri">
                  {patriarch.displayName}
                </CardTitle>
                
                <p className="text-sm text-gray-600 italic">
                  {patriarch.name}
                </p>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 ml-2" />
                  <span>{patriarch.formattedPeriod}</span>
                  <span className="mr-2 text-blue-600">
                    ({patriarch.serviceDuration} سنة)
                  </span>
                </div>

                <Badge variant="outline" className="text-xs">
                  {patriarch.era}
                </Badge>

                <p className="text-sm text-gray-700 line-clamp-3">
                  {patriarch.contributions}
                </p>

                {patriarch.heresiesList.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">البدع المحاربة:</p>
                    <div className="flex flex-wrap gap-1">
                      {patriarch.heresiesList.slice(0, 3).map((heresy, index) => (
                        <Badge 
                          key={index} 
                          variant="destructive" 
                          className="text-xs bg-red-100 text-red-700"
                        >
                          {heresy}
                        </Badge>
                      ))}
                      {patriarch.heresiesList.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{patriarch.heresiesList.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {patriarch.biography && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-600">
                      {patriarch.shortBio}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPatriarchs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              لم يتم العثور على بطاركة مطابقين لمعايير البحث
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedEra("all");
              }}
              className="mt-4"
            >
              مسح البحث وعرض الكل
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
