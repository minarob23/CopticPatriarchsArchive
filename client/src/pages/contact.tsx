
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Contact() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    toast({
      title: "تم إرسال رسالتك",
      description: "شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن.",
    });
    setFormData({
      name: "",
      email: "",
      subject: "",
      category: "",
      message: ""
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const contactInfo = [
    {
      icon: "fas fa-envelope",
      title: "البريد الإلكتروني",
      content: "info@coptic-patriarchs.org",
      color: "text-blue-600"
    },
    {
      icon: "fas fa-phone",
      title: "الهاتف",
      content: "+20 2 1234-5678",
      color: "text-green-600"
    },
    {
      icon: "fas fa-map-marker-alt",
      title: "العنوان",
      content: "القاهرة، جمهورية مصر العربية",
      color: "text-red-600"
    },
    {
      icon: "fas fa-clock",
      title: "ساعات العمل",
      content: "الأحد - الخميس: 9:00 ص - 5:00 م",
      color: "text-purple-600"
    }
  ];

  const faqItems = [
    {
      question: "كيف يمكنني المساهمة في إثراء المحتوى؟",
      answer: "يمكنك إرسال معلومات موثقة أو مصادر جديدة عبر نموذج الاتصال، وسيقوم فريقنا بمراجعتها."
    },
    {
      question: "هل يمكنني استخدام المحتوى للأغراض الأكاديمية؟",
      answer: "نعم، يمكن استخدام المحتوى للأغراض التعليمية والأكاديمية مع ذكر المصدر."
    },
    {
      question: "كيف تتأكدون من دقة المعلومات؟",
      answer: "نعتمد على مصادر موثقة ومراجعة من قبل خبراء في التاريخ الكنسي."
    },
    {
      question: "هل تخططون لإضافة لغات أخرى؟",
      answer: "نعمل حالياً على إضافة النسخة الإنجليزية وربما لغات أخرى في المستقبل."
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
              <i className="fas fa-envelope text-4xl"></i>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold font-amiri mb-4 bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent">
              اتصل بنا
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-6 leading-relaxed">
              نحن هنا للإجابة على استفساراتكم ومساعدتكم
            </p>
            <p className="text-lg text-blue-200 max-w-3xl mx-auto">
              سواء كانت لديكم أسئلة أو اقتراحات أو ترغبون في المساهمة، 
              فنحن نرحب بتواصلكم معنا
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Contact Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-amiri text-blue-600 flex items-center">
                <i className="fas fa-paper-plane ml-3"></i>
                أرسل رسالة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم *
                    </label>
                    <Input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="اسمك الكامل"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      البريد الإلكتروني *
                    </label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع الاستفسار
                  </label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الاستفسار" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">استفسار عام</SelectItem>
                      <SelectItem value="content">تصحيح أو إضافة محتوى</SelectItem>
                      <SelectItem value="technical">مشكلة تقنية</SelectItem>
                      <SelectItem value="collaboration">تعاون أو شراكة</SelectItem>
                      <SelectItem value="feedback">ملاحظات واقتراحات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الموضوع *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="موضوع الرسالة"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الرسالة *
                  </label>
                  <Textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
                  <i className="fas fa-paper-plane ml-2"></i>
                  إرسال الرسالة
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-amiri text-blue-600 flex items-center">
                  <i className="fas fa-info-circle ml-3"></i>
                  معلومات الاتصال
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ml-4 ${info.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                        <i className={`${info.icon} ${info.color}`}></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{info.title}</h3>
                        <p className="text-gray-600">{info.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-amiri text-purple-600 flex items-center">
                  <i className="fas fa-users ml-3"></i>
                  فريق العمل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-user-tie text-white text-xl"></i>
                    </div>
                    <h3 className="font-semibold text-gray-800">فريق البحث التاريخي</h3>
                    <p className="text-sm text-gray-600">متخصصون في التاريخ الكنسي</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-code text-white text-xl"></i>
                    </div>
                    <h3 className="font-semibold text-gray-800">فريق التطوير التقني</h3>
                    <p className="text-sm text-gray-600">مطورون ومصممون</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="shadow-lg mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-amiri text-blue-600 mb-4 flex items-center justify-center">
              <i className="fas fa-question-circle ml-3"></i>
              الأسئلة الشائعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqItems.map((item, index) => (
                <Card key={index} className="border-r-4 border-yellow-400">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-start">
                      <i className="fas fa-question text-yellow-600 mt-1 ml-2 flex-shrink-0"></i>
                      {item.question}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card className="shadow-lg mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-amiri text-purple-600 mb-4">تابعنا على وسائل التواصل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center space-x-reverse space-x-6">
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                <i className="fab fa-facebook text-xl"></i>
              </Button>
              <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white">
                <i className="fab fa-twitter text-xl"></i>
              </Button>
              <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white">
                <i className="fab fa-youtube text-xl"></i>
              </Button>
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                <i className="fab fa-whatsapp text-xl"></i>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <h2 className="text-3xl font-amiri mb-4">نقدر تواصلكم معنا</h2>
              <p className="text-lg mb-6 text-blue-100">
                رأيكم واقتراحاتكم تساعدنا في تطوير الموقع وتحسين الخدمة
              </p>
              <Button 
                onClick={() => setLocation("/")}
                className="bg-yellow-400 text-black hover:bg-yellow-500 px-8 py-3 text-lg"
              >
                <i className="fas fa-home ml-2"></i>
                العودة للرئيسية
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
