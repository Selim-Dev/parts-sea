interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'amber' | 'green' | 'indigo';
}

const colorMap: Record<KPICardProps['color'], { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
  green: { bg: 'bg-green-50', text: 'text-green-600' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
};

export default function KPICard({ title, value, icon, color }: KPICardProps) {
  const { bg, text } = colorMap[color];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg} ${text}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
      </div>
    </div>
  );
}
