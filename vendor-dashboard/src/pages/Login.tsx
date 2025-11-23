import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { User } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import colors from '../utils/colors';

interface LoginProps {
  setUser: (user: User) => void;
}

export default function Login({ setUser }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });

      const { user, token } = response.data;

      if (user.role !== 'VENDOR') {
        setError('Only vendors can access this dashboard');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
      <Card className="w-full max-w-md shadow-lg" style={{ backgroundColor: colors.white, borderColor: colors.border }}>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold" style={{ color: colors.primary }}>
            Bitcoin Transaction
          </CardTitle>
          <CardDescription className="text-lg" style={{ color: colors.textLight }}>
            Vendor Dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md text-sm" style={{ backgroundColor: `${colors.error}20`, borderColor: colors.error, color: colors.error }}>
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="vendor@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading} style={{ backgroundColor: colors.accent, color: colors.white }}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <p className="text-center text-sm" style={{ color: colors.textLight }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: colors.primary }} className="hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

