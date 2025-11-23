import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../utils/api';
import { User } from '../types';
import colors from '../utils/colors';
import { User as UserIcon, Mail, Save } from 'lucide-react';

interface SettingsProps {
  user: User;
  setUser: (user: User | null) => void;
}

export default function Settings({ user, setUser }: SettingsProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Note: In a real app, you'd have an API endpoint to update user profile
      // For now, we'll just update local storage
      const updatedUser = { ...user, name, email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update profile' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: colors.textDark }}>Settings</h1>
        <p className="mt-2" style={{ color: colors.textLight }}>Manage your account settings</p>
      </div>

      <div className="max-w-2xl">
        <Card className="bg-white border mb-6" style={{ borderColor: colors.border }}>
          <CardHeader>
            <CardTitle style={{ color: colors.textDark }}>Profile Information</CardTitle>
            <CardDescription style={{ color: colors.textLight }}>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {message && (
                <div
                  className="p-3 rounded-md text-sm"
                  style={{
                    backgroundColor: message.type === 'success' ? `${colors.success}20` : `${colors.error}20`,
                    borderColor: message.type === 'success' ? colors.success : colors.error,
                    color: message.type === 'success' ? colors.success : colors.error,
                  }}
                >
                  {message.text}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                  <div className="flex items-center gap-2">
                    <UserIcon size={16} />
                    <span>Name</span>
                  </div>
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span>Email</span>
                  </div>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  disabled
                  className="opacity-60"
                />
                <p className="text-xs mt-1" style={{ color: colors.textLight }}>
                  Email cannot be changed
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: colors.accent, color: colors.white }}
                >
                  <Save size={16} className="mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white border" style={{ borderColor: colors.border }}>
          <CardHeader>
            <CardTitle style={{ color: colors.textDark }}>Account Information</CardTitle>
            <CardDescription style={{ color: colors.textLight }}>
              Your account details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: colors.border }}>
                <span className="text-sm font-medium" style={{ color: colors.textLight }}>User ID</span>
                <span className="text-sm font-mono" style={{ color: colors.textDark }}>{user.id}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: colors.border }}>
                <span className="text-sm font-medium" style={{ color: colors.textLight }}>Role</span>
                <span className="text-sm font-medium" style={{ color: colors.primary }}>{user.role}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

