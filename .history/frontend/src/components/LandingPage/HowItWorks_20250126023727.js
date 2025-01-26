import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Hyperspeed from './Hyperspeed/Hyperspeed';
import './HowItWorks.css';

const TimelineItem = ({ step, title, description, delay }) => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.2
    });

    return (
        <motion.div
            ref={ref}
            className="timeline-item"
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay }}
        >
            <div className="timeline-step">{step}</div>
            <div className="timeline-content">
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
        </motion.div>
    );
};

const HowItWorks = () => {
    const steps = [
        {
            step: '01',
            title: 'Connect Your Store',
            description: 'Seamlessly integrate your e-commerce platform with SelloVate.'
        },
        {
            step: '02',
            title: 'Import Products',
            description: 'Automatically sync your product catalog and inventory data.'
        },
        {
            step: '03',
            title: 'Optimize Listings',
            description: 'Let AI enhance your product listings for maximum visibility.'
        }
    ];

    return (
        <section className="how-it-works-section">
            <div className="hyperspeed-background">
            <Hyperspeed 
effectOptions={
  onSpeedUp: () => { },
  onSlowDown: () => { },
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 4,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [400 * 0.03, 400 * 0.2],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x000000,
    shoulderLines: 0xFFFFFF,
    brokenLines: 0xFFFFFF,
    leftCars: [0xD856BF, 0x6750A2, 0xC247AC],
    rightCars: [0x03B3C3, 0x0E5EA5, 0x324555],
    sticks: 0x03B3C3,
  }
}
/>
            </div>
            <div className="content-wrapper">
                <h2 className="section-title">How SelloVate Works</h2>
                <div className="timeline-container">
                    {steps.map((step, index) => (
                        <TimelineItem
                            key={index}
                            {...step}
                            delay={index * 0.2}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;