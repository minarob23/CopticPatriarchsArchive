import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PatriarchCard from "@/components/patriarch-card";
import PatriarchTimeline from "@/components/patriarch-timeline";
import Loading from "@/components/ui/loading";
import type { Patriarch } from "@shared/schema";

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEra, setSelectedEra] = useState("all");

  const { data: patriarchs, isLoading } = useQuery<Patriarch[]>({
    queryKey: ["/api/patriarchs", searchQuery, selectedEra],
  });

  const eras = [
    { value: "all", label: "جميع البطاركة" },
    { value: "apostolic", label: "العصر الرسولي" },
    { value: "golden", label: "العصر الذهبي" },
    { value: "councils", label: "عصر المجامع" },
    { value: "persecution", label: "عصر الاضطهاد" },
    { value: "modern", label: "العصر الحديث" },
  ];

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b-2 border-yellow-400">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-reverse space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <i className="fas fa-cross text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-600 font-amiri">بطاركة الكنيسة القبطية</h1>
                <p className="text-sm text-gray-600">الأرثوذكسية</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-reverse space-x-6">
              <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-semibold">الرئيسية</a>
              <a href="#patriarchs" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">البطاركة</a>
              <a href="#timeline" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">الخط الزمني</a>
              
              <Button 
                onClick={() => window.location.href = "/api/login"}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <i className="fas fa-user-shield ml-2"></i>
                دخول الإدارة
              </Button>
            </div>
            
            <Button variant="ghost" className="md:hidden">
              <i className="fas fa-bars text-xl"></i>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12" id="home">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-6 font-amiri">
              بطاركة الكنيسة القبطية الأرثوذكسية
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              قاعدة بيانات شاملة للبطاركة المقدسين الذين حافظوا على الإيمان وتصدوا للبدع والهرطقات عبر التاريخ
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="ابحث عن بطريرك بالاسم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-full focus:border-blue-600"
                />
                <Button
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700"
                  variant="ghost"
                >
                  <i className="fas fa-search text-xl"></i>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Filter Section */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {eras.map((era) => (
              <Button
                key={era.value}
                variant={selectedEra === era.value ? "default" : "outline"}
                onClick={() => setSelectedEra(era.value)}
                className={selectedEra === era.value ? "golden-border" : ""}
              >
                {era.label}
              </Button>
            ))}
          </div>
        </section>
        
        {/* Patriarchs Grid */}
        <section className="mb-12" id="patriarchs">
          {patriarchs && patriarchs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {patriarchs.map((patriarch) => (
                <PatriarchCard key={patriarch.id} patriarch={patriarch} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CardContent>
                <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد نتائج</h3>
                <p className="text-gray-500">لم يتم العثور على بطاركة يطابقون معايير البحث</p>
              </CardContent>
            </Card>
          )}
        </section>
        
        {/* Timeline Section */}
        <section className="mb-12" id="timeline">
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-600 font-amiri">الخط الزمني للبطاركة</h2>
          <PatriarchTimeline patriarchs={patriarchs || []} />
        </section>
      </main>

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
                <li><a href="#" className="text-blue-200 hover:text-white transition-colors duration-200">عن الموقع</a></li>
                <li><a href="#" className="text-blue-200 hover:text-white transition-colors duration-200">تاريخ الكنيسة</a></li>
                <li><a href="#" className="text-blue-200 hover:text-white transition-colors duration-200">المراجع</a></li>
                <li><a href="#" className="text-blue-200 hover:text-white transition-colors duration-200">اتصل بنا</a></li>
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
              © 2024 بطاركة الكنيسة القبطية الأرثوذكسية. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
