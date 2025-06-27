
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

export default function References() {
  const [, setLocation] = useLocation();

  const books = [
    {
      title: "تاريخ الكنيسة القبطية",
      author: "الأنبا يوأنس",
      year: "1983",
      publisher: "مطبعة دير القديس أنبا مقار",
      description: "دراسة شاملة لتاريخ الكنيسة القبطية من العصر الرسولي حتى القرن العشرين",
      type: "كتاب"
    },
    {
      title: "بطاركة الكرسي الإسكندري",
      author: "الدكتور جورج فيلوثاوس",
      year: "1996",
      publisher: "الكلية الإكليريكية",
      description: "سير مفصلة لجميع بطاركة الإسكندرية مع تحليل لفترات حكمهم",
      type: "كتاب"
    },
    {
      title: "مجمع خلقيدونية وموقف الكنيسة القبطية",
      author: "الأنبا بيشوي",
      year: "2001",
      publisher: "مكتبة المحبة",
      description: "دراسة لاهوتية حول مجمع خلقيدونية وأسباب رفض الكنيسة القبطية له",
      type: "كتاب"
    },
    {
      title: "القديس أثناسيوس الرسولي",
      author: "الأنبا مكاريوس",
      year: "1988",
      publisher: "دار الطباعة القومية",
      description: "سيرة شاملة للقديس أثناسيوس ودوره في محاربة الآريوسية",
      type: "كتاب"
    },
    {
      title: "الكنيسة القبطية في العصور الوسطى",
      author: "الدكتور عزيز سوريال عطية",
      year: "1979",
      publisher: "دار المعارف",
      description: "تحليل تاريخي لفترة الحكم الإسلامي وتأثيره على الكنيسة القبطية",
      type: "كتاب"
    },
    {
      title: "مدرسة الإسكندرية اللاهوتية",
      author: "الأنبا متاؤس",
      year: "1995",
      publisher: "مكتبة الكاروز",
      description: "تاريخ وتطور مدرسة الإسكندرية ودورها في الفكر المسيحي",
      type: "كتاب"
    }
  ];

  const articles = [
    {
      title: "البطريرك كيرلس السادس ودوره في النهضة القبطية",
      author: "الدكتور ميلاد حنا",
      journal: "مجلة الكرازة",
      year: "2003",
      description: "دراسة عن إنجازات البطريرك كيرلس السادس",
      type: "مقال"
    },
    {
      title: "التقويم القبطي وأهميته التاريخية",
      author: "الأستاذ رؤوف حبيب",
      journal: "مجلة كنيستي",
      year: "2005",
      description: "شرح مفصل للتقويم القبطي وعلاقته بالتاريخ الكنسي",
      type: "مقال"
    },
    {
      title: "الرهبنة القبطية في القرون الأولى",
      author: "الأب متى المسكين",
      journal: "مجلة مار جرجس",
      year: "1992",
      description: "تطور الحياة الرهبانية في مصر وتأثيرها على العالم",
      type: "مقال"
    }
  ];

  const digitalResources = [
    {
      title: "موقع الكنيسة القبطية الأرثوذكسية",
      url: "copticchurch.net",
      description: "الموقع الرسمي للكنيسة القبطية الأرثوذكسية",
      type: "موقع إلكتروني"
    },
    {
      title: "مكتبة المشروع القبطي",
      url: "coptic-treasures.com",
      description: "مجموعة رقمية من النصوص والوثائق القبطية",
      type: "مكتبة رقمية"
    },
    {
      title: "أرشيف القديس تكلا",
      url: "st-takla.org",
      description: "موسوعة شاملة للتراث المسيحي القبطي",
      type: "موسوعة"
    }
  ];

  const manuscripts = [
    {
      title: "مخطوطات دير سانت كاترين",
      location: "دير سانت كاترين، سيناء",
      description: "مجموعة نادرة من المخطوطات القبطية واليونانية",
      date: "القرون 4-15",
      type: "مخطوطات"
    },
    {
      title: "مخطوطات المتحف القبطي",
      location: "المتحف القبطي، القاهرة",
      description: "أكبر مجموعة من المخطوطات القبطية في العالم",
      date: "القرون 3-18",
      type: "مخطوطات"
    },
    {
      title: "أوراق البردي القبطية",
      location: "المتحف المصري، القاهرة",
      description: "وثائق تاريخية على البردي تحكي قصة المسيحيين الأوائل",
      date: "القرون 3-8",
      type: "بردي"
    }
  ];

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
              <i className="fas fa-book text-4xl"></i>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold font-amiri mb-4 bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent">
              المراجع والمصادر
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-6 leading-relaxed">
              مصادر موثوقة لدراسة تاريخ الكنيسة القبطية الأرثوذكسية
            </p>
            <p className="text-lg text-blue-200 max-w-3xl mx-auto">
              مجموعة شاملة من الكتب والمقالات والمخطوطات والمصادر الرقمية 
              للباحثين والمهتمين بالتاريخ القبطي
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Books Section */}
        <Card className="shadow-lg mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-amiri text-blue-600 mb-4 flex items-center justify-center">
              <i className="fas fa-book ml-3"></i>
              الكتب والمؤلفات
            </CardTitle>
            <p className="text-gray-600">مراجع أساسية في تاريخ الكنيسة القبطية</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {books.map((book, index) => (
                <Card key={index} className="border-r-4 border-blue-600">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center ml-4 flex-shrink-0">
                        <i className="fas fa-book-open text-white"></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-blue-600 font-amiri mb-1">{book.title}</h3>
                        <p className="text-gray-700 mb-2">{book.author}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{book.year}</Badge>
                          <Badge variant="outline" className="text-xs">{book.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{book.publisher}</p>
                        <p className="text-sm text-gray-700">{book.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Articles Section */}
        <Card className="shadow-lg mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-amiri text-purple-600 mb-4 flex items-center justify-center">
              <i className="fas fa-newspaper ml-3"></i>
              المقالات والدراسات
            </CardTitle>
            <p className="text-gray-600">بحوث ودراسات متخصصة</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {articles.map((article, index) => (
                <Card key={index} className="border-r-4 border-purple-600">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center ml-4 flex-shrink-0">
                        <i className="fas fa-file-alt text-white"></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-purple-600 font-amiri mb-1">{article.title}</h3>
                        <p className="text-gray-700 mb-2">{article.author}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{article.year}</Badge>
                          <Badge variant="outline" className="text-xs">{article.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{article.journal}</p>
                        <p className="text-sm text-gray-700">{article.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Digital Resources */}
        <Card className="shadow-lg mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-amiri text-green-600 mb-4 flex items-center justify-center">
              <i className="fas fa-globe ml-3"></i>
              المصادر الرقمية
            </CardTitle>
            <p className="text-gray-600">مواقع ومكتبات إلكترونية</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {digitalResources.map((resource, index) => (
                <Card key={index} className="border-r-4 border-green-600">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-laptop text-white text-xl"></i>
                      </div>
                      <h3 className="font-bold text-green-600 font-amiri mb-2">{resource.title}</h3>
                      <Badge variant="outline" className="mb-2 text-xs">{resource.type}</Badge>
                      <p className="text-sm text-blue-600 mb-2">{resource.url}</p>
                      <p className="text-sm text-gray-700">{resource.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Manuscripts */}
        <Card className="shadow-lg mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-amiri text-yellow-600 mb-4 flex items-center justify-center">
              <i className="fas fa-scroll ml-3"></i>
              المخطوطات والوثائق التاريخية
            </CardTitle>
            <p className="text-gray-600">مصادر أولية من التراث القبطي</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {manuscripts.map((manuscript, index) => (
                <Card key={index} className="border-r-4 border-yellow-600">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center ml-4 flex-shrink-0">
                        <i className="fas fa-scroll text-white"></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-yellow-600 font-amiri mb-1">{manuscript.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{manuscript.date}</Badge>
                          <Badge variant="outline" className="text-xs">{manuscript.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{manuscript.location}</p>
                        <p className="text-sm text-gray-700">{manuscript.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Research Guidelines */}
        <Card className="shadow-lg mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-amiri text-red-600 mb-4 flex items-center justify-center">
              <i className="fas fa-search ml-3"></i>
              إرشادات البحث
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">للباحثين المبتدئين</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-600 mt-1 ml-2"></i>
                    ابدأ بالكتب العامة عن تاريخ الكنيسة القبطية
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-600 mt-1 ml-2"></i>
                    اطلع على المواقع الإلكترونية الرسمية
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-600 mt-1 ml-2"></i>
                    تعرف على العصور التاريخية المختلفة
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-600 mt-1 ml-2"></i>
                    ادرس السياق التاريخي لكل فترة
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">للباحثين المتقدمين</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <i className="fas fa-check text-blue-600 mt-1 ml-2"></i>
                    اعتمد على المصادر الأولية والمخطوطات
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-blue-600 mt-1 ml-2"></i>
                    قارن بين المصادر المختلفة
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-blue-600 mt-1 ml-2"></i>
                    ادرس اللغة القبطية واليونانية
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-blue-600 mt-1 ml-2"></i>
                    تواصل مع المؤسسات الأكاديمية
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <h2 className="text-3xl font-amiri mb-4">ابدأ رحلة البحث</h2>
              <p className="text-lg mb-6 text-blue-100">
                استخدم هذه المصادر لاستكشاف تاريخ الكنيسة القبطية الأرثوذكسية بعمق أكبر
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  onClick={() => setLocation("/")}
                  className="bg-yellow-400 text-black hover:bg-yellow-500 px-8 py-3 text-lg"
                >
                  <i className="fas fa-users ml-2"></i>
                  تصفح البطاركة
                </Button>
                <Button 
                  onClick={() => setLocation("/contact")}
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg"
                >
                  <i className="fas fa-envelope ml-2"></i>
                  اتصل بنا
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
