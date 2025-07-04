import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Patriarch } from "@shared/schema";
import { getArabicHeresyName } from "@shared/patriarch-names";

interface PatriarchCardProps {
  patriarch: Patriarch;
}

const eraLabels: Record<string, string> = {
  // Arabic keys (actual database values)
  "العصر الرسولي": "العصر الرسولي",
  "العصر الذهبي": "العصر الذهبي",
  "عصر المجامع": "عصر المجامع", 
  "عصر الاضطهاد": "عصر الاضطهاد",
  "العصر الحديث": "العصر الحديث",
  "العصر الإسلامي المبكر": "العصر الإسلامي المبكر",
  "العصر العثماني": "العصر العثماني",
  "العصر الفاطمي": "العصر الفاطمي",
  "العصر المملوكي المتأخر": "العصر المملوكي المتأخر",
  "العصر المملوكي": "العصر المملوكي",
  "العصر القبطي المستقل": "العصر القبطي المستقل",
  "العصر العثماني المتأخر": "العصر العثماني المتأخر",
  "العصر العباسي المبكر": "العصر العباسي المبكر",
  "العصر البيزنطي": "العصر البيزنطي",
  "العصر الأيوبي": "العصر الأيوبي",
  "العصر العباسي": "العصر العباسي",
  "العصر الفاطمي المتأخر": "العصر الفاطمي المتأخر",
  "عصر التحديث": "عصر التحديث",
  "العصر الحديث المبكر": "العصر الحديث المبكر",
  "العصر المعاصر": "العصر المعاصر",
  "العصر الأيوبي المتأخر": "العصر الأيوبي المتأخر",
  "العصر العثماني المبكر": "العصر العثماني المبكر",
  "العصر الأيوبي المبكر": "العصر الأيوبي المبكر",
  "العصر المملوكي المبكر": "العصر المملوكي المبكر",
  "عصر محمد علي": "عصر محمد علي",
  "العصر الفاطمي المبكر": "العصر الفاطمي المبكر"
};

const eraColors: Record<string, string> = {
  // Main eras
  "العصر الرسولي": "bg-blue-100 text-blue-800",
  "العصر الذهبي": "bg-yellow-100 text-yellow-800",
  "عصر المجامع": "bg-purple-100 text-purple-800",
  "عصر الاضطهاد": "bg-red-100 text-red-800",
  "العصر الحديث": "bg-green-100 text-green-800",
  
  // Islamic eras
  "العصر الإسلامي المبكر": "bg-teal-100 text-teal-800",
  "العصر العباسي": "bg-indigo-100 text-indigo-800",
  "العصر العباسي المبكر": "bg-indigo-50 text-indigo-700",
  "العصر الفاطمي": "bg-pink-100 text-pink-800",
  "العصر الفاطمي المبكر": "bg-pink-50 text-pink-700",
  "العصر الفاطمي المتأخر": "bg-pink-200 text-pink-900",
  
  // Ottoman and Mamluk eras
  "العصر العثماني": "bg-amber-100 text-amber-800",
  "العصر العثماني المبكر": "bg-amber-50 text-amber-700",
  "العصر العثماني المتأخر": "bg-amber-200 text-amber-900",
  "العصر المملوكي": "bg-orange-100 text-orange-800",
  "العصر المملوكي المبكر": "bg-orange-50 text-orange-700",
  "العصر المملوكي المتأخر": "bg-orange-200 text-orange-900",
  
  // Ayyubid era
  "العصر الأيوبي": "bg-cyan-100 text-cyan-800",
  "العصر الأيوبي المبكر": "bg-cyan-50 text-cyan-700",
  "العصر الأيوبي المتأخر": "bg-cyan-200 text-cyan-900",
  
  // Other periods
  "العصر البيزنطي": "bg-violet-100 text-violet-800",
  "العصر القبطي المستقل": "bg-emerald-100 text-emerald-800",
  "عصر التحديث": "bg-lime-100 text-lime-800",
  "العصر الحديث المبكر": "bg-green-50 text-green-700",
  "العصر المعاصر": "bg-slate-100 text-slate-800",
  "عصر محمد علي": "bg-rose-100 text-rose-800",
};

export default function PatriarchCard({ patriarch }: PatriarchCardProps) {
  const displayName = patriarch.arabicName || patriarch.name;

  return (
    <Card className="patriarch-card bg-white shadow-lg hover:shadow-2xl border border-gray-200 overflow-hidden group">
      <CardHeader className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-reverse space-x-4">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <i className="fas fa-user text-blue-600 text-2xl"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold font-amiri leading-tight">{displayName}</h3>
              <p className="text-blue-100">البابا {patriarch.orderNumber}</p>
            </div>
          </div>
          <Badge className={eraColors[patriarch.era] || "bg-yellow-400 text-black"}>
            {eraLabels[patriarch.era] || patriarch.era}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center text-gray-600">
            <i className="fas fa-calendar-alt ml-3 text-blue-600"></i>
            <span className="font-medium">
              {patriarch.startYear} - {patriarch.endYear || "الآن"} م
            </span>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <i className="fas fa-star ml-2 text-yellow-500"></i>
              المساهمات الرئيسية
            </h4>
            <p className="text-gray-600 leading-relaxed line-clamp-3">
              {patriarch.contributions}
            </p>
          </div>

          {(() => {
            let heresies: string[] = [];
            try {
              if (Array.isArray(patriarch.heresiesFought)) {
                heresies = patriarch.heresiesFought as string[];
              } else if (typeof patriarch.heresiesFought === 'string') {
                heresies = JSON.parse(patriarch.heresiesFought) as string[];
              } else if (patriarch.heresiesFought) {
                heresies = patriarch.heresiesFought as string[];
              }
            } catch (e) {
              heresies = [];
            }
            
            return heresies.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <i className="fas fa-shield-alt ml-2 text-red-500"></i>
                  البدع المحاربة
                </h4>
                <div className="flex flex-wrap gap-2">
                  {heresies.slice(0, 3).map((heresy, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {getArabicHeresyName(heresy)}
                    </Badge>
                  ))}
                  {heresies.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{heresies.length - 3} المزيد
                    </Badge>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              <i className="fas fa-book-open ml-2"></i>
              عرض التفاصيل
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-amiri text-blue-600 flex items-center">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center ml-4">
                  <i className="fas fa-user text-blue-600"></i>
                </div>
                {displayName} - البابا {patriarch.orderNumber}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-6">
              {/* Period */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <i className="fas fa-calendar-alt ml-2"></i>
                  فترة البطريركية
                </h3>
                <p className="text-blue-700">
                  {patriarch.startYear} - {patriarch.endYear || "الآن"} م
                </p>
              </div>

              {/* Era */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2 flex items-center">
                  <i className="fas fa-clock ml-2"></i>
                  العصر التاريخي
                </h3>
                <Badge className={eraColors[patriarch.era] || "bg-gray-100 text-gray-800"}>
                  {eraLabels[patriarch.era] || patriarch.era}
                </Badge>
              </div>

              {/* Contributions */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
                  <i className="fas fa-star ml-2"></i>
                  المساهمات والإنجازات
                </h3>
                <p className="text-yellow-700 leading-relaxed">
                  {patriarch.contributions}
                </p>
              </div>

              {/* Biography */}
              {patriarch.biography && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                    <i className="fas fa-book ml-2"></i>
                    السيرة الذاتية
                  </h3>
                  <p className="text-green-700 leading-relaxed">
                    {patriarch.biography}
                  </p>
                </div>
              )}

              {/* Heresies Fought */}
              {(() => {
                let heresies: string[] = [];
                try {
                  if (Array.isArray(patriarch.heresiesFought)) {
                    heresies = patriarch.heresiesFought as string[];
                  } else if (typeof patriarch.heresiesFought === 'string') {
                    heresies = JSON.parse(patriarch.heresiesFought) as string[];
                  } else if (patriarch.heresiesFought) {
                    heresies = patriarch.heresiesFought as string[];
                  }
                } catch (e) {
                  heresies = [];
                }
                
                return heresies.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-3 flex items-center">
                      <i className="fas fa-shield-alt ml-2"></i>
                      البدع المحاربة
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {heresies.map((heresy, index) => (
                        <Badge key={index} variant="outline" className="bg-white border-red-300 text-red-700">
                          {getArabicHeresyName(heresy)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}