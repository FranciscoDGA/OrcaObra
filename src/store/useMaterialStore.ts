import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Material } from '../lib/types';
import { read, write } from '../lib/storage';
import { generateId } from '../lib/id';

interface MaterialState {
  materials: Material[];
  loadMaterials: () => void;
  addMaterial: (data: Omit<Material, 'id' | 'lastUpdated'>) => Material;
  updateMaterial: (material: Material) => void;
  deleteMaterial: (id: string) => void;
}

export const useMaterialStore = create<MaterialState>()(
  persist(
    (set) => ({
      materials: [],

      loadMaterials: () => {
        const materials = read<Material[]>('materials', []);
        set({ materials });
      },

      addMaterial: (data: Omit<Material, 'id' | 'lastUpdated'>) => {
        const now = new Date().toISOString();
        const material: Material = {
          ...data,
          id: generateId(),
          lastUpdated: now,
        };
        const materials = read<Material[]>('materials', []);
        materials.push(material);
        write('materials', materials);
        set({ materials });
        return material;
      },

      updateMaterial: (material: Material) => {
        const materials = read<Material[]>('materials', []);
        const index = materials.findIndex((m) => m.id === material.id);
        if (index === -1) return;
        const updated = { ...material, lastUpdated: new Date().toISOString() };
        materials[index] = updated;
        write('materials', materials);
        set({ materials });
      },

      deleteMaterial: (id: string) => {
        const materials = read<Material[]>('materials', []);
        const filtered = materials.filter((m) => m.id !== id);
        write('materials', filtered);
        set({ materials: filtered });
      },
    }),
    {
      name: 'orcaobra-materials',
      partialize: (state) => ({ materials: state.materials }),
    }
  )
);
