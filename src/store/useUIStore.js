import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarOpen: true,
  globalLoading: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setGlobalLoading: (v) => set({ globalLoading: v }),
}));

export default useUIStore;
