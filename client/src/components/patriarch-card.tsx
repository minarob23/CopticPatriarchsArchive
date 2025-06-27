import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const period = `${patriarch.startYear}${patriarch.endYear ? ` - ${patriarch.endYear}` : ""} م`;
  
  return (
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
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            عرض التفاصيل
            <i className="fas fa-arrow-left mr-1"></i>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
