import { create } from 'zustand';
import { temporal } from 'zundo';
import api from '../api/axios';

export const useStore = create(
  temporal(
    (set, get) => ({
      // Backend Save UI State
      isSaving: false,
      saveError: null,
      saveSuccess: false,
      isFetching: false,
      fetchError: null,
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
      savedDesigns: [],

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
      },

      saveDesignToBackend: async (productId) => {
        const state = get();
        set({ isSaving: true, saveError: null, saveSuccess: false });

        const design_data = {
          meshColors: state.meshColors,
          meshStickers: state.meshStickers,
          materialSettings: state.materialSettings,
          globalMaterial: state.globalMaterial,
        };

        try {
          if (!productId) {
            set({ isSaving: false, saveError: "Product ID is missing." });
            return false;
          }

          const response = await api.post('/product/save-design', {
            productId,
            productName: state.productName,
            design_data,
            designData: design_data, // Send both conventions to be safe
            // thumbnail_url: state.thumbnailUrl, 
          });

          if (response.data.success) {
            set({ isSaving: false, saveSuccess: true });
            console.log("Design saved to backend successfully:", response.data);
            // After saving, fetch again to keep list in sync
            get().fetchSavedDesigns();
            return true;
          }
          throw new Error(response.data.message || "Failed to save design");
        } catch (error) {
          const message = error.response?.data?.message || error.message || "An error occurred while saving";
          set({ isSaving: false, saveError: message });
          console.error("Backend save error:", error);
          return false;
        }
      },

      fetchSavedDesigns: async () => {
        set({ isFetching: true, fetchError: null });
        try {
          const response = await api.get('/product/designs');
          if (response.data.success) {
            // Map backend fields to frontend expectations if necessary
            const designs = (response.data.data || []).map(d => ({
              ...d,
              productName: d.designName || d.productName || (d.Product ? d.Product.name : 'Unnamed Design'),
              // Ensure design_data is accessible regardless of naming (designData vs design_data)
              design_data: d.designData || d.design_data
            }));

            set({
              savedDesigns: designs,
              isFetching: false
            });
            return true;
          }
          throw new Error(response.data.message || "Failed to fetch designs");
        } catch (error) {
          const message = error.response?.data?.message || error.message || "An error occurred while fetching designs";
          set({ isFetching: false, fetchError: message });
          console.error("Fetch designs error:", error);
          return false;
        }
      },

      loadDesign: (designId) => {
        const design = get().savedDesigns.find(d => d.id === designId);
        if (design) {
          const data = design.design_data || {};
          set({
            meshColors: data.meshColors || {},
            meshStickers: data.meshStickers || {},
            globalMaterial: data.globalMaterial || { color: '#ffffff', roughness: 0.5, metalness: 0.0 },
            materialSettings: data.materialSettings || {
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

      deleteDesign: async (designId) => {
        try {
          // You might want to add a backend call here: await api.delete(`/product/design/${designId}`);
          const updatedDesigns = get().savedDesigns.filter(d => d.id !== designId);
          set({ savedDesigns: updatedDesigns });
        } catch (error) {
          console.error("Delete design error:", error);
        }
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
