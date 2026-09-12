interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-sm ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
