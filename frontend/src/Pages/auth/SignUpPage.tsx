import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { Container } from '../../component/layout/Container';
import { Card } from '../../component/Card';
import { Button } from '../../component/common/Button';
import logo from '../../assets/logo.png';
import { Eye, EyeOff } from 'lucide-react';

export const SignUpPage: React.FC = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register, isLoading, error } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
    });
    const [formError, setFormError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (formData.password !== formData.confirmPassword) {
            setFormError('Passwords do not match!');
            return;
        }
        const result = await register(formData.email, formData.password);
        if (result.success) {
            navigate('/login');
        } else {
            setFormError(result.error || 'Registration failed');
        }
    };

    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, label: '', color: '' };
        if (password.length < 6) return { strength: 25, label: 'Weak', color: 'bg-red-500' };
        if (password.length < 10) return { strength: 50, label: 'Fair', color: 'bg-yellow-500' };
        if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) return { strength: 100, label: 'Strong', color: 'bg-green-500' };
        return { strength: 75, label: 'Good', color: 'bg-blue-500' };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    return (
        <div className="min-h-screen hero-gradient flex items-center justify-center p-4 pt-20">
            <Container size="sm" className="flex justify-center items-center">
                <Card variant="glass" padding="lg" className="w-full max-w-[400px] backdrop-blur-xl shadow-2xl">
                    <div className="text-center mb-5">
                        <a href="/" className="inline-flex items-center gap-2 mb-3">
                            <img src={logo} alt="Insight-Sphere" className="w-9 h-9 rounded-xl" />
                            <span className="font-bold text-lg text-neutral-charcoal">Insight-Sphere</span>
                        </a>
                        <h1 className="text-xl font-bold text-neutral-charcoal mb-0.5">Create account</h1>
                        <p className="text-xs text-neutral-dark-gray">Join our AI-powered community</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {(formError || error) && (
                            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
                                {formError || error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="fullName" className="block text-xs font-medium text-neutral-charcoal mb-1">
                                Full name
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                className="w-full px-3.5 py-2 rounded-lg border border-neutral-gray bg-white/50 text-neutral-charcoal placeholder-neutral-dark-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue transition-all text-sm"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-xs font-medium text-neutral-charcoal mb-1">
                                Email address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-3.5 py-2 rounded-lg border border-neutral-gray bg-white/50 text-neutral-charcoal placeholder-neutral-dark-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue transition-all text-sm"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-medium text-neutral-charcoal mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={8}
                                    className="w-full px-3.5 py-2 rounded-lg border border-neutral-gray bg-white/50 text-neutral-charcoal placeholder-neutral-dark-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue transition-all pr-10 text-sm"
                                    placeholder="Min 8 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark-gray hover:text-primary-blue transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {formData.password && (
                                <div className="mt-1.5">
                                    <div className="h-1 bg-neutral-gray rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                            style={{ width: `${passwordStrength.strength}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-xs font-medium text-neutral-charcoal mb-1">
                                Confirm password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3.5 py-2 rounded-lg border border-neutral-gray bg-white/50 text-neutral-charcoal placeholder-neutral-dark-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue transition-all pr-10 text-sm"
                                    placeholder="Re-type password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark-gray hover:text-primary-blue transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <label className="flex items-start gap-2 cursor-pointer pt-0.5">
                            <input
                                type="checkbox"
                                name="agreeToTerms"
                                checked={formData.agreeToTerms}
                                onChange={handleChange}
                                required
                                className="w-3.5 h-3.5 mt-0.5 rounded border-neutral-gray text-primary-blue focus:ring-primary-blue/50"
                            />
                            <span className="text-xs text-neutral-dark-gray">
                                I agree to the <a href="/terms" className="text-primary-blue hover:underline">Terms</a> and <a href="/privacy" className="text-primary-blue hover:underline">Privacy</a>.
                            </span>
                        </label>

                        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading} className="!mt-3.5">
                            Create account
                        </Button>
                    </form>

                    <p className="text-center mt-5 text-xs text-neutral-dark-gray">
                        Already have an account?{' '}
                        <a href="/login" className="text-primary-blue hover:text-primary-dark-blue font-semibold">
                            Sign in
                        </a>
                    </p>
                </Card>
            </Container>
        </div>
    );
};

export default SignUpPage;