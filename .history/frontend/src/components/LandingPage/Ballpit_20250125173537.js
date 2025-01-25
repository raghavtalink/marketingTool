import { useRef, useEffect } from 'react';
import createBallpit from './ballpit-utility';

const Ballpit = ({ 
    count = 200,
    gravity = 0.7,
    friction = 0.8,
    wallBounce = 0.95,
    followCursor = true,
    colors = [0x3b82f6, 0x8b5cf6, 0x6366f1],
    className = '',
    ...props 
}) => {
    const canvasRef = useRef(null);
    const instanceRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        instanceRef.current = createBallpit(canvas, {
            count,
            gravity,
            friction,
            wallBounce,
            followCursor,
            colors,
            ...props
        });

        return () => {
            if (instanceRef.current) {
                instanceRef.current.dispose();
            }
        };
    }, [count, gravity, friction, wallBounce, followCursor, colors, props]);

    return (
        <canvas
            className={className}
            ref={canvasRef}
            style={{ 
                width: '100%', 
                height: '100%',
                background: 'transparent'
            }}
        />
    );
};

export default Ballpit;