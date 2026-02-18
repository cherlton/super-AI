import React, { useState } from 'react';
import { Container } from '../../component/layout/Container';
import { Card } from '../../component/Card';
import { Button } from '../../component/common/Button';
import logo from '../../assets/logo.png';

export const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            console.log('Reset password for:', email);
            setIsLoading(false);
            setIsSubmitted(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen hero-gradient flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-primary-purple/20 rounded-full blur-3xl" />
            </div>

            <Container size="sm" className="relative z-10">
                <Card variant="glass" padding="lg" className="max-w-md mx-auto backdrop-blur-xl">
                    {/* Logo & Header */}
                    <div className="text-center mb-8">
                        <a href="/" className="inline-flex items-center gap-2 mb-6">
                            <img src={logo} alt="Insight-Sphere" className="w-12 h-12 rounded-xl" />
                            <span className="font-bold text-xl text-neutral-charcoal">Insight-Sphere</span>
                        </a>

                        {!isSubmitted ? (
                            <>
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-blue/10 to-primary-purple/10 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-primary-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                </div>
                                <h1 className="text-2xl font-bold text-neutral-charcoal mb-2">Forgot your password?</h1>
                                <p className="text-neutral-dark-gray">
                                    No worries! Enter your email and we'll send you reset instructions.
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-100 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h1 className="text-2xl font-bold text-neutral-charcoal mb-2">Check your email</h1>
                                <p className="text-neutral-dark-gray">
                                    We've sent password reset instructions to <strong>{email}</strong>
                                </p>
                            </>
                        )}
                    </div>

                    {!isSubmitted ? (
                        /* Reset Password Form */
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-neutral-charcoal mb-2">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-neutral-gray bg-white/50 text-neutral-charcoal placeholder-neutral-dark-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                fullWidth
                                isLoading={isLoading}
                            >
                                Send reset instructions
                            </Button>
                        </form>
                    ) : (
                        /* Success State */
                        <div className="space-y-5">
                            <Button
                                variant="primary"
                                size="lg"
                                fullWidth
                                onClick={() => window.open('https://mail.google.com', '_blank')}
                            >
                                Open email app
                            </Button>

                            <p className="text-center text-sm text-neutral-dark-gray">
                                Didn't receive the email?{' '}
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="text-primary-blue hover:underline font-medium"
                                >
                                    Click to resend
                                </button>
                            </p>
                        </div>
                    )}

                    {/* Back to Login Link */}
                    <a
                        href="/login"
                        className="flex items-center justify-center gap-2 mt-8 text-neutral-dark-gray hover:text-primary-blue transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="font-medium">Back to sign in</span>
                    </a>
                </Card>
            </Container>
        </div>
    );
};

export default ForgotPasswordPage;
