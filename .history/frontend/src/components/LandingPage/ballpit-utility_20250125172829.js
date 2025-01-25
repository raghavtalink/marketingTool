import {
    Clock,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    SRGBColorSpace,
    MathUtils,
    Vector2,
    Vector3,
    MeshPhysicalMaterial,
    ShaderChunk,
    Color,
    Object3D,
    InstancedMesh,
    PMREMGenerator,
    SphereGeometry,
    AmbientLight,
    PointLight,
    ACESFilmicToneMapping,
    Raycaster,
    Plane
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

class ThreeBase {
    #options;
    canvas;
    camera;
    cameraMinAspect;
    cameraMaxAspect;
    cameraFov;
    maxPixelRatio;
    minPixelRatio;
    scene;
    renderer;
    #postprocessing;
    size = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 };
    render = this.#renderScene;
    onBeforeRender = () => { };
    onAfterRender = () => { };
    onAfterResize = () => { };
    #isIntersecting = false;
    #isAnimating = false;
    isDisposed = false;
    #observer;
    #resizeObserver;
    #resizeTimeout;
    #clock = new Clock();
    #time = { elapsed: 0, delta: 0 };
    #animationFrame;

    constructor(options) {
        this.#options = { ...options };
        this.#setupCamera();
        this.#setupScene();
        this.#setupRenderer();
        this.resize();
        this.#setupEventListeners();
    }

    #setupCamera() {
        this.camera = new PerspectiveCamera(75, 1, 0.1, 100);
        this.camera.position.z = 20;
    }

    #setupScene() {
        this.scene = new Scene();
    }

    #setupRenderer() {
        if (this.#options.canvas) {
            this.canvas = this.#options.canvas;
        } else {
            console.error("Missing canvas parameter");
            return;
        }

        this.renderer = new WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.outputColorSpace = SRGBColorSpace;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    #setupEventListeners() {
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    handleResize() {
        if (this.#resizeTimeout) clearTimeout(this.#resizeTimeout);
        this.#resizeTimeout = setTimeout(() => this.resize(), 100);
    }

    resize() {
        const parent = this.canvas.parentElement;
        const width = parent.offsetWidth;
        const height = parent.offsetHeight;

        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    dispose() {
        window.removeEventListener('resize', this.handleResize.bind(this));
        this.renderer.dispose();
    }
}

// Ballpit class for sphere management
class Ballpit extends InstancedMesh {
    constructor(renderer, options = {}) {
        const defaults = {
            count: 200,
            colors: [0x3b82f6, 0x8b5cf6, 0x6366f1],
            minSize: 0.5,
            maxSize: 1,
            gravity: 0.7,
            friction: 0.8,
            wallBounce: 0.95
        };

        const config = { ...defaults, ...options };
        const environment = new RoomEnvironment();
        const pmremGenerator = new PMREMGenerator(renderer);
        const envMap = pmremGenerator.fromScene(environment).texture;

        const geometry = new SphereGeometry(1, 32, 32);
        const material = new MeshPhysicalMaterial({
            metalness: 0.8,
            roughness: 0.2,
            envMap: envMap,
            clearcoat: 1,
            clearcoatRoughness: 0.1
        });

        super(geometry, material, config.count);

        this.config = config;
        this.setupPhysics();
        this.setupColors();
    }

    setupPhysics() {
        this.positions = new Float32Array(this.count * 3);
        this.velocities = new Float32Array(this.count * 3);
        this.dummy = new Object3D();

        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3;
            this.positions[i3] = MathUtils.randFloatSpread(10);
            this.positions[i3 + 1] = MathUtils.randFloatSpread(10);
            this.positions[i3 + 2] = MathUtils.randFloatSpread(10);
        }
    }

    setupColors() {
        const color = new Color();
        for (let i = 0; i < this.count; i++) {
            const colorIndex = Math.floor(i / this.count * this.config.colors.length);
            color.setHex(this.config.colors[colorIndex]);
            this.setColorAt(i, color);
        }
    }

    update(delta) {
        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3;

            // Apply gravity
            this.velocities[i3 + 1] -= this.config.gravity * delta;

            // Apply velocities
            this.positions[i3] += this.velocities[i3] * delta;
            this.positions[i3 + 1] += this.velocities[i3 + 1] * delta;
            this.positions[i3 + 2] += this.velocities[i3 + 2] * delta;

            // Boundary checks
            if (Math.abs(this.positions[i3]) > 10) {
                this.positions[i3] = Math.sign(this.positions[i3]) * 10;
                this.velocities[i3] *= -this.config.wallBounce;
            }

            if (Math.abs(this.positions[i3 + 1]) > 10) {
                this.positions[i3 + 1] = Math.sign(this.positions[i3 + 1]) * 10;
                this.velocities[i3 + 1] *= -this.config.wallBounce;
            }

            if (Math.abs(this.positions[i3 + 2]) > 10) {
                this.positions[i3 + 2] = Math.sign(this.positions[i3 + 2]) * 10;
                this.velocities[i3 + 2] *= -this.config.wallBounce;
            }

            // Apply friction
            this.velocities[i3] *= this.config.friction;
            this.velocities[i3 + 1] *= this.config.friction;
            this.velocities[i3 + 2] *= this.config.friction;

            // Update instance
            this.dummy.position.set(
                this.positions[i3],
                this.positions[i3 + 1],
                this.positions[i3 + 2]
            );
            this.dummy.updateMatrix();
            this.setMatrixAt(i, this.dummy.matrix);
        }

        this.instanceMatrix.needsUpdate = true;
    }
}

// Main creation function
function createBallpit(canvas, options = {}) {
    const base = new ThreeBase({ canvas });
    const ballpit = new Ballpit(base.renderer, options);
    
    base.scene.add(ballpit);
    base.scene.add(new AmbientLight(0xffffff, 0.5));
    base.scene.add(new PointLight(0xffffff, 1));

    let animationFrame;
    const clock = new Clock();

    function animate() {
        animationFrame = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        ballpit.update(delta);
        base.renderer.render(base.scene, base.camera);
    }

    animate();

    return {
        dispose: () => {
            cancelAnimationFrame(animationFrame);
            base.dispose();
            ballpit.geometry.dispose();
            ballpit.material.dispose();
        }
    };
}

export default createBallpit;