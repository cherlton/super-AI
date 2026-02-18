import React, { useEffect, useRef, useState } from 'react';
import { Hero } from '../component/sections/Hero';
import { Features } from '../component/sections/Features';
import { DashboardPreview } from '../component/sections/DashboardPreview';
import { HowItWorks } from '../component/sections/HowItWorks';
import { Agents } from '../component/sections/Agents';
import { UseCases } from '../component/sections/UseCases';
import { TechStack } from '../component/sections/TechStack';
import { Pricing } from '../component/sections/Pricing';
import { CTA } from '../component/sections/CTA';
import { Footer } from '../component/sections/Footer';

/**
 * Animated Section Wrapper - Uses Intersection Observer for scroll-triggered animations
 * Slides in from left or right based on the direction prop
 */
interface AnimatedSectionProps {
    children: React.ReactNode;
    direction: 'left' | 'right';
    delay?: number;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
    children,
    direction,
    delay = 0
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Once visible, stay visible (no re-animation on scroll back)
                if (entry.isIntersecting) {
                    setTimeout(() => setIsVisible(true), delay);
                }
            },
            {
                threshold: 0.1, // Trigger when 10% of the element is visible
                rootMargin: '0px 0px -50px 0px', // Slightly before fully in view
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, [delay]);

    // Calculate transform based on direction
    const translateX = direction === 'left' ? '-100px' : '100px';

    return (
        <div
            ref={sectionRef}
            style={{
                transform: isVisible ? 'translateX(0)' : `translateX(${translateX})`,
                opacity: isVisible ? 1 : 0,
                transition: `transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)`,
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    );
};

export const LandingPage: React.FC = () => {
    return (
        <div className="overflow-x-hidden">
            {/* Header and Hero - No animation */}
            {/* Header and Hero - No animation */}
            <Hero />

            {/* Features - Slide from Left */}
            <AnimatedSection direction="left">
                <Features />
            </AnimatedSection>

            {/* Dashboard Preview - Slide from Right */}
            <AnimatedSection direction="right" delay={100}>
                <DashboardPreview />
            </AnimatedSection>

            {/* How It Works - Slide from Left */}
            <AnimatedSection direction="left">
                <HowItWorks />
            </AnimatedSection>

            {/* Agents - Slide from Right */}
            <AnimatedSection direction="right" delay={100}>
                <Agents />
            </AnimatedSection>

            {/* Use Cases - Slide from Left */}
            <AnimatedSection direction="left">
                <UseCases />
            </AnimatedSection>

            {/* Tech Stack - Slide from Right */}
            <AnimatedSection direction="right" delay={100}>
                <TechStack />
            </AnimatedSection>

            {/* Pricing - Slide from Left */}
            <AnimatedSection direction="left">
                <Pricing />
            </AnimatedSection>

            {/* CTA - Slide from Right */}
            <AnimatedSection direction="right" delay={100}>
                <CTA />
            </AnimatedSection>

            {/* Footer - Slide from Left */}
            <AnimatedSection direction="left">
                <Footer />
            </AnimatedSection>
        </div>
    );
};