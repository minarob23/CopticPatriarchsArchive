
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

export default function ChurchHistory() {
  const [, setLocation] = useLocation();

  const eras = [
    {
      name: "العصر الرسولي",
      period: "33 - 100 م",
      description: "بداية المسيحية في مصر على يد القديس مرقس الرسول، وانتشار الإيمان المسيحي في الإسكندرية ووادي النيل.",
      keyEvents: [
        "وصول القديس مرقس إلى الإسكندرية عام 62 م",
        "تأسيس أول كنيسة في مصر",
        "انتشار المسيحية في صعيد مصر",
        "تأسيس مدرسة الإسكندرية اللاهوتية"
      ],
      color: "bg-blue-100 text-blue-800",
      icon: "fas fa-cross"
    },
    {
      name: "العصر الذهبي",
      period: "100 - 325 م",
      description: "عصر ازدهار المدرسة اللاهوتية في الإسكندرية وظهور عظماء اللاهوت والفكر المسيحي.",
      keyEvents: [
        "تطوير مدرسة الإسكندرية اللاهوتية",
        "ظهور العلامة أوريجانوس",
        "تطوير المناهج اللاهوتية",
        "انتشار الرهبنة في مصر"
      ],
      color: "bg-yellow-100 text-yellow-800",
      icon: "fas fa-graduation-cap"
    },
    {
      name: "عصر المجامع",
      period: "325 - 451 م",
      description: "فترة المجامع المسكونية ومحاربة البدع، وتأكيد العقيدة الأرثوذكسية.",
      keyEvents: [
        "مجمع نيقية الأول 325 م",
        "مجمع القسطنطينية 381 م",
        "مجمع أفسس 431 م",
        "مجمع خلقيدونية 451 م"
      ],
      color: "bg-purple-100 text-purple-800",
      icon: "fas fa-gavel"
    },
    {
      name: "عصر الاضطهاد",
      period: "451 - 640 م",
      description: "فترة الصراع مع الإمبراطورية البيزنطية وصمود الكنيسة القبطية في وجه الضغوط.",
      keyEvents: [
        "رفض مجمع خلقيدونية",
        "اضطهاد البيزنطيين للأقباط",
        "صمود الكنيسة القبطية",
        "تطوير الطقوس القبطية"
      ],
      color: "bg-red-100 text-red-800",
      icon: "fas fa-shield-alt"
    },
    {
      name: "العصر الحديث",
      period: "640 م - الآن",
      description: "من الفتح الإسلامي لمصر حتى اليوم، وتطور الكنيسة عبر العصور المختلفة.",
      keyEvents: [
        "الفتح الإسلامي لمصر 640 م",
        "التعايش مع الحكم الإسلامي",
        "النهضة القبطية الحديثة",
        "الكنيسة في العصر المعاصر"
      ],
      color: "bg-green-100 text-green-800",
      icon: "fas fa-calendar-alt"
    }
  ];

  const patriarchContributions = [
    {
      patriarch: "القديس مرقس الرسول",
      contribution: "تأسيس الكنيسة المصرية وكتابة الإنجيل الثاني",
      period: "العصر الرسولي"
    },
    {
      patriarch: "ديمتريوس الكرام",
      contribution: "تنظيم مدرسة الإسكندرية وتطوير النظام الرهباني",
      period: "العصر الذهبي"
    },
    {
      patriarch: "أثناسيوس الرسولي",
      contribution: "محاربة الآريوسية وتأكيد لاهوت المسيح",
      period: "عصر المجامع"
    },
    {
      patriarch: "كيرلس الكبير",
      contribution: "محاربة النسطورية وتأكيد وحدة طبيعة المسيح",
      period: "عصر المجامع"
    },
    {
      patriarch: "بنيامين الأول",
      contribution: "قيادة الكنيسة خلال الفتح الإسلامي",
      period: "العصر الحديث"
    },
    {
      patriarch: "كيرلس الرابع",
      contribution: "النهضة التعليمية والثقافية الحديثة",
      period: "العصر الحديث"
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
              <i className="fas fa-history text-4xl"></i>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold font-amiri mb-4 bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent">
              تاريخ الكنيسة القبطية الأرثوذكسية
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-6 leading-relaxed">
              رحلة عبر عشرين قرناً من الإيمان والصمود
            </p>
            <p className="text-lg text-blue-200 max-w-3xl mx-auto">
              من تأسيسها على يد القديس مرقس الرسول حتى يومنا هذا، 
              تحمل الكنيسة القبطية إرثاً عريقاً من الإيمان والتقليد الأرثوذكسي
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="container mx-auto px-4 py-12">
        <Card className="shadow-lg mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-amiri text-blue-600 mb-4">العصور التاريخية</CardTitle>
            <p className="text-gray-600">تطور الكنيسة القبطية عبر العصور المختلفة</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {eras.map((era, index) => (
                <div key={index} className="relative">
                  {index < eras.length - 1 && (
                    <div className="absolute right-8 top-16 w-0.5 h-full bg-gray-300"></div>
                  )}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white relative z-10">
                      <i className={`${era.icon} text-xl`}></i>
                    </div>
                    <div className="mr-6 flex-1">
                      <Card className="border-r-4 border-blue-600">
                        <CardHeader>
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                              <CardTitle className="text-xl font-amiri text-blue-600">{era.name}</CardTitle>
                              <p className="text-gray-600">{era.period}</p>
                            </div>
                            <Badge className={era.color}>{era.name}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 leading-relaxed mb-4">{era.description}</p>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">الأحداث الرئيسية:</h4>
                            <ul className="list-disc list-inside space-y-1 text-gray-600">
                              {era.keyEvents.map((event, eventIndex) => (
                                <li key={eventIndex}>{event}</li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Patriarchs */}
        <Card className="shadow-lg mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-amiri text-blue-600 mb-4">بطاركة مؤثرون في التاريخ</CardTitle>
            <p className="text-gray-600">أهم المساهمات البطريركية عبر العصور</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {patriarchContributions.map((item, index) => (
                <Card key={index} className="border-r-4 border-yellow-400">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center ml-4 flex-shrink-0">
                        <i className="fas fa-user text-blue-600"></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-blue-600 font-amiri">{item.patriarch}</h3>
                        <Badge className="mb-2 text-xs" variant="outline">{item.period}</Badge>
                        <p className="text-gray-700">{item.contribution}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Important Facts */}
        <Card className="shadow-lg mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-amiri text-blue-600 mb-4">حقائق مهمة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center bg-blue-50 p-6 rounded-lg">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-calendar text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-blue-600">62 م</h3>
                <p className="text-gray-700">تأسيس الكنيسة المصرية</p>
              </div>

              <div className="text-center bg-yellow-50 p-6 rounded-lg">
                <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-crown text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-yellow-600">118</h3>
                <p className="text-gray-700">عدد البطاركة حتى الآن</p>
              </div>

              <div className="text-center bg-green-50 p-6 rounded-lg">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-globe text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-green-600">20</h3>
                <p className="text-gray-700">قرناً من التاريخ</p>
              </div>

              <div className="text-center bg-purple-50 p-6 rounded-lg">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-book text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-purple-600">الأولى</h3>
                <p className="text-gray-700">مدرسة لاهوتية في التاريخ</p>
              </div>

              <div className="text-center bg-red-50 p-6 rounded-lg">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-church text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-red-600">الإسكندرية</h3>
                <p className="text-gray-700">مقر البطريركية التاريخي</p>
              </div>

              <div className="text-center bg-orange-50 p-6 rounded-lg">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-language text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-orange-600">القبطية</h3>
                <p className="text-gray-700">آخر مراحل اللغة المصرية القديمة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <h2 className="text-3xl font-amiri mb-4">استكشف المزيد</h2>
              <p className="text-lg mb-6 text-blue-100">
                تعرف على تفاصيل أكثر عن كل بطريرك ومساهماته في هذا التاريخ العريق
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
                  onClick={() => setLocation("/references")}
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg"
                >
                  <i className="fas fa-book ml-2"></i>
                  المراجع
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
