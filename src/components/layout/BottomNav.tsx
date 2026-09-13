import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, Users, Settings } from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

const items: NavItem[] = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/orcamentos', label: 'Orçamentos', icon: FileText },
  { to: '/clients', label: 'Clientes', icon: Users },
  { to: '/config', label: 'Config', icon: Settings },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-slate-200">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-semibold transition-colors ${
                  isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
