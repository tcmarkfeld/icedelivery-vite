import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const ProtectedLayout = () => {
  return (
    <>
      <Navbar />
      <main className="px-4 pt-20">
        <Outlet />
      </main>
    </>
  );
};

export default ProtectedLayout;
