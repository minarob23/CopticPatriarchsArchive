
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loading from "@/components/ui/loading";

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/admin");
    }
  }, [isAuthenticated, setLocation]);

  const handleModalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    // Demo credentials validation
    if (username === "admin@coptic-patriarchs.org" && password === "CopticPatriarchs2025!") {
      // Create a demo user session in localStorage for demo purposes
      const demoUser = {
        id: "demo-admin",
        name: "مدير النظام",
        email: "admin@coptic-patriarchs.org",
        firstName: "المدير"
      };
      
      localStorage.setItem('demo-auth', JSON.stringify(demoUser));
      
      // Simulate successful login
      setTimeout(() => {
        setIsModalOpen(false);
        setLocation("/admin");
        setIsLoggingIn(false);
        // Force page reload to update auth state
        window.location.href = "/admin";
      }, 1000);
    } else {
      setLoginError("اسم المستخدم أو كلمة المرور غير صحيحة");
      setIsLoggingIn(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isAuthenticated) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
      {/* Home Button */}
      <Button
        onClick={() => setLocation("/")}
        variant="outline"
        className="fixed top-4 right-4 z-10 bg-white/90 backdrop-blur-sm border-blue-300 text-blue-600 hover:bg-blue-50"
      >
        <i className="fas fa-home ml-2"></i>
        الصفحة الرئيسية
      </Button>
      
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-cross text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-blue-600 font-amiri">
            بطاركة الكنيسة القبطية الأرثوذكسية
          </h1>
          <p className="text-gray-600 mt-2">
            لوحة تحكم إدارة بطاركة، يرجى تسجيل الدخول باستخدام حسابك المعتمد.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-blue-600 font-amiri">تسجيل الدخول</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Demo Account Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" dir="ltr">
              <div className="flex items-center mb-2">
                <i className="fas fa-info-circle text-blue-600 ml-2"></i>
                <span className="text-blue-800 font-semibold text-sm">Demo Account Information</span>
              </div>
              <div className="text-xs text-blue-700 space-y-1">
                <div><strong>Username:</strong> admin@coptic-patriarchs.org</div>
                <div><strong>Password:</strong> CopticPatriarchs2025!</div>
              </div>
            </div>

            {/* Modal Login Button */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  <i className="fas fa-sign-in-alt ml-2"></i>
                  تسجيل الدخول
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-center text-blue-600 font-amiri">
                    تسجيل الدخول للنظام
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleModalLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="username">اسم المستخدم</Label>
                    <Input
                      id="username"
                      type="email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin@coptic-patriarchs.org"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="CopticPatriarchs2025!"
                      required
                      className="mt-1"
                    />
                  </div>
                  {loginError && (
                    <div className="text-red-600 text-sm text-center">
                      {loginError}
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <>
                        <i className="fas fa-spinner fa-spin ml-2"></i>
                        جاري تسجيل الدخول...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt ml-2"></i>
                        دخول
                      </>
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Alternative Replit Login */}
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-3">أو</p>
              <Button 
                onClick={() => window.location.href = "/api/login"}
                variant="outline"
                className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <i className="fas fa-external-link-alt ml-2"></i>
                تسجيل الدخول بحساب Replit
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>© 2025 بطاركة الكنيسة القبطية الأرثوذكسية. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  );
}
