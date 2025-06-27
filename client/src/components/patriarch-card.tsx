import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const period = `${patriarch.startYear}${patriarch.endYear ? ` - ${patriarch.endYear}` : ""} م`;
  
  return (
    <>
    <Card className="patriarch-card overflow-hidden">
      <div className="h-64 bg-gradient-to-b from-yellow-400 to-yellow-600 flex items-center justify-center">
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
          <i className="fas fa-user-tie text-6xl text-blue-600"></i>
        </div>
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-blue-600 mb-2 font-amiri">
          {patriarch.name}
        </h3>
        <p className="text-gray-600 mb-2">
          البابا {patriarch.orderNumber} ({period})
        </p>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {patriarch.contributions}
        </p>
        
        <div className="flex justify-between items-center">
          <Badge className={eraColors[patriarch.era] || "bg-gray-100 text-gray-800"}>
            {eraLabels[patriarch.era] || patriarch.era}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-600 hover:text-blue-700"
            onClick={() => setIsModalOpen(true)}
          >
            عرض التفاصيل
            <i className="fas fa-arrow-left mr-1"></i>
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Patriarch Details Modal */}
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-600 font-amiri">
            {patriarch.name}
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-600">
            البابا {patriarch.orderNumber} ({period})
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Era Badge */}
          <div className="flex justify-center">
            <Badge className={`${eraColors[patriarch.era] || "bg-gray-100 text-gray-800"} text-lg px-4 py-2`}>
              {eraLabels[patriarch.era] || patriarch.era}
            </Badge>
          </div>
          
          {/* Patriarch Image */}
          <div className="flex justify-center">
            <div className="w-32 h-32 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
              <i className="fas fa-user-tie text-6xl text-white"></i>
            </div>
          </div>
          
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">المعلومات الأساسية</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">الترتيب:</span>
                <span className="mr-2">البابا {patriarch.orderNumber}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">فترة الحكم:</span>
                <span className="mr-2">{period}</span>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-gray-600">العصر:</span>
                <span className="mr-2">{eraLabels[patriarch.era] || patriarch.era}</span>
              </div>
            </div>
          </div>
          
          {/* Contributions */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">المساهمات والأعمال</h4>
            <div className="bg-blue-50 border-r-4 border-blue-400 p-4 rounded">
              <p className="text-gray-700 leading-relaxed">
                {patriarch.contributions}
              </p>
            </div>
          </div>
          
          {/* Additional Details */}
          {patriarch.biography && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">السيرة والتفاصيل</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {patriarch.biography}
                </p>
              </div>
            </div>
          )}
          
          {/* Timeline */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-center text-sm text-gray-500">
              <i className="fas fa-clock mr-2"></i>
              تم تحديث المعلومات في عام 2025
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
