import { useSettingsStore } from '../../store/useSettingsStore';

export default function Header() {
  const user = useSettingsStore((s) => s.user);
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          <span className="text-xl font-bold text-slate-900">Orça</span>
          <span className="text-xl font-bold text-teal-600">Obra</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold">
          {initial}
        </div>
      </div>
    </header>
  );
}
