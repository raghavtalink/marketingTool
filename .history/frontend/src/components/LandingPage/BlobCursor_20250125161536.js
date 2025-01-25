import { useTrail, animated } from '@react-spring/web'
import { useEffect, useCallback } from 'react';
import './BlobCursor.css';

const fast = { tension: 1200, friction: 40 };
const slow = { mass: 10, tension: 200, friction: 50 };
const trans = (x, y) => `translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`;

export default function BlobCursor({ fillColor = 'rgba(59, 130, 246, 0.6)' }) {
    const [trail, api] = useTrail(3, i => ({
        xy: [0, 0],
        config: i === 0 ? fast : slow,
    }));

    const handleMove = useCallback((e) => {
        console.log('Mouse moved:', e.clientX, e.clientY);
        api.start({ xy: [e.clientX, e.clientY] });
    }, [api]);

    useEffect(() => {
        window.addEventListener('mousemove', handleMove);
        return () => window.removeEventListener('mousemove', handleMove);
    }, [handleMove]);

    return (
        <div className='blob-container'>
            <svg style={{ position: 'fixed', width: 0, height: 0, zIndex: 99999 }}>
                <filter id="blob">
                    <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="10" />
                    <feColorMatrix
                        in="blur"
                        values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 35 -10"
                    />
                </filter>
            </svg>
            <div className='blob-main'>
                {trail.map((props, index) => (
                    <animated.div 
                        key={index} 
                        style={{
                            transform: props.xy.to(trans),
                            backgroundColor: fillColor,
                        }} 
                    />
                ))}
            </div>
        </div>
    );
}