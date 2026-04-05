interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
}

export default function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-gray-300">{icon}</div>
      <p className="mt-4 text-sm text-gray-500">{message}</p>
    </div>
  );
}
