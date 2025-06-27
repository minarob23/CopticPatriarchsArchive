import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/ui/loading";

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/admin");
    }
  }, [isAuthenticated, setLocation]);

  if (isLoading) {
    return <Loading />;
  }

  if (isAuthenticated) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-cross text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-blue-600 font-amiri">
            بطاركة الكنيسة القبطية الأرثوذكسية
          </h1>
          <p className="text-gray-600 mt-2">لوحة تحكم الإدارة</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="font-amiri text-xl">
              <i className="fas fa-shield-alt ml-2"></i>
              تسجيل دخول الإدارة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <p className="text-gray-600 leading-relaxed">
                للوصول إلى لوحة تحكم الإدارة وإدارة بيانات البطاركة، يرجى تسجيل الدخول باستخدام حسابك المعتمد.
              </p>
            </div>

            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
              size="lg"
            >
              <i className="fas fa-sign-in-alt ml-2"></i>
              تسجيل الدخول
            </Button>

            <div className="mt-6 text-center">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = "/"}
                className="text-gray-600 hover:text-blue-600"
              >
                <i className="fas fa-arrow-right ml-2"></i>
                العودة للصفحة الرئيسية
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm">
            <i className="fas fa-lock text-green-500 ml-2"></i>
            اتصال آمن ومشفر
          </div>
        </div>
      </div>
    </div>
  );
}