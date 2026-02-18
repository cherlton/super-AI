import { motion } from 'framer-motion';

export const AnimatedBackground = () => {
    const lines = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        delay: i * 0.2,
        duration: 6 + Math.random() * 4,
        startX: Math.random() * 100,
        startY: Math.random() * 100,
        angle: Math.random() * 360,
    }));

    const particles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        delay: i * 0.1,
        x: Math.random() * 100,
        y: Math.random() * 100,
    }));

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Main gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900" />

            {/* Overlay gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-tr from-teal-700/30 via-transparent to-blue-900/40" />

            {/* Animated gradient orbs */}
            <motion.div
                className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <motion.div
                className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.4, 0.2],
                    x: [0, -30, 0],
                    y: [0, -50, 0],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Animated lines */}
            {lines.map((line) => (
                <motion.div
                    key={line.id}
                    className="absolute h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent"
                    style={{
                        width: '400px',
                        left: `${line.startX}%`,
                        top: `${line.startY}%`,
                        transform: `rotate(${line.angle}deg)`,
                    }}
                    animate={{
                        x: ['-100%', '200vw'],
                        opacity: [0, 0.6, 0],
                    }}
                    transition={{
                        duration: line.duration,
                        delay: line.delay,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            ))}

            {/* Floating particles */}
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                    }}
                    animate={{
                        y: [0, -100, 0],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: 4 + Math.random() * 2,
                        delay: particle.delay,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
};
