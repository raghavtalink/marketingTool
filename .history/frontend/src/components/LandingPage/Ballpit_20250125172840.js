import { useRef, useEffect } from 'react';
import createBallpit from './ballpit-utility';

const Ballpit = ({ 
    count = 200,
    gravity = 0.7,
    friction = 0.8,
    wallBounce = 0.95,
    followCursor = true,
    className = '',
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