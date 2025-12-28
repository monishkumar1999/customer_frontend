import { create } from 'zustand';
import { temporal } from 'zundo';

export const useStore = create(
  temporal(
    (set, get) => ({
      // Phase Management
      phase: 1, // 1: Model, 2: UV, 3: Arrangement, 4: Design
      setPhase: (phase) => set({ phase }),

      // Phase 1: Mesh Data (from GLB)
      glbUrl: null,
      meshes: [], // [{ id, name, materialIndex, uvChannel }]
      globalMaterial: { color: '#ffffff', roughness: 0.5, metalness: 0.0 },
      setGlbUrl: (url) => set({ glbUrl: url }),
      setMeshes: (meshes) => set({ meshes }),

      // Product Details
      productName: "",
      subcategory: "",
      setProductName: (name) => set({ productName: name }),
      setSubcategory: (sub) => set({ subcategory: sub }),

      // Admin / Material Configuration
      materialSettings: {
        roughness: 0.75,
        metalness: 0.0,
        sheen: 0.6,
        sheenRoughness: 0.7,
        fabricStrength: 0.5,
        fabricType: 'plain',
        fabricScale: 8,
      },
      setMaterialSetting: (key, value) =>
        set((state) => ({
          materialSettings: {
            ...state.materialSettings,
            [key]: value
          }
        })),

      // NEW: Global Design State (Moved from components for Undo/Redo)
      meshColors: {}, // { [meshName]: color }
      meshStickers: {}, // { [meshName]: [stickers] }

      setMeshColor: (meshName, color) => set(state => ({
        meshColors: { ...state.meshColors, [meshName]: color }
      })),

      setMeshStickers: (meshName, stickers) => set(state => ({
        meshStickers: { ...state.meshStickers, [meshName]: stickers }
      })),

      resetDesignState: () => set({
        meshColors: {},
        meshStickers: {},
        globalMaterial: { color: '#ffffff', roughness: 0.5, metalness: 0.0 },
        materialSettings: {
          roughness: 0.75,
          metalness: 0.0,
          sheen: 0.6,
          sheenRoughness: 0.7,
          fabricStrength: 0.5,
          fabricType: 'plain',
          fabricScale: 8,
        }
      }),

      // Phase 2: UV Islands (from SVG)
      uvIslands: [],
      setUvIslands: (islands) => set({ uvIslands: islands }),
      updateUvLayout: (id, layout) => set(state => ({
        uvIslands: state.uvIslands.map(island =>
          island.id === id ? { ...island, layout: { ...island.layout, ...layout } } : island
        )
      })),
      linkMeshToIsland: (islandId, meshId) => set(state => ({
        uvIslands: state.uvIslands.map(island =>
          island.id === islandId ? { ...island, meshId } : island
        )
      })),

      // Phase 3 & 4: Shared Atlas State
      atlasCanvas: null,
      atlasVersion: 0,
      setAtlasCanvas: (canvas) => set({ atlasCanvas: canvas }),
      notifyAtlasUpdate: () => set(state => ({ atlasVersion: state.atlasVersion + 1 })),

      // Phase 4: Design Elements
      designElements: [],
      addDesignElement: (el) => set(state => ({ designElements: [...state.designElements, el] })),

      // UI State (Excluded from history)
      activeStickerUrl: null,
      setActiveStickerUrl: (url) => set({ activeStickerUrl: url }),

      // --- PERSISTENCE / SAVED DESIGNS ---
      savedDesigns: JSON.parse(localStorage.getItem('saved_designs') || '[]'),

      saveDesign: (productId) => {
        const state = get();
        const newDesign = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          productId: productId,
          productName: state.productName,
          meshColors: state.meshColors,
          meshStickers: state.meshStickers,
          globalMaterial: state.globalMaterial, // Save global material
          materialSettings: state.materialSettings,
          glbUrl: state.glbUrl,
        };
        const updatedDesigns = [newDesign, ...state.savedDesigns];
        set({ savedDesigns: updatedDesigns });
        localStorage.setItem('saved_designs', JSON.stringify(updatedDesigns));
      },

      loadDesign: (designId) => {
        const design = get().savedDesigns.find(d => d.id === designId);
        if (design) {
          set({
            meshColors: design.meshColors || {},
            meshStickers: design.meshStickers || {},
            globalMaterial: design.globalMaterial || { color: '#ffffff', roughness: 0.5, metalness: 0.0 },
            materialSettings: design.materialSettings || {
              roughness: 0.75,
              metalness: 0.0,
              sheen: 0.6,
              sheenRoughness: 0.7,
              fabricStrength: 0.5,
              fabricType: 'plain',
              fabricScale: 8,
            },
          });
          // Notify atlas update to trigger re-renders
          set(state => ({ atlasVersion: state.atlasVersion + 1 }));
          return true;
        }
        return false;
      },

      deleteDesign: (designId) => {
        const updatedDesigns = get().savedDesigns.filter(d => d.id !== designId);
        set({ savedDesigns: updatedDesigns });
        localStorage.setItem('saved_designs', JSON.stringify(updatedDesigns));
      }
    }),
    {
      partialize: (state) => {
        const { phase, activeStickerUrl, atlasCanvas, atlasVersion, glbUrl, meshes, savedDesigns, ...rest } = state;
        return rest;
      },
    }
  )
);

export default useStore;
