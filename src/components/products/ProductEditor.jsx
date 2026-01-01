import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import * as THREE from "three";
import api from "../../api/axios";
import DesignPhase from "../../3d/components/DesignPhase";
import { optimizeImage } from "../../utils/imageOptimizer";
import { useStore } from "../../store/useStore"; // Import useStore

// Helper to construct full URL for static assets
const getAssetUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${import.meta.env.VITE_API}/${cleanPath}`;
};

const ProductEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    // Since SetupPhase is missing, we default to 'design' and don't provide a way to switch back yet
    // unless the user plans to implement SetupPhase later.
    // For now, let's keep the phase state but defaulting to 'design' is correct.
    const [phase, setPhase] = useState('design');

    // -- Project Data --
    const [glbUrl, setGlbUrl] = useState(null);
    const [meshConfig, setMeshConfig] = useState({}); // { meshName: { maskUrl } }

    // -- Editor State --
    const [meshTextures, setMeshTextures] = useState({});
    const [activeStickerUrl, setActiveStickerUrl] = useState(null);

    // -- Store Actions --
    const {
        productName, subcategory, setProductName, setSubcategory,
        globalMaterial, setGlobalMaterial // Added setGlobalMaterial
    } = useStore();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/product/${id}`);

                if (response.data.success) {
                    const product = response.data.product;

                    // 1. Set GLB URL
                    setGlbUrl(getAssetUrl(product.base_model_url));

                    // 2. Set Mesh Config
                    const config = {};
                    if (product.meshes && Array.isArray(product.meshes)) {
                        product.meshes.forEach(mesh => {
                            config[mesh.meshName] = {
                                maskUrl: getAssetUrl(mesh.whiteMaskPath),
                                originalSvgPath: getAssetUrl(mesh.originalSvgPath)
                            };
                        });
                    }
                    setMeshConfig(config);

                    // 3. Populate Store for Edit Mode
                    setProductName(product.name);
                    setSubcategory(product.subCategoryId || product.subcategory_id);
                }
            } catch (error) {
                console.error("Failed to fetch product", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id, setProductName, setSubcategory]);

    const applyTexture = useCallback((meshName, dataUrl) => {
        if (!dataUrl) {
            setMeshTextures(prev => {
                const next = { ...prev };
                delete next[meshName];
                return next;
            });
            return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = dataUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');

            // Fill White (for mask logic)
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Texture
            ctx.drawImage(img, 0, 0);

            const solidDataUrl = canvas.toDataURL();
            const loader = new THREE.TextureLoader();
            const tex = loader.load(solidDataUrl);
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.flipY = false;

            setMeshTextures(prev => ({ ...prev, [meshName]: tex }));
        };
    }, []);

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-[#f8f9fc]">
                <div className="text-zinc-400 font-medium animate-pulse">Loading Product Editor...</div>
            </div>
        );
    }

    // Pass store's globalMaterial and setGlobalMaterial to DesignPhase
    return (
        <div className="w-full h-screen bg-[#f8f9fc] text-zinc-900 font-sans overflow-hidden">
            <DesignPhase
                productId={id}
                glbUrl={glbUrl}
                meshConfig={meshConfig}
                meshTextures={meshTextures}
                globalMaterial={globalMaterial}
                activeStickerUrl={activeStickerUrl}
                setGlobalMaterial={(val) => {
                    // val is { color, roughness, metalness, wireframe }
                    useStore.setState({ globalMaterial: { ...globalMaterial, ...val } });
                }}
                setActiveStickerUrl={setActiveStickerUrl}
                onBack={() => navigate('/products')}
                onUpdateTexture={applyTexture}
            />
        </div>
    );
};

export default ProductEditor;

