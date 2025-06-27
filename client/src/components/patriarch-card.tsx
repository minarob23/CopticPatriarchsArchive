import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getArabicPatriarchName } from "@shared/patriarch-names";
import type { Patriarch } from "@shared/schema";

interface PatriarchCardProps {
  patriarch: Patriarch;
}

const eraLabels: Record<string, string> = {
  apostolic: "العصر الرسولي",
  golden: "العصر الذهبي",
  councils: "عصر المجامع",
  persecution: "عصر الاضطهاد",
  modern: "العصر الحديث",
};

const eraColors: Record<string, string> = {
  apostolic: "bg-blue-100 text-blue-800",
  golden: "bg-yellow-100 text-yellow-800",
  councils: "bg-purple-100 text-purple-800",
  persecution: "bg-red-100 text-red-800",
  modern: "bg-green-100 text-green-800",
};

export default function PatriarchCard({ patriarch }: PatriarchCardProps) {
  const arabicName = getArabicPatriarchName(patriarch.name);

  return (
    <Card className="patriarch-card bg-white shadow-lg hover:shadow-2xl border border-gray-200 overflow-hidden group">
      <CardHeader className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-reverse space-x-4">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <i className="fas fa-user text-blue-600 text-2xl"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold font-amiri leading-tight">{arabicName}</h3>
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

          {patriarch.heresiesFought.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                <i className="fas fa-shield-alt ml-2 text-red-500"></i>
                البدع المحاربة
              </h4>
              <div className="flex flex-wrap gap-2">
                {patriarch.heresiesFought.slice(0, 3).map((heresy, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {heresy}
                  </Badge>
                ))}
                {patriarch.heresiesFought.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{patriarch.heresiesFought.length - 3} المزيد
                  </Badge>
                )}
              </div>
            </div>
          )}
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
                {arabicName} - البابا {patriarch.orderNumber}
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
              {patriarch.heresiesFought.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-3 flex items-center">
                    <i className="fas fa-shield-alt ml-2"></i>
                    البدع المحاربة
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {patriarch.heresiesFought.map((heresy, index) => (
                      <Badge key={index} variant="outline" className="bg-white border-red-300 text-red-700">
                        {heresy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}