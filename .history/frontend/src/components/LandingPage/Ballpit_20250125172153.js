import { useRef, useEffect } from 'react';
import createBallpit from './ballpit-utility';

const Ballpit = ({ 
    className = '', 
    count = 200,
    gravity = 0.7,
    friction = 0.8,
    wallBounce = 0.95,
    followCursor = true,
    ...props 
}) => {
    const canvasRef = useRef(null);
    const spheresInstanceRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        spheresInstanceRef.current = createBallpit(canvas, {
            count,
            gravity,
            friction,
            wallBounce,
            followCursor,
            colors: [0x3b82f6, 0x8b5cf6, 0x6366f1], // Blue to purple gradient
            materialParams: {
                metalness: 0.8,
                roughness: 0.2,
                clearcoat: 1,
                clearcoatRoughness: 0.1,
            },
            ...props
        });

        return () => {
            if (spheresInstanceRef.current) {
                spheresInstanceRef.current.dispose();
            }
        };
    }, [count, gravity, friction, wallBounce, followCursor, props]);

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