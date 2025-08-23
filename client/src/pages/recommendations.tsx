import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PatriarchCard from "@/components/patriarch-card";
import { Search, Sparkles, Clock, BookOpen, Shield, Brain, Zap, Home } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Patriarch } from "@/../../shared/schema";

interface RecommendationCriteria {
  selectedEras: string[];
  selectedHeresies: string[];
  timeInterest: string;
  topicInterest: string;
  personalityTrait: string;
}

interface RecommendationResult {
  patriarch: Patriarch;
  score: number;
  reasons: string[];
}

export default function Recommendations() {
  const [, setLocation] = useLocation();
  const [criteria, setCriteria] = useState<RecommendationCriteria>({
    selectedEras: [],
    selectedHeresies: [],
    timeInterest: "",
    topicInterest: "",
    personalityTrait: ""
  });
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [userDescription, setUserDescription] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);

  const { data: patriarchs = [], isLoading } = useQuery<Patriarch[]>({
    queryKey: ["/api/patriarchs"],
  });

  // Extract unique eras and heresies for filters
  const uniqueEras = Array.from(new Set(patriarchs.map(p => p.era))).filter(Boolean);
  const uniqueHeresies = Array.from(new Set(patriarchs.flatMap(p => {
    let heresies = [];
    try {
      if (Array.isArray(p.heresiesFought)) {
        heresies = p.heresiesFought;
      } else if (typeof p.heresiesFought === 'string') {
        const heresiesString = p.heresiesFought;
        if (heresiesString.startsWith('{') && heresiesString.endsWith('}')) {
          // PostgreSQL array format: {"item1","item2"}
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
    // Ensure heresies is always an array before using filter
    return Array.isArray(heresies) ? heresies.filter((h: string) => h && h.trim()) : [];
  }))).filter(Boolean);

  // Check API key status
  const { data: apiStatus, isLoading: isLoadingApiStatus } = useQuery({
    queryKey: ['/api/gemini-status'],
    queryFn: async () => {
      const response = await fetch('/api/gemini-status', {
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch API status');
      return response.json();
    }
  });

  // AI Recommendations mutation
  const aiRecommendationsMutation = useMutation({
    mutationFn: async () => {
      // Check if API key is configured
      if (!apiStatus?.connected) {
        throw new Error("مفتاح Gemini API غير متصل. يرجى التحقق من المفتاح في لوحة الإدارة.");
      }

      // Reset progress
      setLoadingProgress(0);

      // Simulate progress stages
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 300);

      try {
        const userProfile = {
          description: userDescription
        };

        setLoadingProgress(20);
        const response = await apiRequest("POST", "/api/ai-recommendations", {
          userProfile,
          preferences: criteria
        });

        setLoadingProgress(80);
        const result = await response.json();
        setLoadingProgress(100);

        clearInterval(progressInterval);
        return result;
      } catch (error) {
        clearInterval(progressInterval);
        setLoadingProgress(0);
        throw error;
      }
    },
    onSuccess: (data) => {
      setAiRecommendations(data);
      setLoadingProgress(0);
    },
    onError: (error) => {
      console.error("Failed to generate AI recommendations:", error);
      setLoadingProgress(0);
    }
  });

  const timeInterests = [
    { id: "early", label: "العصور المبكرة", value: "early" },
    { id: "golden", label: "العصر الذهبي", value: "golden" },
    { id: "councils", label: "عصر المجامع", value: "councils" },
    { id: "modern", label: "العصر الحديث", value: "modern" }
  ];

  const topicInterests = [
    { id: "theology", label: "اللاهوت والعقيدة", value: "theology" },
    { id: "leadership", label: "القيادة والإدارة", value: "leadership" },
    { id: "missions", label: "الإرساليات والكرازة", value: "missions" },
    { id: "defense", label: "الدفاع عن الإيمان", value: "defense" }
  ];

  const personalityTraits = [
    { id: "scholar", label: "العالم المثقف", value: "scholar" },
    { id: "defender", label: "المدافع الشجاع", value: "defender" },
    { id: "builder", label: "البناء والمؤسس", value: "builder" },
    { id: "mystic", label: "الروحاني المتصوف", value: "mystic" }
  ];

  // Smart recommendation algorithm
  const generateRecommendations = () => {
    if (!patriarchs.length) return;

    const scoredPatriarchs: RecommendationResult[] = patriarchs.map(patriarch => {
      let score = 0;
      const reasons: string[] = [];

      // Era matching
      if (criteria.selectedEras.includes(patriarch.era)) {
        score += 30;
        reasons.push(`من ${patriarch.era}`);
      }

      // Heresies matching
      let patriarchHeresies = [];
      try {
        if (Array.isArray(patriarch.heresiesFought)) {
          patriarchHeresies = patriarch.heresiesFought;
        } else if (typeof patriarch.heresiesFought === 'string') {
          const heresiesString = patriarch.heresiesFought;
          if (heresiesString.startsWith('{') && heresiesString.endsWith('}')) {
            // PostgreSQL array format: {"item1","item2"}
            const cleanString = heresiesString.slice(1, -1);
            patriarchHeresies = cleanString.split(',').map(item => item.replace(/"/g, '').trim()).filter(item => item !== '');
          } else if (heresiesString.trim().startsWith('[')) {
            // JSON array format
            patriarchHeresies = JSON.parse(heresiesString || '[]');
          } else if (heresiesString.includes(',')) {
            // Comma-separated format
            patriarchHeresies = heresiesString.split(',').map(item => item.trim()).filter(item => item !== '');
          } else if (heresiesString.trim()) {
            // Single heresy
            patriarchHeresies = [heresiesString.trim()];
          }
        }
      } catch (e) {
        console.error('Error parsing heresies for patriarch:', patriarch.name, e);
        patriarchHeresies = [];
      }

      const matchingHeresies = patriarchHeresies.filter((h: string) => 
        criteria.selectedHeresies.includes(h)
      );
      if (matchingHeresies.length > 0) {
        score += matchingHeresies.length * 20;
        reasons.push(`حارب ${matchingHeresies.join('، ')}`);
      }

      // Time interest matching
      if (criteria.timeInterest) {
        if (criteria.timeInterest === "early" && patriarch.startYear < 400) {
          score += 25;
          reasons.push("من العصور المسيحية المبكرة");
        } else if (criteria.timeInterest === "golden" && patriarch.startYear >= 300 && patriarch.startYear <= 600) {
          score += 25;
          reasons.push("من العصر الذهبي للكنيسة");
        } else if (criteria.timeInterest === "councils" && patriarch.startYear >= 300 && patriarch.startYear <= 800) {
          score += 25;
          reasons.push("شارك في عصر المجامع المسكونية");
        } else if (criteria.timeInterest === "modern" && patriarch.startYear >= 1800) {
          score += 25;
          reasons.push("من العصر الحديث");
        }
      }

      // Topic interest matching
      if (criteria.topicInterest) {
        const contributions = patriarch.contributions.toLowerCase();
        if (criteria.topicInterest === "theology" && 
            (contributions.includes("لاهوت") || contributions.includes("عقيدة") || contributions.includes("تعليم"))) {
          score += 20;
          reasons.push("متخصص في اللاهوت والعقيدة");
        } else if (criteria.topicInterest === "leadership" && 
                   (contributions.includes("قيادة") || contributions.includes("إدارة") || contributions.includes("تنظيم"))) {
          score += 20;
          reasons.push("قائد وإداري ماهر");
        } else if (criteria.topicInterest === "missions" && 
                   (contributions.includes("كرازة") || contributions.includes("تبشير") || contributions.includes("انتشار"))) {
          score += 20;
          reasons.push("رائد في الكرازة والإرساليات");
        } else if (criteria.topicInterest === "defense" && 
                   (contributions.includes("دفاع") || contributions.includes("حماية") || contributions.includes("رد"))) {
          score += 20;
          reasons.push("مدافع قوي عن الإيمان");
        }
      }

      // Personality trait matching
      if (criteria.personalityTrait) {
        const bio = `${patriarch.contributions} ${patriarch.biography || ""}`.toLowerCase();
        if (criteria.personalityTrait === "scholar" && 
            (bio.includes("علم") || bio.includes("كتب") || bio.includes("تأليف") || bio.includes("دراسة"))) {
          score += 15;
          reasons.push("عالم ومثقف");
        } else if (criteria.personalityTrait === "defender" && 
                   (bio.includes("حارب") || bio.includes("دافع") || bio.includes("قاوم"))) {
          score += 15;
          reasons.push("مدافع شجاع");
        } else if (criteria.personalityTrait === "builder" && 
                   (bio.includes("بنى") || bio.includes("أسس") || bio.includes("شيد") || bio.includes("طور"))) {
          score += 15;
          reasons.push("بناء ومؤسس");
        } else if (criteria.personalityTrait === "mystic" && 
                   (bio.includes("روحاني") || bio.includes("تصوف") || bio.includes("عبادة") || bio.includes("تقوى"))) {
          score += 15;
          reasons.push("روحاني متصوف");
        }
      }

      // Search term matching
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (patriarch.name.toLowerCase().includes(searchLower) ||
            patriarch.arabicName?.toLowerCase().includes(searchLower) ||
            patriarch.contributions.toLowerCase().includes(searchLower)) {
          score += 10;
          reasons.push("يطابق البحث الخاص بك");
        }
      }

      return { patriarch, score, reasons };
    });

    // Sort by score and take top 6
    const topRecommendations = scoredPatriarchs
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    setRecommendations(topRecommendations);
  };

  useEffect(() => {
    generateRecommendations();
  }, [criteria, searchTerm, patriarchs]);

  const updateCriteria = (key: keyof RecommendationCriteria, value: any) => {
    setCriteria(prev => ({ ...prev, [key]: value }));
  };

  const handleEraChange = (era: string, checked: boolean) => {
    setCriteria(prev => ({
      ...prev,
      selectedEras: checked 
        ? [...prev.selectedEras, era]
        : prev.selectedEras.filter(e => e !== era)
    }));
  };

  const handleHeresyChange = (heresy: string, checked: boolean) => {
    setCriteria(prev => ({
      ...prev,
      selectedHeresies: checked 
        ? [...prev.selectedHeresies, heresy]
        : prev.selectedHeresies.filter(h => h !== heresy)
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="mx-auto h-12 w-12 text-amber-600 animate-spin" />
          <p className="mt-4 text-lg text-gray-600">جاري تحضير الاقتراحات</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 relative">
          {/* Home Button */}
          <div className="absolute top-0 right-0">
            <Button
              onClick={() => setLocation("/")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <Home className="h-5 w-5" />
              الصفحة الرئيسية
            </Button>
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-800">محرك الاقتراحات الذكي</h1>
            <Sparkles className="h-8 w-8 text-amber-600" />
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            اكتشف البطاركة المناسبين لاهتماماتك بالذكاء الاصطناعي أو الفلترة التقليدية
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  فلاتر البحث
                </CardTitle>
                <CardDescription>
                  اختر اهتماماتك لنقترح عليك أفضل البطاركة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Input */}
                <div>
                  <Label htmlFor="search">البحث النصي</Label>
                  <Input
                    id="search"
                    placeholder="ابحث بالاسم أو المساهمات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Separator />

                {/* Era Filter */}
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    العصور التاريخية
                  </Label>
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                    {uniqueEras.map((era) => (
                      <div key={era} className="flex items-center space-x-2">
                        <Checkbox
                          id={`era-${era}`}
                          checked={criteria.selectedEras.includes(era)}
                          onCheckedChange={(checked) => handleEraChange(era, checked as boolean)}
                        />
                        <Label htmlFor={`era-${era}`} className="text-sm cursor-pointer">
                          {era}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Heresies Filter */}
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    البدع المحاربة
                  </Label>
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                    {uniqueHeresies.slice(0, 10).map((heresy) => (
                      <div key={heresy} className="flex items-center space-x-2">
                        <Checkbox
                          id={`heresy-${heresy}`}
                          checked={criteria.selectedHeresies.includes(heresy)}
                          onCheckedChange={(checked) => handleHeresyChange(heresy, checked as boolean)}
                        />
                        <Label htmlFor={`heresy-${heresy}`} className="text-sm cursor-pointer">
                          {heresy}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Time Interest */}
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    الفترة الزمنية المفضلة
                  </Label>
                  <div className="mt-2 space-y-2">
                    {timeInterests.map((interest) => (
                      <div key={interest.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={interest.id}
                          checked={criteria.timeInterest === interest.value}
                          onCheckedChange={(checked) => 
                            updateCriteria("timeInterest", checked ? interest.value : "")
                          }
                        />
                        <Label htmlFor={interest.id} className="text-sm cursor-pointer">
                          {interest.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => setCriteria({
                    selectedEras: [],
                    selectedHeresies: [],
                    timeInterest: "",
                    topicInterest: "",
                    personalityTrait: ""
                  })}
                  variant="outline"
                  className="w-full"
                >
                  مسح الفلاتر
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations Results */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="smart" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="smart" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  اقتراحات الذكاء الاصطناعي
                </TabsTrigger>
                <TabsTrigger value="traditional" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  الفلترة التقليدية
                </TabsTrigger>
              </TabsList>

              {/* AI Recommendations Tab */}
              <TabsContent value="smart">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-right">
                      <Brain className="h-5 w-5 text-purple-600" />
                      محرك الاقتراحات الذكية
                    </CardTitle>
                    <CardDescription className="text-right">
                      أخبرنا عن اهتماماتك وسيقوم الذكاء الاصطناعي بتحليلها واقتراح أفضل البطاركة المناسبين لك
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="user-description" className="text-right block">صف اهتماماتك وما تبحث عنه</Label>
                      <Textarea
                        id="user-description"
                        placeholder="مثال: أهتم بتاريخ الكنيسة المبكرة والدفاع عن العقيدة ضد البدع، وأريد أن أتعلم عن البطاركة الذين واجهوا تحديات مشابهة لما نواجهه اليوم..."
                        value={userDescription}
                        onChange={(e) => setUserDescription(e.target.value)}
                        rows={4}
                        className="mt-1"
                      />
                    </div>

                    {isLoadingApiStatus ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-spinner fa-spin text-blue-500 text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-bold text-blue-600 mb-2">
                          جاري فحص حالة الذكاء الاصطناعي
                        </h3>
                        <p className="text-blue-500 text-lg">
                          يرجى الانتظار بينما نتحقق من إعدادات Gemini API
                        </p>
                      </div>
                    ) : !apiStatus?.connected ? (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-bold text-red-600 mb-2">
                          {!apiStatus?.hasApiKey ? 'مفتاح Gemini API غير مُكوَّن' : 'مفتاح Gemini API غير متصل'}
                        </h3>
                        <p className="text-red-500 text-lg mb-4">
                          {!apiStatus?.hasApiKey ? 'يجب تكوين مفتاح API في لوحة الإدارة أولاً لاستخدام الاقتراحات الذكية' : 'يرجى التحقق من صحة مفتاح API في لوحة الإدارة'}
                        </p>
                        <Button 
                          onClick={() => setLocation("/admin")}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <i className="fas fa-cog mr-2"></i>
                          الذهاب إلى لوحة الإدارة
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => aiRecommendationsMutation.mutate()}
                        disabled={aiRecommendationsMutation.isPending || !userDescription.trim()}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        {aiRecommendationsMutation.isPending ? (
                          <>
                            <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                            جاري التحليل بالذكاء الاصطناعي ({Math.round(loadingProgress)}%)
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            احصل على اقتراحات ذكية
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* AI Recommendations Display */}
                {aiRecommendations && (
                  <div className="space-y-6 text-right">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                      <h3 className="text-xl font-bold text-purple-800 mb-2">
                        نصائح الذكاء الاصطناعي لك
                      </h3>
                      <p className="text-purple-700 leading-relaxed text-right">
                        {aiRecommendations.overallAdvice}
                      </p>
                    </div>

                    {/* Brief Description Section */}
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-6 border border-amber-200">
                      <h3 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        نبذة مختصرة عن البطاركة المقترحين
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {aiRecommendations.recommendations.map((rec: any, index: number) => (
                          rec.patriarch && (
                            <div key={index} className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
                              <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                                  <span className="text-amber-700 font-bold text-sm">{rec.patriarch.orderNumber}</span>
                                </div>
                                {rec.patriarch.arabicName || rec.patriarch.name}
                              </h4>
                              <div className="space-y-2 text-sm text-amber-800 text-right">
                                <p><strong>الفترة:</strong> {rec.patriarch.startYear} - {rec.patriarch.endYear || "الآن"} م</p>
                                <p><strong>العصر:</strong> {rec.patriarch.era}</p>
                                <p className="text-amber-700 leading-relaxed text-right">
                                  <strong>المساهمات:</strong> {rec.patriarch.contributions?.substring(0, 150)}
                                  {rec.patriarch.contributions?.length > 150 && "..."}
                                </p>
                                {rec.patriarch.heresiesFought && rec.patriarch.heresiesFought !== '[]' && (
                                  <div>
                                    <strong>البدع المحاربة:</strong>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {(() => {
                                        try {
                                          const heresies = Array.isArray(rec.patriarch.heresiesFought) 
                                            ? rec.patriarch.heresiesFought 
                                            : JSON.parse(rec.patriarch.heresiesFought);
                                          return heresies.slice(0, 3).map((heresy: string, idx: number) => (
                                            <Badge key={idx} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                              {heresy}
                                            </Badge>
                                          ));
                                        } catch (e) {
                                          return null;
                                        }
                                      })()}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {aiRecommendations.recommendations.map((rec: any, index: number) => (
                        <div key={index} className="relative">
                          <div className="absolute top-4 left-4 z-10">
                            <Badge className="bg-purple-100 text-purple-800">
                              AI Score: {rec.score}%
                            </Badge>
                          </div>

                          {rec.patriarch && <PatriarchCard patriarch={rec.patriarch} />}

                          <Card className="mt-2 border-purple-200 bg-purple-50">
                            <CardContent className="p-4 text-right">
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm font-medium text-purple-800 mb-2">
                                    🤖 تحليل الذكاء الاصطناعي:
                                  </p>
                                  <div className="space-y-1">
                                    {rec.reasons.map((reason: string, idx: number) => (
                                      <Badge key={idx} variant="outline" className="text-xs mr-1 mb-1">
                                        {reason}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                {rec.personalAdvice && (
                                  <div className="border-t pt-2">
                                    <p className="text-sm font-medium text-purple-800 mb-1">
                                      💡 نصيحة شخصية:
                                    </p>
                                    <p className="text-sm text-purple-700 text-right">
                                      {rec.personalAdvice}
                                    </p>
                                  </div>
                                )}

                                {rec.highlights && rec.highlights.length > 0 && (
                                  <div className="border-t pt-2">
                                    <p className="text-sm font-medium text-purple-800 mb-1">
                                      ⭐ نقاط مميزة:
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {rec.highlights.map((highlight: string, idx: number) => (
                                        <Badge key={idx} className="text-xs bg-yellow-100 text-yellow-800">
                                          {highlight}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No AI recommendations yet */}
                {!aiRecommendations && !aiRecommendationsMutation.isPending && (
                  <Card className="text-center py-16">
                    <CardContent>
                      <Brain className="mx-auto h-16 w-16 text-purple-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        جاهز للاقتراحات الذكية
                      </h3>
                      <p className="text-gray-500 mb-4">
                        اكتب وصفاً لاهتماماتك أعلاه وسيقوم الذكاء الاصطناعي بتحليلها وتقديم اقتراحات مخصصة لك
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Traditional Recommendations Tab */}
              <TabsContent value="traditional">
                {recommendations.length > 0 ? (
                  <>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        الاقتراحات المخصصة لك ({recommendations.length})
                      </h2>
                      <p className="text-gray-600">
                        تم ترتيب النتائج بناءً على مطابقة اهتماماتك
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {recommendations.map((rec, index) => (
                        <div key={rec.patriarch.id} className="relative">
                          <div className="absolute top-4 left-4 z-10">
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                              #{index + 1}
                            </Badge>
                          </div>

                          <PatriarchCard patriarch={rec.patriarch} />

                          {rec.reasons.length > 0 && (
                            <Card className="mt-2 border-amber-200 bg-amber-50">
                              <CardContent className="p-3">
                                <p className="text-sm font-medium text-amber-800 mb-1">
                                  لماذا يناسبك هذا البطريرك:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {rec.reasons.map((reason, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {reason}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <Card className="text-center py-16">
                    <CardContent>
                      <Sparkles className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        لا توجد اقتراحات بعد
                      </h3>
                      <p className="text-gray-500 mb-4">
                        اختر اهتماماتك من القائمة الجانبية لنقترح عليك البطاركة المناسبين
                      </p>
                      <Button onClick={() => updateCriteria("timeInterest", "golden")} className="mt-2">
                        ابدأ بالعصر الذهبي
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}