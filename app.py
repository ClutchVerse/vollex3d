import os
from flask import Flask, render_template, jsonify

app = Flask(__name__)

# Sample 3D Wallpaper Catalog (Replace image URLs with '/static/previews/your-file.webp' later)
WALLPAPERS = [
    {
        "id": "vlx-01",
        "title": "CHASE THE HORIZON",
        "category": "by VOLLEX3D",
        "price": 149,
        "resolution": "8K (7680x4320) + Mobile 4K",
        "depth_intensity": 0.045,
        "image": "/static/previews/vollex-01.png",
        "tag": "BESTSELLER"
    },
    {
        "id": "vlx-02",
        "title": "COLOUR IN MOTION",
        "category": "by VOLLEX3D",
        "price": 199,
        "resolution": "8K + Live Loop (.MP4)",
        "depth_intensity": 0.06,
        "image": "/static/previews/vollex-02.png",
        "tag": "LIVE 3D"
    },
    {
        "id": "vlx-03",
        "title": "AMOLED Void Spheres",
        "category": "AMOLED",
        "price": 99,
        "resolution": "4K Desktop + Mobile",
        "depth_intensity": 0.035,
        "image": "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=1200&q=80",
        "tag": "NEW"
    },
    {
        "id": "vlx-04",
        "title": "Iridescent Glass Waves",
        "category": "Minimal",
        "price": 149,
        "resolution": "8K (7680x4320)",
        "depth_intensity": 0.04,
        "image": "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1200&q=80",
        "tag": "POPULAR"
    },
    {
        "id": "vlx-05",
        "title": "Solaris Eclipse Ring",
        "category": "AMOLED",
        "price": 249,
        "resolution": "8K + Live Loop + Raw Blend",
        "depth_intensity": 0.055,
        "image": "https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?auto=format&fit=crop&w=1200&q=80",
        "tag": "PRO PACK"
    },
    {
        "id": "vlx-06",
        "title": "Hyperdrive Prism Grid",
        "category": "Cyberpunk",
        "price": 179,
        "resolution": "8K Desktop + Mobile",
        "depth_intensity": 0.05,
        "image": "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80",
        "tag": "TRENDING"
    }
]

@app.route("/")
def home():
    return render_template("index.html", wallpapers=WALLPAPERS)

@app.route("/api/wallpapers")
def get_wallpapers():
    return jsonify(WALLPAPERS)

@app.route("/health")
def health():
    return jsonify({"status": "ok"}), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)