import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-primary mb-2 text-sm font-semibold">404</p>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="text-muted-foreground mb-6 text-sm">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Button onClick={() => navigate('/deliveries')}>
        Back to deliveries
      </Button>
    </div>
  );
};

export default NotFound;
