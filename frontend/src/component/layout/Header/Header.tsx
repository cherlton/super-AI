import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../../utils';
import { Container } from '../Container';
import { Button } from '../../common/Button';
import logo from '../../../assets/logo.png';
import { useAuth } from '../../../hooks';

interface NavLink {
    label: string;
    href: string;
    hasDropdown?: boolean;
}

const navLinks: NavLink[] = [
    { label: 'Product', href: '#product', hasDropdown: true },
    { label: 'Enterprise', href: '#enterprise' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Contact us', href: '/contact' },
];

export const Header: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isAuthenticated, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const isInternalPage = useMemo(() => {
        return ['/dashboard', '/settings'].includes(location.pathname);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        // Force a full page reload to clear all state
        window.location.href = '/';
        // Or use navigate and then reload:
        // navigate('/');
        // window.location.reload();
    };

    // Handle scroll styling
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        // Check immediately in case the page started slightly scrolled despite our efforts
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // --- FIXED SECTION ---
    // Force scroll to top on reload/load
    useEffect(() => {
        // 1. Tell the browser not to restore the previous scroll position automatically.
        // This is crucial for modern browsers (Chrome/Firefox) that try to remember where you were.
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        // 2. Immediate jump to the absolute top of the page.
        // We use instant behavior so it doesn't look like it's scrolling *back* up after load.
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
        });

        // Optional: If this header is unmounted (e.g., changing routes in a SPA),
        // you might want to reset restoration to auto so other pages behave normally.
        return () => {
            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'auto';
            }
        };
    }, []);
    // ---------------------

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <>
            {/* Header */}
            <header
                className={cn(
                    'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                    isScrolled || isMobileMenuOpen
                        ? 'bg-white/95 backdrop-blur-lg shadow-sm py-3'
                        : isInternalPage
                            ? 'bg-teal-900/30 backdrop-blur-md py-5'
                            : 'bg-transparent py-5'
                )}
            >
                <Container>
                    <nav className="flex items-center justify-between">
                        {/* Logo */}
                        <a href="/" className="flex items-center gap-2 z-50">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center">
                                <img src={logo}
                                    alt="logo" />
                            </div>
                            <span
                                className={cn(
                                    'font-bold text-xl transition-colors',
                                    (isScrolled || isMobileMenuOpen) ? 'text-neutral-charcoal' : 'text-white'
                                )}
                            >
                                Insight-Sphere
                            </span>
                        </a>

                        {/* Desktop Navigation Links */}
                        <div className="hidden lg:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className={cn(
                                        'text-sm font-medium transition-colors hover:text-primary-blue flex items-center gap-1',
                                        isScrolled ? 'text-neutral-dark-gray' : 'text-white/90'
                                    )}
                                >
                                    {link.label}
                                    {link.hasDropdown && (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    )}
                                </a>
                            ))}
                        </div>

                        {/* Desktop CTA Buttons */}
                        <div className="hidden lg:flex items-center gap-3">
                            {isAuthenticated ? (
                                <>
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className={cn(
                                            'flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-all',
                                            isScrolled
                                                ? 'text-neutral-charcoal hover:bg-neutral-light-gray'
                                                : 'text-white hover:bg-white/10'
                                        )}
                                        title="Go to Dashboard"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        <span>Dashboard</span>
                                    </button>
                                    <button
                                        onClick={() => navigate('/settings')}
                                        className={cn(
                                            'flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-all',
                                            isScrolled
                                                ? 'text-neutral-charcoal hover:bg-neutral-light-gray'
                                                : 'text-white hover:bg-white/10'
                                        )}
                                        title="Account Settings"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>Settings</span>
                                    </button>
                                    <Button
                                        onClick={handleLogout}
                                        variant={isScrolled ? 'ghost' : 'outline'}
                                        size="sm"
                                        className={cn(
                                            'text-sm font-semibold',
                                            !isScrolled && 'text-white border-white/30 hover:bg-white/10'
                                        )}
                                    >
                                        Log out
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        onClick={() => navigate('/login')}
                                        variant={isScrolled ? 'ghost' : 'outline'}
                                        size="sm"
                                        className={cn(!isScrolled && 'text-white border-white/30 hover:bg-white/10')}
                                    >
                                        Log in
                                    </Button>
                                    <Button
                                        onClick={() => navigate('/signup')}
                                        variant="primary"
                                        size="sm"
                                    >
                                        Sign up
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleMobileMenu}
                            className={cn(
                                'lg:hidden z-50 p-2 rounded-lg transition-colors',
                                isScrolled || isMobileMenuOpen
                                    ? 'text-neutral-charcoal hover:bg-neutral-light-gray'
                                    : 'text-white hover:bg-white/10'
                            )}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                // Close Icon (X)
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                // Hamburger Icon
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </nav>
                </Container>
            </header>

            {/* Mobile Menu Overlay */}
            <div
                className={cn(
                    'fixed inset-0 z-40 lg:hidden transition-all duration-300 ease-out',
                    isMobileMenuOpen
                        ? 'opacity-100 pointer-events-auto'
                        : 'opacity-0 pointer-events-none'
                )}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                    onClick={toggleMobileMenu}
                />

                {/* Mobile Menu Panel */}
                <div
                    className={cn(
                        'absolute inset-x-0 top-0 bg-white min-h-screen pt-20 pb-8 px-6',
                        'flex flex-col transition-all duration-300 ease-out',
                        isMobileMenuOpen
                            ? 'translate-y-0 opacity-100'
                            : '-translate-y-4 opacity-0'
                    )}
                >
                    {/* Navigation Links */}
                    <nav className="flex-1 py-6">
                        <ul className="space-y-2">
                            {navLinks.map((link, index) => (
                                <li
                                    key={link.label}
                                    className={cn(
                                        'transform transition-all duration-300 ease-out',
                                        isMobileMenuOpen
                                            ? 'translate-y-0 opacity-100'
                                            : 'translate-y-4 opacity-0'
                                    )}
                                    style={{
                                        transitionDelay: isMobileMenuOpen ? `${(index + 1) * 75}ms` : '0ms',
                                    }}
                                >
                                    <a
                                        href={link.href}
                                        className="flex items-center justify-between py-3 text-lg font-medium text-neutral-charcoal hover:text-primary-blue transition-colors"
                                        onClick={toggleMobileMenu}
                                    >
                                        <span>{link.label}</span>
                                        {link.hasDropdown && (
                                            <svg className="w-5 h-5 text-neutral-dark-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        )}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>


                    {/* Mobile CTA Buttons */}
                    <div className={cn(
                        'space-y-3 pt-6 border-t border-neutral-gray',
                        'transform transition-all duration-300 ease-out',
                        isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    )}>
                        {isAuthenticated ? (
                            <>
                                <button
                                    onClick={() => {
                                        toggleMobileMenu();
                                        navigate('/dashboard');
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary-blue text-white font-medium hover:bg-primary-dark-blue transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Go to Dashboard
                                </button>
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    fullWidth
                                    className="text-neutral-charcoal justify-center"
                                    onClick={() => {
                                        toggleMobileMenu();
                                        handleLogout();
                                    }}
                                >
                                    Log out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    fullWidth
                                    className="text-neutral-charcoal justify-center"
                                    onClick={() => {
                                        toggleMobileMenu();
                                        navigate('/login');
                                    }}
                                >
                                    Log in
                                </Button>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    className="justify-center"
                                    onClick={() => {
                                        toggleMobileMenu();
                                        navigate('/signup');
                                    }}
                                >
                                    Sign up
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header;