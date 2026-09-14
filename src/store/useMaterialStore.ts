import { create } from 'zustand';
import type { Material } from '../lib/types';
import { repositoryFacade } from '../lib/repository-facade';

interface MaterialState {
  materials: Material[];
  loadFromRepository: () => Promise<void>;
  loadMaterials: () => Promise<void>;
  addMaterial: (data: Omit<Material, 'id' | 'lastUpdated'>) => Promise<Material>;
  updateMaterial: (material: Material) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  clearAll: () => void;
}

export const useMaterialStore = create<MaterialState>()((set) => ({
  materials: [],

  loadFromRepository: async () => {
    const materials = await repositoryFacade.loadMaterials();
    set({ materials });
  },

  loadMaterials: async () => {
    const materials = await repositoryFacade.loadMaterials();
    set({ materials });
  },

  addMaterial: async (data: Omit<Material, 'id' | 'lastUpdated'>) => {
    const material = await repositoryFacade.addMaterial(data);
    set((state) => ({ materials: [...state.materials, material] }));
    return material;
  },

  updateMaterial: async (material: Material) => {
    await repositoryFacade.updateMaterial(material);
    set((state) => ({
      materials: state.materials.map((m) => (m.id === material.id ? material : m)),
    }));
  },

  deleteMaterial: async (id: string) => {
    await repositoryFacade.deleteMaterial(id);
    set((state) => ({
      materials: state.materials.filter((m) => m.id !== id),
    }));
  },

  clearAll: () => {
    set({ materials: [] });
  },
}));
