
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function About() {
  const [, setLocation] = useLocation();

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
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <i className="fas fa-info-circle text-4xl"></i>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold font-amiri mb-4 bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent">
              عن الموقع
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-6 leading-relaxed">
              رسالتنا في حفظ وتوثيق تاريخ الكنيسة القبطية الأرثوذكسية
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Mission */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-target text-white text-2xl"></i>
              </div>
              <CardTitle className="text-2xl font-amiri text-blue-600">رسالتنا</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-700 leading-relaxed">
                نهدف إلى توثيق وحفظ تاريخ بطاركة الكنيسة القبطية الأرثوذكسية للأجيال القادمة، 
                وتقديم منصة رقمية شاملة تحتوي على معلومات دقيقة ومفصلة عن كل بطريرك 
                ومساهماته في تاريخ المسيحية.
              </p>
            </CardContent>
          </Card>

          {/* Vision */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-eye text-white text-2xl"></i>
              </div>
              <CardTitle className="text-2xl font-amiri text-purple-600">رؤيتنا</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-700 leading-relaxed">
                أن نكون المرجع الأول والأكثر شمولية لتاريخ الكنيسة القبطية الأرثوذكسية، 
                ونوفر للباحثين والمهتمين مصدراً موثوقاً ومتاحاً للجميع لدراسة هذا التاريخ العريق.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card className="shadow-lg mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-amiri text-blue-600 mb-4">مميزات الموقع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-database text-blue-600 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">قاعدة بيانات شاملة</h3>
                <p className="text-gray-600">
                  معلومات مفصلة عن جميع البطاركة من القديس مرقس الرسول حتى اليوم
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-search text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">بحث متقدم</h3>
                <p className="text-gray-600">
                  إمكانية البحث والفلترة حسب العصر والمساهمات والبدع المحاربة
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-timeline text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">الخط الزمني</h3>
                <p className="text-gray-600">
                  عرض تفاعلي للبطاركة مرتبين تاريخياً مع إمكانية التنقل السهل
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-mobile-alt text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">متوافق مع الأجهزة</h3>
                <p className="text-gray-600">
                  يعمل بسلاسة على جميع الأجهزة من الهواتف الذكية إلى أجهزة الكمبيوتر
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-shield-alt text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">معلومات موثقة</h3>
                <p className="text-gray-600">
                  جميع المعلومات مراجعة ومؤكدة من مصادر تاريخية معتمدة
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-language text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">باللغة العربية</h3>
                <p className="text-gray-600">
                  محتوى كامل باللغة العربية مع أسماء البطاركة مترجمة
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology */}
        <Card className="shadow-lg mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-amiri text-blue-600 mb-4">التقنيات المستخدمة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <i className="fab fa-react text-4xl text-blue-600 mb-3"></i>
                <h4 className="font-semibold text-gray-800">React</h4>
                <p className="text-sm text-gray-600">واجهة المستخدم</p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg text-center">
                <i className="fas fa-database text-4xl text-green-600 mb-3"></i>
                <h4 className="font-semibold text-gray-800">PostgreSQL</h4>
                <p className="text-sm text-gray-600">قاعدة البيانات</p>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg text-center">
                <i className="fab fa-node-js text-4xl text-purple-600 mb-3"></i>
                <h4 className="font-semibold text-gray-800">Node.js</h4>
                <p className="text-sm text-gray-600">الخادم الخلفي</p>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg text-center">
                <i className="fas fa-palette text-4xl text-yellow-600 mb-3"></i>
                <h4 className="font-semibold text-gray-800">Tailwind CSS</h4>
                <p className="text-sm text-gray-600">التصميم</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <h2 className="text-3xl font-amiri mb-4">ابدأ رحلتك في استكشاف التاريخ</h2>
              <p className="text-lg mb-6 text-blue-100">
                اكتشف قصص وحياة البطاركة الذين شكلوا تاريخ الكنيسة القبطية الأرثوذكسية
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  onClick={() => setLocation("/")}
                  className="bg-yellow-400 text-black hover:bg-yellow-500 px-8 py-3 text-lg"
                >
                  <i className="fas fa-home ml-2"></i>
                  العودة للرئيسية
                </Button>
                <Button 
                  onClick={() => setLocation("/church-history")}
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg"
                >
                  <i className="fas fa-history ml-2"></i>
                  تاريخ الكنيسة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
