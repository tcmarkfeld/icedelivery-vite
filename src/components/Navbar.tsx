import { Button } from '@/components/ui/button';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import logo from '@/assets/ice-delivery.webp';
import { cn } from '@/lib/utils';

const navLinks = [
  { to: '/', label: 'New Delivery' },
  { to: '/deliveries', label: 'Deliveries' },
];

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 md:px-8">
        <NavLink to="/" className="flex shrink-0 items-center gap-2">
          <img src={logo} alt="" className="h-7 w-7 object-contain" />
          <span className="hidden text-[15px] font-semibold tracking-tight sm:inline">
            Corolla Ice Delivery
          </span>
        </NavLink>
        <div className="flex flex-1 items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-muted-foreground"
        >
          <LogOut />
          <span className="hidden sm:inline">Log out</span>
        </Button>
      </div>
    </nav>
  );
}
