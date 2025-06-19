import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import logo from '@/assets/ice-delivery.webp';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loginAdmin = async () => {
    const loginURL = `https://ice-delivery.fly.dev/api/auth/user/login/${email}/${password}`;
    try {
      const response = await fetch(loginURL);
      const data = await response.text();
      verifyRes(data);
    } catch (err) {
      setError(`An error occurred. Please try again. ${err}`);
    }
  };

  const verifyRes = (data: string) => {
    if (
      data === '{"errorState":0,"message":"Email is invalid"}' ||
      data === '{"errorState":0,"message":"Password is invalid"}'
    ) {
      setError('Invalid email or password');
    } else if (!email || !password) {
      setError('You must fill in all fields');
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
          <Button className="w-full" onClick={loginAdmin}>
            Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;
