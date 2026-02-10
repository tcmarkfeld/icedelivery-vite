import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const ProtectedLayout = () => {
  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 via-slate-50 to-cyan-50">
      <Navbar />
      <main className="px-4 pt-20 pb-8 md:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedLayout;
