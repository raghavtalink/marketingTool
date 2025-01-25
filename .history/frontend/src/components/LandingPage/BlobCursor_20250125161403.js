import { useTrail, animated } from '@react-spring/web'
import { useRef, useEffect, useCallback } from 'react';
import './BlobCursor.css';

const fast = { tension: 1200, friction: 40 };
const slow = { mass: 10, tension: 200, friction: 50 };
const trans = (x, y) => `translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`;

export default function BlobCursor({ blobType = 'circle', fillColor = 'rgba(59, 130, 246, 0.3)' }) {
    const [trail, api] = useTrail(3, i => ({
        xy: [0, 0],
        config: i === 0 ? fast : slow,
    }));

    const handleMove = useCallback((e) => {
        const x = e.clientX || (e.touches && e.touches[0].clientX);
        const y = e.clientY || (e.touches && e.touches[0].clientY);
        api.start({ xy: [x, y] });
    }, [api]);

    useEffect(() => {
        // Add event listeners to document instead of the container
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('touchmove', handleMove);

        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('touchmove', handleMove);
        };
    }, [handleMove]);

    return (
        <div className='blob-container'>
            <svg style={{ position: 'fixed', width: 0, height: 0, zIndex: 9999 }}>
                <filter id="blob">
                    <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="30" />
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
                            borderRadius: blobType === 'circle' ? '50%' : '0%',
                            backgroundColor: fillColor
                        }} 
                    />
                ))}
            </div>
        </div>
    );
}