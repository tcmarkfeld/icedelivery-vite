import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import logo from '@/assets/ice-delivery.webp';

interface LoginCredentials {
  email: string;
  password: string;
}

const loginUser = async ({ email, password }: LoginCredentials): Promise<string> => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const loginURL = `${API_BASE_URL}/api/auth/user/login/${email}/${password}`;
  const response = await fetch(loginURL);
  return await response.text();
};

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      verifyRes(data);
    },
    onError: (err) => {
      setError(`An error occurred. Please try again. ${err}`);
    },
  });

  const loginAdmin = () => {
    if (!email || !password) {
      setError('You must fill in all fields');
      return;
    }
    setError('');
    loginMutation.mutate({ email, password });
  };

  const verifyRes = (data: string) => {
    if (
      data === '{"errorState":0,"message":"Email is invalid"}' ||
      data === '{"errorState":0,"message":"Password is invalid"}'
    ) {
      setError('Invalid email or password');
    } else {
      localStorage.setItem('token', data);
      navigate('/deliveries');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            <img src={logo} height={100} width={65} /> Corolla Ice Delivery
            Login
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            id="email-field"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="password-field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <p id="error-msg" className="text-center text-sm text-red-500">
              {error}
            </p>
          )}
          <Button className="w-full" onClick={loginAdmin} disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;
