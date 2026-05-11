import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "sakura" | "matcha" | "ocean" | "sunset";

interface UserProfile {
  id: string;
  name: string;
  city: string;
  isPro: boolean;
  points: number;
  coins: number;
  streak: number;
  lastLoginDate: string;
  inventory: string[];
  activeTitle?: string;
  activeAvatar?: string;
  stats: {
    played: number;
    won: number;
  };
  theme: Theme;
}

interface UserState {
  user: UserProfile | null;
  users: Record<string, UserProfile>;
  login: (name: string, city: string) => void;
  logout: () => void;
  upgradeToPro: () => void;
  cancelPro: () => void;
  addWin: (points: number, diffCoins: number) => void;
  setTheme: (theme: Theme) => void;
  buyItem: (itemId: string, cost: number) => boolean;
  equipTitle: (title: string) => void;
  setAvatar: (avatar: string) => void;
  useStreakFreeze: () => boolean;
  checkStreak: () => { freezeUsed: number; streakReset: boolean };
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      users: {},
      login: (name, city) => {
        const today = new Date().toISOString().split("T")[0];
        const key = `${name}-${city}`.toLowerCase();
        const state = get();
        
        if (state.users[key]) {
          // Restore existing user
          set({ user: state.users[key] });
        } else {
          // Create new user
          const newUser: UserProfile = {
            id: Math.random().toString(36).substring(7),
            name,
            city: city || "Unknown City",
            isPro: false,
            points: 100,
            coins: 500, // Starter coins
            streak: 1,
            lastLoginDate: today,
            inventory: [],
            stats: { played: 0, won: 0 },
            theme: "dark",
          };
          set({
            user: newUser,
            users: { ...state.users, [key]: newUser },
          });
        }
      },
      logout: () => {
        const state = get();
        if (state.user) {
          const key = `${state.user.name}-${state.user.city}`.toLowerCase();
          set({ 
            users: { ...state.users, [key]: state.user },
            user: null 
          });
        }
      },
      cancelPro: () => {
        const state = get();
        if (state.user) {
          const key = `${state.user.name}-${state.user.city}`.toLowerCase();
          const updatedUser = { ...state.user, isPro: false };
          set({
            user: updatedUser,
            users: { ...state.users, [key]: updatedUser },
          });
        }
      },
      setAvatar: (avatar) => {
        const state = get();
        if (state.user) {
          const key = `${state.user.name}-${state.user.city}`.toLowerCase();
          const updatedUser = { ...state.user, activeAvatar: avatar };
          set({
            user: updatedUser,
            users: { ...state.users, [key]: updatedUser },
          });
        }
      },
      upgradeToPro: () => {
        const state = get();
        if (state.user) {
          const key = `${state.user.name}-${state.user.city}`.toLowerCase();
          const updatedUser = { ...state.user, isPro: true };
          set({
            user: updatedUser,
            users: { ...state.users, [key]: updatedUser },
          });
        }
      },
      addWin: (points, diffCoins) => {
        const state = get();
        if (state.user) {
          const key = `${state.user.name}-${state.user.city}`.toLowerCase();
          const updatedUser = {
            ...state.user,
            points: state.user.points + points,
            coins: (state.user.coins || 0) + diffCoins,
            stats: {
              played: state.user.stats.played + 1,
              won: state.user.stats.won + 1,
            },
          };
          set({
            user: updatedUser,
            users: { ...state.users, [key]: updatedUser },
          });
        }
      },
      setTheme: (theme) => {
        const state = get();
        if (state.user) {
          const key = `${state.user.name}-${state.user.city}`.toLowerCase();
          const updatedUser = { ...state.user, theme };
          set({
            user: updatedUser,
            users: { ...state.users, [key]: updatedUser },
          });
        }
      },
      buyItem: (itemId, cost) => {
        const state = get();
        if (state.user && state.user.coins >= cost) {
          const inventory = state.user.inventory || [];
          if (itemId === "streak_freeze") {
            const currentFreezes = inventory.filter(i => i === "streak_freeze").length;
            if (currentFreezes >= 2) return false;
          }
          if (["secret_time", "badge_bronze", "badge_gold", "title_grandmaster"].includes(itemId)) {
             if (inventory.includes(itemId)) return false;
          }
          const key = `${state.user.name}-${state.user.city}`.toLowerCase();
          const updatedUser = {
            ...state.user,
            coins: state.user.coins - cost,
            inventory: [...inventory, itemId],
          };
          set({
            user: updatedUser,
            users: { ...state.users, [key]: updatedUser },
          });
          return true;
        }
        return false;
      },
      equipTitle: (title) => {
        const state = get();
        if (state.user) {
          const key = `${state.user.name}-${state.user.city}`.toLowerCase();
          const updatedUser = { ...state.user, activeTitle: title };
          set({
            user: updatedUser,
            users: { ...state.users, [key]: updatedUser },
          });
        }
      },
      useStreakFreeze: () => {
        const state = get();
        if (state.user && state.user.inventory?.includes("streak_freeze")) {
          const inv = [...state.user.inventory];
          inv.splice(inv.indexOf("streak_freeze"), 1);
          const key = `${state.user.name}-${state.user.city}`.toLowerCase();
          const updatedUser = {
            ...state.user,
            inventory: inv,
          };
          set({
            user: updatedUser,
            users: { ...state.users, [key]: updatedUser },
          });
          return true;
        }
        return false;
      },
      checkStreak: () => {
        const state = get();
        if (!state.user) return { freezeUsed: 0, streakReset: false };

        const todayStr = new Date().toISOString().split("T")[0];
        const lastStr = state.user.lastLoginDate;
        if (!lastStr) return { freezeUsed: 0, streakReset: false };
        
        const key = `${state.user.name}-${state.user.city}`.toLowerCase();

        if (todayStr !== lastStr) {
          const today = new Date(todayStr);
          const last = new Date(lastStr);
          const diffDays = Math.floor(
            (today.getTime() - last.getTime()) / (1000 * 3600 * 24),
          );

          if (diffDays === 1) {
            const updatedUser = {
                ...state.user,
                streak: (state.user.streak || 0) + 1,
                lastLoginDate: todayStr,
            };
            set({
              user: updatedUser,
              users: { ...state.users, [key]: updatedUser },
            });
          } else if (diffDays > 1) {
            const missedDays = diffDays - 1;
            const freezesCount = state.user.inventory?.filter(i => i === "streak_freeze").length || 0;
            const inv = [...(state.user.inventory || [])];

            if (freezesCount >= missedDays) {
              // We have enough freezes to cover the missed days
              for (let i = 0; i < missedDays; i++) {
                inv.splice(inv.indexOf("streak_freeze"), 1);
              }
              const updatedUser = {
                  ...state.user,
                  streak: (state.user.streak || 0) + 1, // continue streak
                  lastLoginDate: todayStr,
                  inventory: inv,
              };
              set({
                user: updatedUser,
                users: { ...state.users, [key]: updatedUser }
              });
              return { freezeUsed: missedDays, streakReset: false };
            } else {
              // Not enough freezes, consume all and break streak
              for (let i = 0; i < freezesCount; i++) {
                inv.splice(inv.indexOf("streak_freeze"), 1);
              }
              const updatedUser = { 
                  ...state.user, 
                  streak: 1, 
                  lastLoginDate: todayStr, 
                  inventory: inv 
              };
              set({
                user: updatedUser,
                users: { ...state.users, [key]: updatedUser }
              });
              return { freezeUsed: freezesCount, streakReset: true };
            }
          }
        }
        return { freezeUsed: 0, streakReset: false };
      },
    }),
    { name: "kitsune-sudoku-user" },
  ),
);
