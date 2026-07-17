import { create } from 'zustand';

/**
 * Cross-component UI state for the admin shell. The mobile navbar toggle is
 * shared between the header Burger and the navbar, and the pending navigation
 * marker is shared between the nav buttons and the content overlay.
 */
interface AdminUiState {
  navOpened: boolean;
  pendingHref: string | null;
  toggleNav: () => void;
  closeNav: () => void;
  setPendingHref: (href: string | null) => void;
}

export const useAdminUiStore = create<AdminUiState>((set) => ({
  navOpened: false,
  pendingHref: null,
  toggleNav: () => set((state) => ({ navOpened: !state.navOpened })),
  closeNav: () => set({ navOpened: false }),
  setPendingHref: (href) => set({ pendingHref: href }),
}));
