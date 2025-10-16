export default function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <p className="font-bold text-pinktheme mb-2">{title}</p>
      {children}
    </div>
  );
}
