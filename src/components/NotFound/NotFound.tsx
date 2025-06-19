import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-4 text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mb-6 text-gray-600">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Button onClick={() => navigate('/deliveries')}>Return to Home</Button>
    </div>
  );
};

export default NotFound;
