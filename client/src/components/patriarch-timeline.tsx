import { Card, CardContent } from "@/components/ui/card";
import type { Patriarch } from "@shared/schema";

interface PatriarchTimelineProps {
  patriarchs: Patriarch[];
}

// Mock function for demonstration. Replace with actual implementation.
const getDisplayName = (patriarch: { arabicName?: string | null; name: string }): string => {
  return patriarch.arabicName || patriarch.name;
};

export default function PatriarchTimeline({ patriarchs }: PatriarchTimelineProps) {
  // Sort patriarchs by start year
  const sortedPatriarchs = [...patriarchs]
    .sort((a, b) => a.startYear - b.startYear)
    .slice(0, 10); // Show first 10 for timeline

  if (sortedPatriarchs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <i className="fas fa-timeline text-4xl text-gray-400 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">لا يوجد خط زمني</h3>
          <p className="text-gray-500">لا توجد بيانات كافية لعرض الخط الزمني</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute right-1/2 transform translate-x-1/2 w-1 h-full bg-yellow-400"></div>

      {/* Timeline items */}
      <div className="space-y-12">
        {sortedPatriarchs.map((patriarch, index) => (
          <div key={patriarch.id} className="relative flex items-center">
            {index % 2 === 0 ? (
              // Right side
              <>
                <div className="w-1/2 text-left pl-8">
                  <Card className="border-r-4 border-yellow-400">
                    <CardContent className="p-6">
                      <h4 className="font-bold text-blue-600 font-amiri">{getDisplayName(patriarch)}</h4>
                      <p className="text-sm text-gray-600">
                        {patriarch.startYear} - {patriarch.endYear || "الآن"} م
                      </p>
                      <p className="text-sm mt-2 line-clamp-2">{patriarch.contributions}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Timeline dot */}
                <div className="absolute right-1/2 transform translate-x-1/2 w-6 h-6 bg-yellow-400 rounded-full border-4 border-white shadow-lg"></div>

                <div className="w-1/2"></div>
              </>
            ) : (
              // Left side
              <>
                <div className="w-1/2"></div>

                {/* Timeline dot */}
                <div className="absolute right-1/2 transform translate-x-1/2 w-6 h-6 bg-yellow-400 rounded-full border-4 border-white shadow-lg"></div>

                <div className="w-1/2 text-right pr-8">
                  <Card className="border-l-4 border-yellow-400">
                    <CardContent className="p-6">
                      <h4 className="font-bold text-blue-600 font-amiri">{getDisplayName(patriarch)}</h4>
                      <p className="text-sm text-gray-600">
                        {patriarch.startYear} - {patriarch.endYear || "الآن"} م
                      </p>
                      <p className="text-sm mt-2 line-clamp-2">{patriarch.contributions}</p>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}