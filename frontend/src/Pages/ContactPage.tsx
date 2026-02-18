import React, { useState } from 'react';
import { Footer } from '../component/sections/Footer';
import { Container } from '../component/layout/Container';
import { Card } from '../component/Card';
import { Button } from '../component/common/Button';

const contactInfo = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        label: 'Email',
        value: 'hello@insight-sphere.ai',
        href: 'mailto:hello@insight-sphere.ai',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        label: 'Office',
        value: '123 AI Boulevard, Tech City, TC 12345',
        href: '#',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
        ),
        label: 'Phone',
        value: '+1 (555) 123-4567',
        href: 'tel:+15551234567',
    },
];

const faqItems = [
    {
        question: 'How do I get started with Insight-Sphere?',
        answer: 'Simply sign up for a free account, connect your data sources, and our AI agents will start analyzing trends, sentiment, and creating learning paths for you.',
    },
    {
        question: 'What data sources does Insight-Sphere support?',
        answer: 'Currently, we support YouTube via the YouTube Data API v3. We are actively working on adding support for more social media platforms.',
    },
    {
        question: 'Is my data secure?',
        answer: 'Absolutely. We use OAuth authentication, API encryption, rate limiting, and are fully GDPR compliant. Your data security is our top priority.',
    },
    {
        question: 'Can I cancel my subscription anytime?',
        answer: 'Yes, you can cancel your subscription at any time. There are no long-term contracts or hidden cancellation fees.',
    },
];

export const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            console.log('Contact form:', formData);
            setIsLoading(false);
            setIsSubmitted(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-neutral-light-gray">


            {/* Hero Section */}
            <section className="pt-32 pb-16 hero-gradient text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-purple/20 rounded-full blur-3xl" />
                </div>
                <Container className="relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in touch</h1>
                        <p className="text-lg text-white/80">
                            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                        </p>
                    </div>
                </Container>
            </section>

            {/* Contact Section */}
            <section className="py-16 -mt-8 relative z-10">
                <Container>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <Card variant="elevated" padding="lg">
                                {!isSubmitted ? (
                                    <>
                                        <h2 className="text-2xl font-bold text-neutral-charcoal mb-6">Send us a message</h2>
                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                {/* Name Field */}
                                                <div>
                                                    <label htmlFor="name" className="block text-sm font-medium text-neutral-charcoal mb-2">
                                                        Your name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="name"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full px-4 py-3 rounded-xl border border-neutral-gray bg-white text-neutral-charcoal placeholder-neutral-dark-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue transition-all"
                                                        placeholder="John Doe"
                                                    />
                                                </div>

                                                {/* Email Field */}
                                                <div>
                                                    <label htmlFor="email" className="block text-sm font-medium text-neutral-charcoal mb-2">
                                                        Email address
                                                    </label>
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full px-4 py-3 rounded-xl border border-neutral-gray bg-white text-neutral-charcoal placeholder-neutral-dark-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue transition-all"
                                                        placeholder="you@example.com"
                                                    />
                                                </div>
                                            </div>

                                            {/* Subject Field */}
                                            <div>
                                                <label htmlFor="subject" className="block text-sm font-medium text-neutral-charcoal mb-2">
                                                    Subject
                                                </label>
                                                <select
                                                    id="subject"
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl border border-neutral-gray bg-white text-neutral-charcoal focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue transition-all"
                                                >
                                                    <option value="">Select a subject</option>
                                                    <option value="general">General Inquiry</option>
                                                    <option value="support">Technical Support</option>
                                                    <option value="sales">Sales & Pricing</option>
                                                    <option value="partnership">Partnership Opportunity</option>
                                                    <option value="feedback">Feedback & Suggestions</option>
                                                </select>
                                            </div>

                                            {/* Message Field */}
                                            <div>
                                                <label htmlFor="message" className="block text-sm font-medium text-neutral-charcoal mb-2">
                                                    Message
                                                </label>
                                                <textarea
                                                    id="message"
                                                    name="message"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    required
                                                    rows={5}
                                                    className="w-full px-4 py-3 rounded-xl border border-neutral-gray bg-white text-neutral-charcoal placeholder-neutral-dark-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue transition-all resize-none"
                                                    placeholder="Tell us how we can help..."
                                                />
                                            </div>

                                            {/* Submit Button */}
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                size="lg"
                                                isLoading={isLoading}
                                            >
                                                Send message
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </Button>
                                        </form>
                                    </>
                                ) : (
                                    /* Success State */
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                                            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-bold text-neutral-charcoal mb-2">Message sent!</h2>
                                        <p className="text-neutral-dark-gray mb-6">
                                            Thank you for reaching out. We'll get back to you within 24 hours.
                                        </p>
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                setIsSubmitted(false);
                                                setFormData({ name: '', email: '', subject: '', message: '' });
                                            }}
                                        >
                                            Send another message
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-6">
                            {/* Contact Cards */}
                            {contactInfo.map((info) => (
                                <Card key={info.label} variant="glass" padding="md" hoverEffect>
                                    <a href={info.href} className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-blue/10 to-primary-purple/10 flex items-center justify-center text-primary-blue flex-shrink-0">
                                            {info.icon}
                                        </div>
                                        <div>
                                            <p className="text-sm text-neutral-dark-gray mb-1">{info.label}</p>
                                            <p className="font-medium text-neutral-charcoal">{info.value}</p>
                                        </div>
                                    </a>
                                </Card>
                            ))}

                            {/* Social Links */}
                            <Card variant="outlined" padding="md">
                                <h3 className="font-semibold text-neutral-charcoal mb-4">Follow us</h3>
                                <div className="flex gap-3">
                                    {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                                        <a
                                            key={social}
                                            href="#"
                                            className="w-10 h-10 rounded-lg bg-neutral-light-gray flex items-center justify-center text-neutral-dark-gray hover:bg-primary-blue hover:text-white transition-colors"
                                        >
                                            <span className="text-xs font-semibold">{social[0]}</span>
                                        </a>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                </Container>
            </section>

            {/* FAQ Section */}
            <section className="py-16 bg-white">
                <Container>
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-3xl font-bold text-neutral-charcoal mb-4">Frequently asked questions</h2>
                        <p className="text-neutral-dark-gray">
                            Can't find the answer you're looking for? Reach out to our support team.
                        </p>
                    </div>

                    <div className="max-w-2xl mx-auto space-y-4">
                        {faqItems.map((faq, index) => (
                            <Card
                                key={index}
                                variant="outlined"
                                padding="none"
                                className="overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-light-gray/50 transition-colors"
                                >
                                    <span className="font-semibold text-neutral-charcoal">{faq.question}</span>
                                    <svg
                                        className={`w-5 h-5 text-neutral-dark-gray transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-40' : 'max-h-0'}`}
                                >
                                    <p className="px-6 pb-4 text-neutral-dark-gray">
                                        {faq.answer}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </Container>
            </section>

            <Footer />
        </div>
    );
};

export default ContactPage;
