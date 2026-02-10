import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import logo from '@/assets/ice-delivery.webp';
import { buildApiUrl } from '@/lib/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  errorState?: number;
  message?: string;
  token?: string;
}

function normalizeToken(value: string) {
  return value.trim().replace(/^['"]|['"]$/g, '');
}

function parseLoginToken(responseText: string) {
  const trimmedResponse = responseText.trim();

  try {
    const parsed = JSON.parse(trimmedResponse) as LoginResponse | string;

    if (typeof parsed === 'string') {
      return normalizeToken(parsed);
    }

    if (
      parsed.errorState === 0 ||
      parsed.message === 'Email is invalid' ||
      parsed.message === 'Password is invalid'
    ) {
      throw new Error('Invalid email or password');
    }

    if (typeof parsed.token === 'string' && parsed.token.length > 0) {
      return normalizeToken(parsed.token);
    }

    if (typeof parsed.message === 'string' && parsed.message.length > 0) {
      return normalizeToken(parsed.message);
    }
  } catch {
    return normalizeToken(trimmedResponse);
  }

  throw new Error('Login response did not include a token');
}

const loginUser = async ({
  email,
  password,
}: LoginCredentials): Promise<string> => {
  const response = await fetch(buildApiUrl('/api/auth/user/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error('Login request failed');
  }

  return parseLoginToken(responseText);
};

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (token) => {
      localStorage.setItem('token', token);
      navigate('/deliveries');
    },
    onError: (err) => {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }

      setError('An error occurred. Please try again.');
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6">
        <CardHeader>
          <CardTitle className="flex flex-col items-center justify-center text-center text-2xl">
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
          <Button
            className="w-full"
            onClick={loginAdmin}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;
