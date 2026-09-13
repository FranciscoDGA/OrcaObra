import { create } from 'zustand';
import type { Material } from '../lib/types';
import { repository } from '../lib/repository';

interface MaterialState {
  materials: Material[];
  loadMaterials: () => void;
  addMaterial: (data: Omit<Material, 'id' | 'lastUpdated'>) => Material;
  updateMaterial: (material: Material) => void;
  deleteMaterial: (id: string) => void;
}

export const useMaterialStore = create<MaterialState>()((set) => ({
  materials: repository.getMaterials(),

  loadMaterials: () => {
    set({ materials: repository.getMaterials() });
  },

  addMaterial: (data: Omit<Material, 'id' | 'lastUpdated'>) => {
    const material = repository.addMaterial(data);
    set((state) => ({ materials: [...state.materials, material] }));
    return material;
  },

  updateMaterial: (material: Material) => {
    repository.updateMaterial(material);
    set((state) => ({
      materials: state.materials.map((m) => (m.id === material.id ? material : m)),
    }));
  },

  deleteMaterial: (id: string) => {
    repository.deleteMaterial(id);
    set((state) => ({
      materials: state.materials.filter((m) => m.id !== id),
    }));
  },
}));
