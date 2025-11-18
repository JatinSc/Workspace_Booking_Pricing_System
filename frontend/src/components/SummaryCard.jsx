export default function SummaryCard({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}
