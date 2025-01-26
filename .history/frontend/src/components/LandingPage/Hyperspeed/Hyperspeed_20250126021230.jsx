import { useEffect, useRef } from "react";
import { hyperspeedPresets } from './presets';
import { distortions } from './distortions';
import { App } from './classes/App';
import './Hyperspeed.css';

const Hyperspeed = ({ effectOptions = hyperspeedPresets.cyberpunk }) => {
  const hyperspeed = useRef(null);

  useEffect(() => {
    const container = hyperspeed.current;
    if (!container) return;

    // Clone the effect options and add the distortion
    const options = {
      ...effectOptions,
      distortion: distortions[effectOptions.distortion]
    };

    // Create and initialize the app
    const app = new App(container, options);
    app.loadAssets().then(() => app.init());

    // Cleanup
    return () => {
      if (app) {
        app.dispose();
      }
    };
  }, [effectOptions]);

  return <div id="lights" ref={hyperspeed}></div>;
};

export default Hyperspeed;