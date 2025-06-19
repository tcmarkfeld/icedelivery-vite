import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/ice-delivery.webp';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-background-fp fixed top-0 right-0 left-0 z-50 flex w-full items-center border-b p-2">
      <div className="flex min-w-[225px] flex-row items-center gap-2 text-xl font-bold tracking-tight text-gray-800">
        <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />
        Corolla Ice Delivery
      </div>
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex">
          <Button variant="nav" onClick={() => navigate('/')}>
            Home
          </Button>
          <Button variant="nav" onClick={() => navigate('/deliveries')}>
            All Deliveries
          </Button>
        </div>
        <Button variant="nav" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </nav>
  );
}
