import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { User } from '../types';
import { LayoutDashboard, Package, QrCode, History, LogOut, Settings } from 'lucide-react';
import colors from '../utils/colors';

interface LayoutProps {
  user: User;
  setUser: (user: User | null) => void;
}

export default function Layout({ user, setUser }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/qr-generator', icon: QrCode, label: 'QR Generator' },
    { path: '/transactions', icon: History, label: 'Transactions' },
  ];

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r flex flex-col" style={{ borderColor: colors.border }}>
          {/* Logo */}
          <div className="p-6 border-b" style={{ borderColor: colors.border }}>
            <h1 className="text-2xl font-bold" style={{ color: colors.primary }}>
              Bitcoin Transaction
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                             (item.path === '/dashboard' && location.pathname === '/');
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'font-medium'
                      : 'hover:bg-opacity-50'
                  }`}
                  style={{
                    backgroundColor: isActive ? colors.primary : 'transparent',
                    color: isActive ? colors.white : colors.textDark,
                  }}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t" style={{ borderColor: colors.border }}>
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white"
                style={{ backgroundColor: colors.primary }}
              >
                {getInitials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: colors.textDark }}>
                  {user.name}
                </p>
                <p className="text-xs truncate" style={{ color: colors.textLight }}>
                  {user.email}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/settings')}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-opacity-50 transition-colors mb-2"
              style={{ 
                color: colors.textDark,
                backgroundColor: 'transparent'
              }}
            >
              <Settings size={18} />
              <span className="text-sm">Settings</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-opacity-50 transition-colors"
              style={{ 
                color: colors.textDark,
                backgroundColor: 'transparent'
              }}
            >
              <LogOut size={18} />
              <span className="text-sm">Log out</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: colors.background }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

