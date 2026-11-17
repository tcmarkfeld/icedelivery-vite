import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const ProtectedLayout = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedLayout;
