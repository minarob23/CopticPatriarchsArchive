export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-lg font-semibold text-primary font-amiri">جارٍ التحميل...</p>
      </div>
    </div>
  );
}
