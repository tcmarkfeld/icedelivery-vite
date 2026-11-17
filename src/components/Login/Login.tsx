import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
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
      'Accept': 'application/json',
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

  const loginAdmin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setError('You must fill in all fields');
      return;
    }
    setError('');
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={logo} alt="" className="mb-4 h-14 w-14 object-contain" />
          <h1 className="text-xl font-semibold tracking-tight">
            Corolla Ice Delivery
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Sign in to manage deliveries
          </p>
        </div>
        <form
          onSubmit={loginAdmin}
          className="space-y-4 rounded-xl border bg-white p-6 shadow-sm"
        >
          <div className="space-y-2">
            <Label htmlFor="email-field">Email</Label>
            <Input
              id="email-field"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-field">Password</Label>
            <Input
              id="password-field"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p id="error-msg" className="text-destructive text-sm">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending && <Loader2 className="animate-spin" />}
            {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
