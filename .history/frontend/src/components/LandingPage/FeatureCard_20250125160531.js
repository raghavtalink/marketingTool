For, Our AI powered features, make those cards a good combination of these two type of cards:
1:
usage
import PixelCard from './PixelCard';

<PixelCard variant="pink">
  // your card content (use position: absolute)
</PixelCard>
code
 CSS
 Tailwind CSS
import { useEffect, useRef } from "react";
  import './PixelCard.css';
  
  class Pixel {
    constructor(canvas, context, x, y, color, speed, delay) {
      this.width = canvas.width;
      this.height = canvas.height;
      this.ctx = context;
      this.x = x;
      this.y = y;
      this.color = color;
      this.speed = this.getRandomValue(0.1, 0.9) * speed;
      this.size = 0;
      this.sizeStep = Math.random() * 0.4;
      this.minSize = 0.5;
      this.maxSizeInteger = 2;
      this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
      this.delay = delay;
      this.counter = 0;
      this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
      this.isIdle = false;
      this.isReverse = false;
      this.isShimmer = false;
    }
  
    getRandomValue(min, max) {
      return Math.random() * (max - min) + min;
    }
  
    draw() {
      const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
      this.ctx.fillStyle = this.color;
      this.ctx.fillRect(
        this.x + centerOffset,
        this.y + centerOffset,
        this.size,
        this.size
      );
    }
  
    appear() {
      this.isIdle = false;
      if (this.counter <= this.delay) {
        this.counter += this.counterStep;
        return;
      }
      if (this.size >= this.maxSize) {
        this.isShimmer = true;
      }
      if (this.isShimmer) {
        this.shimmer();
      } else {
        this.size += this.sizeStep;
      }
      this.draw();
    }
  
    disappear() {
      this.isShimmer = false;
      this.counter = 0;
      if (this.size <= 0) {
        this.isIdle = true;
        return;
      } else {
        this.size -= 0.1;
      }
      this.draw();
    }
  
    shimmer() {
      if (this.size >= this.maxSize) {
        this.isReverse = true;
      } else if (this.size <= this.minSize) {
        this.isReverse = false;
      }
      if (this.isReverse) {
        this.size -= this.speed;
      } else {
        this.size += this.speed;
      }
    }
  }
  
  function getEffectiveSpeed(value, reducedMotion) {
    const min = 0;
    const max = 100;
    const throttle = 0.001;
    const parsed = parseInt(value, 10);
  
    if (parsed <= min || reducedMotion) {
      return min;
    } else if (parsed >= max) {
      return max * throttle;
    } else {
      return parsed * throttle;
    }
  }
  
  /**
   *  You can change/expand these as you like.
   */
  const VARIANTS = {
    default: {
      activeColor: null,
      gap: 5,
      speed: 35,
      colors: "#f8fafc,#f1f5f9,#cbd5e1",
      noFocus: false
    },
    blue: {
      activeColor: "#e0f2fe",
      gap: 10,
      speed: 25,
      colors: "#e0f2fe,#7dd3fc,#0ea5e9",
      noFocus: false
    },
    yellow: {
      activeColor: "#fef08a",
      gap: 3,
      speed: 20,
      colors: "#fef08a,#fde047,#eab308",
      noFocus: false
    },
    pink: {
      activeColor: "#fecdd3",
      gap: 6,
      speed: 80,
      colors: "#fecdd3,#fda4af,#e11d48",
      noFocus: true
    }
  };
  
  export default function PixelCard({
    variant = "default",
    gap,
    speed,
    colors,
    noFocus,
    className = "",
    children
  }) {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const pixelsRef = useRef([]);
    const animationRef = useRef(null);
    const timePreviousRef = useRef(performance.now());
    const reducedMotion = useRef(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ).current;
  
    const variantCfg = VARIANTS[variant] || VARIANTS.default;
    const finalGap = gap ?? variantCfg.gap;
    const finalSpeed = speed ?? variantCfg.speed;
    const finalColors = colors ?? variantCfg.colors;
    const finalNoFocus = noFocus ?? variantCfg.noFocus;
  
    const initPixels = () => {
      if (!containerRef.current || !canvasRef.current) return;
  
      const rect = containerRef.current.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);
      const ctx = canvasRef.current.getContext("2d");
  
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      canvasRef.current.style.width = `${width}px`;
      canvasRef.current.style.height = `${height}px`;
  
      const colorsArray = finalColors.split(",");
      const pxs = [];
      for (let x = 0; x < width; x += parseInt(finalGap, 10)) {
        for (let y = 0; y < height; y += parseInt(finalGap, 10)) {
          const color =
            colorsArray[Math.floor(Math.random() * colorsArray.length)];
  
          const dx = x - width / 2;
          const dy = y - height / 2;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const delay = reducedMotion ? 0 : distance;
  
          pxs.push(
            new Pixel(
              canvasRef.current,
              ctx,
              x,
              y,
              color,
              getEffectiveSpeed(finalSpeed, reducedMotion),
              delay
            )
          );
        }
      }
      pixelsRef.current = pxs;
    };
  
    const doAnimate = (fnName) => {
      animationRef.current = requestAnimationFrame(() => doAnimate(fnName));
      const timeNow = performance.now();
      const timePassed = timeNow - timePreviousRef.current;
      const timeInterval = 1000 / 60; // ~60 FPS
  
      if (timePassed < timeInterval) return;
      timePreviousRef.current = timeNow - (timePassed % timeInterval);
  
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !canvasRef.current) return;
  
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  
      let allIdle = true;
      for (let i = 0; i < pixelsRef.current.length; i++) {
        const pixel = pixelsRef.current[i];
        pixel[fnName]();
        if (!pixel.isIdle) {
          allIdle = false;
        }
      }
      if (allIdle) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  
    const handleAnimation = (name) => {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(() => doAnimate(name));
    };
  
    const onMouseEnter = () => handleAnimation("appear");
    const onMouseLeave = () => handleAnimation("disappear");
    const onFocus = (e) => {
      if (e.currentTarget.contains(e.relatedTarget)) return;
      handleAnimation("appear");
    };
    const onBlur = (e) => {
      if (e.currentTarget.contains(e.relatedTarget)) return;
      handleAnimation("disappear");
    };
  
    useEffect(() => {
      initPixels();
      const observer = new ResizeObserver(() => {
        initPixels();
      });
      if (containerRef.current) {
        observer.observe(containerRef.current);
      }
      return () => {
        observer.disconnect();
        cancelAnimationFrame(animationRef.current);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finalGap, finalSpeed, finalColors, finalNoFocus]);
  
    return (
      <div
        ref={containerRef}
        className={`pixel-card ${className}`}
  
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
  
        onFocus={finalNoFocus ? undefined : onFocus}
        onBlur={finalNoFocus ? undefined : onBlur}
        tabIndex={finalNoFocus ? -1 : 0}
      >
        <canvas
          className="piexl-canvas"
          ref={canvasRef}
        />
        {children}
      </div>
    );
  }
CSS
.pixel-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.pixel-card {
  height: 400px;
  width: 300px;
  position: relative;
  overflow: hidden;
  display: grid;
  placeitems: center;
  aspectratio: 4 / 5;
  border: 1px solid #27272a;
  border-radius: 25px;
  isolation: isolate;
  transition: border-color 200ms cubic-bezier(0.5, 1, 0.89, 1);
  userselect: none;
}

.pixel-card::before {
  content: "";
  position: absolute;
  inset: 0;
  margin: auto;
  aspect-ratio: 1;
  background: radial-gradient(circle, #09090b, transparent 85%);
  opacity: 0;
  transition: opacity 800ms cubic-bezier(0.5, 1, 0.89, 1);
}

.pixel-card:hover::before,
.pixel-card:focus-within::before {
  opacity: 1;
}


2. usage
import SpotlightCard from './SpotlightCard';
  
<SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.2)">
<i class="fa fa-lock"></i>
<h2>Enhanced Security</h2>
<p>Our state of the art software offers peace of mind through the strictest security measures.</p>
<button>Learn more</button>
</SpotlightCard>
code
 CSS
 Tailwind CSS
import { useRef } from "react";
import "./SpotlightCard.css";

const SpotlightCard = ({ children, className = "", spotlightColor = "rgba(255, 255, 255, 0.25)" }) => {
const divRef = useRef(null);

const handleMouseMove = (e) => {
  const rect = divRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  divRef.current.style.setProperty("--mouse-x", `${x}px`);
  divRef.current.style.setProperty("--mouse-y", `${y}px`);
  divRef.current.style.setProperty("--spotlight-color", spotlightColor);
};

return (
  <div
    ref={divRef}
    onMouseMove={handleMouseMove}
    className={`card-spotlight ${className}`}
  >
    {children}
  </div>
);
};

export default SpotlightCard;
CSS
.card-spotlight {
position: relative;
border-radius: 1.5rem;
border: 1px solid #222;
background-color: #111;
padding: 2rem;
overflow: hidden;
--mouse-x: 50%;
--mouse-y: 50%;
--spotlight-color: rgba(255, 255, 255, 0.05);
}

.card-spotlight::before {
content: "";
position: absolute;
top: 0;
left: 0;
right: 0;
bottom: 0;
background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 80%);
opacity: 0;
transition: opacity 0.5s ease;
pointer-events: none;
}

.card-spotlight:hover::before,
.card-spotlight:focus-within::before {
opacity: 0.6;
}