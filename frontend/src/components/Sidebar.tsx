import { NavLink } from 'react-router-dom'
import { Building2, Users, Receipt, Settings } from 'lucide-react'

const navItems = [
  { to: '/properties', label: 'Properties', icon: Building2 },
  { to: '/tenants', label: 'Tenants', icon: Users },
  { to: '/bills', label: 'Bills', icon: Receipt },
]

export default function Sidebar() {
  return (
    <aside className="w-56 h-screen bg-brand-sidebar-bg text-brand-sidebar-txt border-r border-brand-sidebar-secondary flex flex-col fixed left-0 top-0">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-brand-sidebar-txt">
        <div className="w-12 h-12 rounded-lg text-neutral-950 flex items-center justify-center font-semibold text-sm">
          <img src="/dome-logo.svg" alt="Dome logo" className="w-12 h-12" />
        </div>
        <span className="font-semibold text-xl text-brand-sidebar-primary tracking-tight">Dome</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-brand-sidebar-primary text-brand-sidebar-bg'
                  : 'text-brand-sidebar-txt hover:bg-brand-sidebar-secondary hover:text-brand-sidebar-txt'
              }`
            }
          >
            <Icon size={17} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-brand-sidebar-secondary">
        <button
          disabled
          title="Coming soon"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full text-brand-sidebar-txt cursor-not-allowed"
        >
          <Settings size={17} strokeWidth={1.75} />
          Settings
        </button>
      </div>
    </aside>
  )
}