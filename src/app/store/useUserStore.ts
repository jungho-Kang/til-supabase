import { create } from "zustand";

interface UserState {
  name: string;
  email: string;
  uid: string;
  setUser: (name: string, email: string, uid: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  name: "",
  email: "",
  uid: "",
  setUser: (name, email, uid) => set({ name, email, uid }),
}));
