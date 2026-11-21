let scene, camera, renderer, planeMesh, uniforms;
let targetMouse = { x: 0, y: 0 };
let currentMouse = { x: 0, y: 0 };
let animationFrameId = null;

// Custom GLSL Shader for 3D Depth Parallax & Specular Light Glint
const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform sampler2D uTexture;
    uniform vec2 uMouse;
    uniform float uIntensity;
    varying vec2 vUv;

    void main() {
        vec4 baseColor = texture2D(uTexture, vUv);
        // Estimate luminance as pseudo-depth map so bright 3D highlights shift more than dark shadows
        float depth = dot(baseColor.rgb, vec3(0.299, 0.587, 0.114));

        vec2 parallaxOffset = uMouse * depth * uIntensity;
        vec2 displacedUv = clamp(vUv + parallaxOffset, 0.002, 0.998);
        vec4 finalColor = texture2D(uTexture, displacedUv);

        // Subtle dynamic studio light sheen reacting to cursor tilt
        float lightDist = distance(vUv, 0.5 + uMouse * 0.4);
        float glint = smoothstep(0.6, 0.0, lightDist) * 0.14;
        finalColor.rgb += glint;

        gl_FragColor = finalColor;
    }
`;

function init3DViewer(imageUrl, intensity = 0.045) {
    const container = document.getElementById("three-canvas-container");
    if (!container) return;

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    container.innerHTML = "";

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 360;

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(imageUrl, (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        uniforms = {
            uTexture: { value: texture },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uIntensity: { value: intensity }
        };

        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader
        });

        planeMesh = new THREE.Mesh(geometry, material);
        scene.add(planeMesh);
        animate3D();
    });
}

function animate3D() {
    animationFrameId = requestAnimationFrame(animate3D);
    currentMouse.x += (targetMouse.x - currentMouse.x) * 0.08;
    currentMouse.y += (targetMouse.y - currentMouse.y) * 0.08;

    if (uniforms) {
        uniforms.uMouse.value.set(currentMouse.x, currentMouse.y);
    }
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Track mouse tilt inside preview stage
document.addEventListener("mousemove", (e) => {
    const modal = document.getElementById("preview-modal");
    if (!modal || modal.classList.contains("hidden")) return;

    const rect = modal.getBoundingClientRect();
    const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    targetMouse.x = normX;
    targetMouse.y = normY;

    const frame = document.getElementById("device-frame");
    if (frame) {
        frame.style.transform = `perspective(1200px) rotateY(${normX * 6}deg) rotateX(${normY * 6}deg)`;
    }
});

// Device Frame Switcher (Desktop / Phone / Tablet)
function setDeviceMode(mode) {
    const frame = document.getElementById("device-frame");
    const container = document.getElementById("three-canvas-container");
    const buttons = document.querySelectorAll(".device-btn");

    buttons.forEach(btn => {
        btn.classList.remove("bg-indigo-600", "text-white");
        btn.classList.add("bg-white/5", "text-zinc-400");
    });
    const activeBtn = document.getElementById(`btn-${mode}`);
    if (activeBtn) {
        activeBtn.classList.remove("bg-white/5", "text-zinc-400");
        activeBtn.classList.add("bg-indigo-600", "text-white");
    }

    if (mode === "desktop") {
        frame.className = "relative mx-auto transition-all duration-300 border-[6px] border-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/20 w-full max-w-2xl aspect-video bg-black";
    } else if (mode === "mobile") {
        frame.className = "relative mx-auto transition-all duration-300 border-[8px] border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-500/20 w-[260px] aspect-[9/19.5] bg-black";
    } else if (mode === "tablet") {
        frame.className = "relative mx-auto transition-all duration-300 border-[8px] border-zinc-800 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/20 w-[420px] aspect-[4/3] bg-black";
    }

    setTimeout(() => {
        if (renderer && container) {
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
    }, 310);
}

// Modal Open/Close Handlers
function openPreviewModal(card) {
    const title = card.dataset.title;
    const category = card.dataset.category;
    const price = card.dataset.price;
    const resolution = card.dataset.resolution;
    const image = card.dataset.image;
    const intensity = parseFloat(card.dataset.intensity || "0.045");

    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-category").innerText = category;
    document.getElementById("modal-price").innerText = `₹${price}`;
    document.getElementById("modal-resolution").innerText = resolution;
    document.getElementById("modal-buy-btn").innerText = `Unlock 8K Pack — ₹${price}`;

    const modal = document.getElementById("preview-modal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    setDeviceMode("desktop");
    setTimeout(() => init3DViewer(image, intensity), 50);
}

function closePreviewModal() {
    const modal = document.getElementById("preview-modal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
}

// Category Filtering
function filterCategory(category) {
    const cards = document.querySelectorAll(".wallpaper-card");
    const filterBtns = document.querySelectorAll(".filter-btn");

    filterBtns.forEach(btn => {
        btn.classList.remove("bg-white", "text-black");
        btn.classList.add("bg-white/5", "text-zinc-300");
    });
    const active = document.getElementById(`filter-${category}`);
    if (active) {
        active.classList.remove("bg-white/5", "text-zinc-300");
        active.classList.add("bg-white", "text-black");
    }

    cards.forEach(card => {
        if (category === "All" || card.dataset.category === category) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}