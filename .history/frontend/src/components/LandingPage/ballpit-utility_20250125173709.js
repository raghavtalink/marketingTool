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

// ThreeBase class for basic setup
class ThreeBase {
    #options;
    canvas;
    camera;
    scene;
    renderer;
    size = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 };
    #clock = new Clock();
    #time = { elapsed: 0, delta: 0 };
    #animationFrame;
    #isAnimating = false;

    constructor(options) {
        this.#options = options;
        this.setupCamera();
        this.setupScene();
        this.setupRenderer();
        this.resize();
    }

    setupCamera() {
        this.camera = new PerspectiveCamera(75, 1, 0.1, 100);
        this.camera.position.set(0, 0, 20);
        this.camera.lookAt(0, 0, 0);
    }

    setupScene() {
        this.scene = new Scene();
    }

    setupRenderer() {
        this.canvas = this.#options.canvas;
        this.renderer = new WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.outputColorSpace = SRGBColorSpace;
        this.renderer.toneMapping = ACESFilmicToneMapping;
    }

    resize() {
        const parent = this.canvas.parentElement;
        const width = parent.offsetWidth;
        const height = parent.offsetHeight;
        
        this.size.width = width;
        this.size.height = height;
        this.size.ratio = width / height;
        
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    startAnimation(callback) {
        if (this.#isAnimating) return;
        
        const animate = () => {
            this.#animationFrame = requestAnimationFrame(animate);
            this.#time.delta = this.#clock.getDelta();
            this.#time.elapsed += this.#time.delta;
            callback(this.#time);
        };
        
        this.#isAnimating = true;
        this.#clock.start();
        animate();
    }

    dispose() {
        if (this.#animationFrame) {
            cancelAnimationFrame(this.#animationFrame);
        }
        this.renderer.dispose();
    }
}

// Ballpit class for sphere management
class Ballpit extends InstancedMesh {
    constructor(renderer, config = {}) {
        const environment = new RoomEnvironment();
        const pmrem = new PMREMGenerator(renderer);
        const envMap = pmrem.fromScene(environment).texture;
        
        const geometry = new SphereGeometry(1, 32, 32);
        const material = new MeshPhysicalMaterial({
            metalness: 0.5,
            roughness: 0.5,
            clearcoat: 1,
            clearcoatRoughness: 0.15,
            envMap,
            transparent: true,
            opacity: 0.9
        });

        super(geometry, material, config.count || 200);

        this.config = {
            count: 200,
            colors: [0x3b82f6, 0x8b5cf6, 0x6366f1],
            gravity: 0.7,
            friction: 0.8,
            wallBounce: 0.95,
            maxVelocity: 0.15,
            ...config
        };

        this.positions = new Float32Array(this.config.count * 3);
        this.velocities = new Float32Array(this.config.count * 3);
        this.dummy = new Object3D();
        
        this.initPositions();
        this.initColors();
    }

    initPositions() {
        for (let i = 0; i < this.config.count; i++) {
            const i3 = i * 3;
            this.positions[i3] = MathUtils.randFloatSpread(10);
            this.positions[i3 + 1] = MathUtils.randFloatSpread(10);
            this.positions[i3 + 2] = MathUtils.randFloatSpread(5);
        }
    }

    initColors() {
        const color = new Color();
        const colors = this.config.colors.map(c => new Color(c));
        
        for (let i = 0; i < this.config.count; i++) {
            const ratio = i / this.config.count;
            const colorIndex = Math.floor(ratio * (colors.length - 1));
            const nextColorIndex = Math.min(colorIndex + 1, colors.length - 1);
            const mixRatio = (ratio * (colors.length - 1)) % 1;
            
            color.copy(colors[colorIndex]).lerp(colors[nextColorIndex], mixRatio);
            this.setColorAt(i, color);
        }
        this.instanceColor.needsUpdate = true;
    }

    update(delta) {
        for (let i = 0; i < this.config.count; i++) {
            const i3 = i * 3;

            // Apply gravity
            this.velocities[i3 + 1] -= this.config.gravity * delta;

            // Apply velocities with friction
            for (let j = 0; j < 3; j++) {
                this.velocities[i3 + j] *= this.config.friction;
                this.positions[i3 + j] += this.velocities[i3 + j];
            }

            // Boundary checks and bouncing
            for (let j = 0; j < 3; j++) {
                const maxBound = j === 2 ? 5 : 10;
                if (Math.abs(this.positions[i3 + j]) > maxBound) {
                    this.positions[i3 + j] = Math.sign(this.positions[i3 + j]) * maxBound;
                    this.velocities[i3 + j] *= -this.config.wallBounce;
                }
            }

            // Update instance matrix
            this.dummy.position.fromArray(this.positions, i3);
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

    // Start animation loop
    base.startAnimation((time) => {
        ballpit.update(time.delta);
        base.renderer.render(base.scene, base.camera);
    });

    // Add cursor interaction
    if (options.followCursor) {
        const raycaster = new Raycaster();
        const plane = new Plane(new Vector3(0, 0, 1), 0);
        const mouse = new Vector2();
        const intersectPoint = new Vector3();

        canvas.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, base.camera);
            raycaster.ray.intersectPlane(plane, intersectPoint);
            
            // Add force to nearby balls
            for (let i = 0; i < ballpit.config.count; i++) {
                const i3 = i * 3;
                const dx = intersectPoint.x - ballpit.positions[i3];
                const dy = intersectPoint.y - ballpit.positions[i3 + 1];
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 3) {
                    const force = (1 - dist / 3) * 0.2;
                    ballpit.velocities[i3] += dx * force;
                    ballpit.velocities[i3 + 1] += dy * force;
                }
            }
        });
    }

    return {
        dispose: () => {
            base.dispose();
            ballpit.geometry.dispose();
            ballpit.material.dispose();
        }
    };
}

export default createBallpit;