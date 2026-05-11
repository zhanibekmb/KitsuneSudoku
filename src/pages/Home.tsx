import { useNavigate } from "react-router";
import { useGameStore } from "@/stores/useGameStore";
import { useUserStore } from "@/stores/useUserStore";
import { KitsuneLogo } from "@/components/KitsuneLogo";
import { Difficulty } from "@/lib/sudoku";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Coffee,
  Zap,
  Trophy,
  Play,
  Star,
  Sparkles,
  TrendingUp,
  MapPin,
  Globe,
  Settings,
} from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, limit, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const Home = () => {
  const navigate = useNavigate();
  const { startGame } = useGameStore();
  const { user, login, cancelPro, setAvatar } = useUserStore();
  const [userName, setUserName] = useState("");
  const [userCity, setUserCity] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [customAvatar, setCustomAvatar] = useState("");
  const [leaderboardMode, setLeaderboardMode] = useState<"global" | "city">(
    "global",
  );
  const [firebaseUsers, setFirebaseUsers] = useState<{name: string, points: number, city: string, isPro?: boolean, activeTitle?: string, inventory?: string[]}[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const allUsers = Object.values(useUserStore.getState().users);
      
      const setFirebaseUsersAction = (fetchedUsers: any[]) => {
        const merged = [...fetchedUsers];
        allUsers.forEach(localU => {
          if (!merged.find(u => u.name === localU.name && u.city === localU.city)) {
            merged.push(localU);
          }
        });
        merged.sort((a, b) => b.points - a.points);
        setFirebaseUsers(merged.slice(0, 20));
      };

      try {
        const q = query(collection(db, "users"), orderBy("points", "desc"), limit(20));
        const querySnapshot = await getDocs(q);
        const fetchedUsers = querySnapshot.docs.map(doc => doc.data() as any);
        setFirebaseUsersAction(fetchedUsers);
      } catch (e) {
        console.error("Failed to fetch leaderboard", e);
        setFirebaseUsersAction([]);
      }
    };
    fetchUsers();
  }, [user]);

  const handleStart = (difficulty: Difficulty) => {
    startGame(difficulty);
    navigate("/game");
  };

  if (!user) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center p-4">
        <div className="w-full max-w-md mx-auto animate-in slide-in-from-bottom-8 duration-700 bg-[color:var(--bg-card)] border border-[color:var(--border-color)] p-6 sm:p-8 rounded-2xl shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 flex flex-wrap justify-center items-center gap-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[color:var(--primary)] bg-[color:var(--primary)]/10 dark:bg-[color:var(--primary)]/20 border border-[color:var(--primary)]/30">
                <KitsuneLogo className="w-7 h-7" />
              </div>
              KITSUNE<span className="font-medium opacity-70">SUDOKU</span>
            </h1>
            <p className="opacity-60 text-sm">
              A mindful start to your morning.
            </p>
          </div>
          <div>
            <div className="mb-4">
              <label className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-2 block">
                Nickname
              </label>
              <input
                type="text"
                placeholder="e.g. MasterSudoku99"
                className="w-full px-4 py-3 rounded bg-[color:var(--bg-app)] border border-[color:var(--border-color)] focus:outline-none focus:border-[color:var(--primary)] focus:ring-1 focus:ring-[color:var(--primary)] mb-4 transition-all"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
              <label className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-2 block">
                City / Location
              </label>
              <input
                type="text"
                placeholder="e.g. Almaty"
                className="w-full px-4 py-3 rounded bg-[color:var(--bg-app)] border border-[color:var(--border-color)] focus:outline-none focus:border-[color:var(--primary)] focus:ring-1 focus:ring-[color:var(--primary)] mb-6 transition-all"
                value={userCity}
                onChange={(e) => setUserCity(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  userName &&
                  userCity &&
                  login(userName, userCity)
                }
              />
            </div>
            <button
              className="w-full text-xs py-3.5 tracking-widest uppercase font-bold shadow-md hover:brightness-110 text-white rounded transition-colors disabled:opacity-50"
              style={{ backgroundColor: "var(--primary)" }}
              onClick={() => userName && userCity && login(userName, userCity)}
              disabled={!userName || !userCity}
            >
              Start Journey
            </button>

            <div className="bg-[color:var(--bg-app)] mt-8 p-4 rounded-xl border border-[color:var(--border-color)]">
              <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-2">
                How it works
              </p>
              <p className="text-xs opacity-70 leading-relaxed">
                Enter any nickname and city to create a local profile. Your
                progress, themes, and stats are saved securely on your device.
                You can log back in by putting in the same nick/city!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
      {/* Header Profile */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[color:var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[color:var(--border-color)]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-2">
            <span className="text-4xl">{user.activeAvatar || "🦊"}</span>
            Good morning, {user.name}{" "}
            {user.isPro && <Sparkles className="text-amber-500 w-5 h-5" />}
          </h1>
          <p className="opacity-80 flex items-center gap-2 text-sm font-medium">
            <TrendingUp
              className="w-4 h-4"
              style={{ color: "var(--primary)" }}
            />{" "}
            {user.stats.won} puzzles completed recently.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Settings className="w-5 h-5 opacity-60 hover:opacity-100" />
          </button>
          <div
            className="bg-[color:var(--bg-app)] border border-[color:var(--border-color)] font-bold px-4 py-3 rounded-xl flex flex-col items-center min-w-[100px] shadow-inner"
            style={{ color: "var(--primary)" }}
          >
            <span className="text-3xl font-mono">{user.points}</span>
            <span className="text-[10px] uppercase tracking-widest opacity-80 mt-1">
              Focus Points
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Play Area */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="classic" className="w-full">
            <TabsList className="bg-[color:var(--bg-card)] border border-[color:var(--border-color)] p-1 rounded-lg grid w-full grid-cols-2 mb-6 h-12">
              <TabsTrigger
                value="classic"
                className="text-xs tracking-widest uppercase font-bold opacity-60 data-[state=active]:opacity-100 data-[state=active]:bg-[color:var(--bg-app)] rounded-md"
              >
                Classic
              </TabsTrigger>
              <TabsTrigger
                value="daily"
                className="text-xs tracking-widest uppercase font-bold opacity-60 data-[state=active]:opacity-100 data-[state=active]:bg-[color:var(--bg-app)] rounded-md gap-2"
              >
                <Coffee className="w-4 h-4" /> Daily Challenge
              </TabsTrigger>
            </TabsList>

            <TabsContent value="classic" className="grid sm:grid-cols-2 gap-4">
              <button
                className="flex flex-col items-start p-5 bg-[color:var(--bg-card)] hover:brightness-95 border border-[color:var(--border-color)] rounded-xl transition-all text-left"
                onClick={() => handleStart("easy")}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg transition-colors border border-[color:var(--border-color)] bg-[color:var(--bg-app)]">
                    <Coffee
                      className="w-5 h-5"
                      style={{ color: "var(--primary)" }}
                    />
                  </div>
                  <span className="font-bold tracking-wide">
                    Morning Routine
                  </span>
                </div>
                <p className="text-xs opacity-60">
                  Perfect for the first cup of coffee.
                  <span className="block mt-1 text-[10px] text-amber-500 font-bold">
                    🎯 Max: 100 Pts | 22 🟡
                  </span>
                </p>
              </button>

              <button
                className={`group flex flex-col items-start p-5 bg-[color:var(--bg-card)] border border-[color:var(--border-color)] rounded-xl text-left relative overflow-hidden ${
                  user.stats.won >= 5
                    ? "hover:brightness-95 transition-all cursor-pointer"
                    : "opacity-60 cursor-not-allowed bg-slate-100/5 dark:bg-slate-900/10"
                }`}
                onClick={() => user.stats.won >= 5 && handleStart("medium")}
              >
                {!user.stats.won || user.stats.won < 5 ? (
                  <div className="absolute top-3 flex items-center justify-center right-4 px-2 py-1 bg-[color:var(--bg-app)] border border-[color:var(--border-color)] rounded text-[10px] font-bold opacity-80 uppercase tracking-widest gap-1">
                    Win 5 to unlock
                  </div>
                ) : null}
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg transition-colors border border-[color:var(--border-color)] bg-[color:var(--bg-app)]">
                    <Brain
                      className="w-5 h-5"
                      style={{ color: "var(--primary)" }}
                    />
                  </div>
                  <span className="font-bold tracking-wide">Speed Arena</span>
                </div>
                <p className="text-xs opacity-60">
                  Get the gears turning comfortably.
                  <span className="block mt-1 text-[10px] text-amber-500 font-bold">
                    🎯 Max: 200 Pts | 45 🟡
                  </span>
                </p>
              </button>

              <button
                className={`group flex flex-col items-start p-5 bg-[color:var(--bg-card)] border border-[color:var(--border-color)] rounded-xl text-left relative overflow-hidden ${
                  user.stats.won >= 15
                    ? "hover:brightness-95 transition-all cursor-pointer"
                    : "opacity-60 cursor-not-allowed bg-slate-100/5 dark:bg-slate-900/10"
                }`}
                onClick={() => user.stats.won >= 15 && handleStart("hard")}
              >
                {user.stats.won < 15 ? (
                  <div className="absolute top-3 flex items-center justify-center right-4 px-2 py-1 bg-[color:var(--bg-app)] border border-[color:var(--border-color)] rounded text-[10px] font-bold opacity-80 uppercase tracking-widest gap-1">
                    Win 15 to unlock
                  </div>
                ) : null}
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg transition-colors border border-[color:var(--border-color)] bg-[color:var(--bg-app)]">
                    <Zap
                      className={`w-5 h-5 ${user.stats.won >= 15 ? "text-amber-500" : "opacity-50"}`}
                    />
                  </div>
                  <span className="font-bold tracking-wide">Zen Garden</span>
                </div>
                <p className="text-xs opacity-60">
                  Deep concentration required.
                  <span className="block mt-1 text-[10px] text-amber-500 font-bold">
                    🎯 Max: 400 Pts | 90 🟡
                  </span>
                </p>
              </button>

              <button
                className={`group flex flex-col items-start p-5 bg-[color:var(--bg-card)] border border-[color:var(--border-color)] rounded-xl text-left relative overflow-hidden ${
                  user.stats.won >= 30
                    ? "hover:brightness-95 transition-all cursor-pointer"
                    : "opacity-60 cursor-not-allowed bg-slate-100/5 dark:bg-slate-900/10"
                }`}
                onClick={() => user.stats.won >= 30 && handleStart("expert")}
              >
                {user.stats.won < 30 ? (
                  <div className="absolute top-3 flex items-center justify-center right-4 px-2 py-1 bg-[color:var(--bg-app)] border border-[color:var(--border-color)] rounded text-[10px] font-bold opacity-80 uppercase tracking-widest gap-1">
                    Win 30 to unlock
                  </div>
                ) : null}
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg transition-colors border border-[color:var(--border-color)] bg-[color:var(--bg-app)]">
                    <Trophy
                      className={`w-5 h-5 ${user.stats.won >= 30 ? "text-rose-500" : "opacity-50"}`}
                    />
                  </div>
                  <span className="font-bold tracking-wide">Master Class</span>
                </div>
                <p className="text-xs opacity-60">
                  Only for the Sudoku masters.
                  <span className="block mt-1 text-[10px] text-amber-500 font-bold">
                    🎯 Max: 1000 Pts | 180 🟡
                  </span>
                </p>
              </button>

              <button
                className={`group flex flex-col items-start p-5 bg-[color:var(--bg-card)] border border-[color:var(--border-color)] rounded-xl text-left relative overflow-hidden ${
                  user.inventory?.includes("secret_time")
                    ? "hover:brightness-95 transition-all cursor-pointer"
                    : "opacity-60 cursor-not-allowed bg-slate-100/5 dark:bg-slate-900/10"
                }`}
                onClick={() => {
                  if (user.inventory?.includes("secret_time")) {
                    startGame("medium", "time_challenge");
                    navigate("/game");
                  }
                }}
              >
                {!user.inventory?.includes("secret_time") ? (
                  <div className="absolute top-3 flex items-center justify-center right-4 px-2 py-1 bg-[color:var(--bg-app)] border border-[color:var(--border-color)] rounded text-[10px] font-bold opacity-80 uppercase tracking-widest gap-1">
                    Buy in Shop
                  </div>
                ) : null}
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg transition-colors border border-[color:var(--border-color)] bg-[color:var(--bg-app)]">
                    <Zap
                      className={`w-5 h-5 ${user.inventory?.includes("secret_time") ? "text-amber-500" : "opacity-50"}`}
                    />
                  </div>
                  <span className="font-bold tracking-wide">
                    Time Challenge
                  </span>
                </div>
                <p className="text-xs opacity-60">
                  5 minutes. Go!
                  <span className="block mt-1 text-[10px] text-amber-500 font-bold">
                    🎯 Max: 900 Pts | 150 🟡
                  </span>
                </p>
              </button>

              <button
                className={`group flex flex-col items-start p-5 bg-[color:var(--bg-card)] border border-[color:var(--border-color)] rounded-xl text-left relative overflow-hidden ${
                  user.isPro
                    ? "hover:brightness-95 transition-all cursor-pointer"
                    : "opacity-60 cursor-not-allowed bg-slate-100/5 dark:bg-slate-900/10"
                }`}
                onClick={() => {
                  if (user.isPro) {
                    startGame("hard", "wordoku");
                    navigate("/game");
                  }
                }}
              >
                {!user.isPro ? (
                  <div className="absolute top-3 flex items-center justify-center right-4 px-2 py-1 bg-[color:var(--bg-app)] border border-[color:var(--border-color)] rounded text-[10px] font-bold opacity-80 uppercase tracking-widest gap-1 text-amber-500">
                    Pro Only
                  </div>
                ) : null}
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg transition-colors border border-[color:var(--border-color)] bg-[color:var(--bg-app)]">
                    <Sparkles
                      className={`w-5 h-5 ${user.isPro ? "text-amber-500" : "opacity-50"}`}
                    />
                  </div>
                  <span className="font-bold tracking-wide">Wordoku</span>
                </div>
                <p className="text-xs opacity-60">
                  Sudoku with Letters (A-I).
                  <span className="block mt-1 text-[10px] text-amber-500 font-bold">
                    🎯 Max: 600 Pts | 120 🟡
                  </span>
                </p>
              </button>
            </TabsContent>

            <TabsContent value="daily">
              <div className="border border-[color:var(--border-color)] bg-[color:var(--bg-card)] rounded-xl overflow-hidden shadow-lg relative">
                <div
                  className="absolute top-0 w-full h-2"
                  style={{ backgroundColor: "var(--primary)" }}
                ></div>
                <div className="p-6">
                  <div className="text-2xl font-bold flex justify-between items-center mb-2">
                    The Daily Challenge
                    <span
                      className="text-[10px] uppercase font-bold text-white px-2 py-1 rounded tracking-widest"
                      style={{ backgroundColor: "var(--primary)" }}
                    >
                      May 8th
                    </span>
                  </div>
                  <p className="text-sm opacity-60 mb-6">
                    Same puzzle for everyone globally. Compete for the best
                    time.
                  </p>

                  <div className="flex -space-x-2 mb-6">
                    <div className="w-8 h-8 rounded-full bg-[color:var(--bg-app)] border-2 border-[color:var(--bg-card)] flex items-center justify-center text-[10px] font-bold">
                      AJ
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[color:var(--bg-app)] border-2 border-[color:var(--bg-card)] flex items-center justify-center text-[10px] font-bold">
                      MR
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[color:var(--bg-app)] border-2 border-[color:var(--bg-card)] flex items-center justify-center text-[10px] font-bold">
                      KV
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[color:var(--bg-app)] border-2 border-[color:var(--bg-card)] flex items-center justify-center text-[10px] font-bold opacity-60">
                      +12k
                    </div>
                  </div>

                  <button
                    className="w-full text-white font-bold hover:brightness-110 rounded flex items-center justify-center py-3 px-4 shadow-sm text-sm transition-all"
                    style={{ backgroundColor: "var(--primary)" }}
                    onClick={() => handleStart("medium")}
                  >
                    PLAY DAILY GRID{" "}
                    <Play className="w-4 h-4 ml-2 fill-current" />
                  </button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {!user.isPro && (
            <div className="p-5 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl shadow-lg">
              <h4 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" /> Upgrade to Pro
              </h4>
              <p className="text-white/70 text-xs mb-4">
                Unlock AI Coach, custom themes & PDF exports.
              </p>
              <button
                className="w-full py-2 bg-white text-indigo-700 hover:bg-slate-50 transition-colors text-xs font-bold rounded shadow-sm"
                onClick={() => navigate("/pro")}
              >
                ACTIVATE NOW
              </button>
            </div>
          )}

          <div className="bg-[color:var(--bg-card)] border border-[color:var(--border-color)] rounded-xl p-5 shadow-sm">
            <h3 className="text-[10px] uppercase tracking-widest opacity-60 font-bold mb-4 flex justify-between items-center">
              <span>Item Shop</span>
              <span className="text-amber-500 font-bold flex items-center gap-1 text-xs">
                <Star className="w-3 h-3" /> {user.coins}
              </span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Streak Freeze ❄️</span>
                  <span className="text-[10px] opacity-60">
                    Saves your daily streak! (Owned: {user.inventory?.filter(i => i === "streak_freeze").length || 0}/2)
                  </span>
                </div>
                {(user.inventory?.filter(i => i === "streak_freeze").length || 0) >= 2 ? (
                  <span className="text-xs font-bold opacity-50 uppercase">
                    Max (2)
                  </span>
                ) : (
                  <button
                    onClick={() =>
                      useUserStore.getState().buyItem("streak_freeze", 200)
                    }
                    disabled={user.coins < 200}
                    className="text-xs border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white px-2 py-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-amber-500"
                  >
                    200 🟡
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-bold flex gap-1 items-center">
                    Time Challenge <Zap className="w-3 h-3 text-amber-500" />
                  </span>
                  <span className="text-[10px] opacity-60">Secret Mode!</span>
                </div>
                {user.inventory?.includes("secret_time") ? (
                  <span className="text-xs font-bold text-green-500 uppercase">
                    Unlocked
                  </span>
                ) : (
                  <button
                    onClick={() =>
                      useUserStore.getState().buyItem("secret_time", 500)
                    }
                    disabled={user.coins < 500}
                    className="text-xs border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white px-2 py-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-amber-500"
                  >
                    500 🟡
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Bronze Crown 👑</span>
                  <span className="text-[10px] opacity-60">
                    Show off in Leaderboard
                  </span>
                </div>
                {user.inventory?.includes("badge_bronze") ? (
                  <span className="text-xs font-bold opacity-50 uppercase">
                    Owned
                  </span>
                ) : (
                  <button
                    onClick={() =>
                      useUserStore.getState().buyItem("badge_bronze", 1000)
                    }
                    disabled={user.coins < 1000}
                    className="text-xs border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white px-2 py-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-amber-500"
                  >
                    1000 🟡
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-amber-400">
                    Gold Crown 🏆
                  </span>
                  <span className="text-[10px] opacity-60">
                    The Ultimate Flex
                  </span>
                </div>
                {user.inventory?.includes("badge_gold") ? (
                  <span className="text-xs font-bold opacity-50 uppercase">
                    Owned
                  </span>
                ) : (
                  <button
                    onClick={() =>
                      useUserStore.getState().buyItem("badge_gold", 5000)
                    }
                    disabled={user.coins < 5000}
                    className="text-xs border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white px-2 py-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-amber-500"
                  >
                    5000 🟡
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-indigo-400">
                    Grandmaster Title
                  </span>
                  <span className="text-[10px] opacity-60">
                    Signature under your name
                  </span>
                </div>
                {user.inventory?.includes("title_grandmaster") ? (
                  user.activeTitle === "Grandmaster" ? (
                    <span className="text-xs font-bold text-green-500 uppercase">
                      Equipped
                    </span>
                  ) : (
                    <button
                      onClick={() =>
                        useUserStore.getState().equipTitle("Grandmaster")
                      }
                      className="text-xs border border-green-500 text-green-500 hover:bg-green-500 hover:text-white px-2 py-1 rounded transition-colors"
                    >
                      Equip
                    </button>
                  )
                ) : (
                  <button
                    onClick={() =>
                      useUserStore.getState().buyItem("title_grandmaster", 3000)
                    }
                    disabled={user.coins < 3000}
                    className="text-xs border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white px-2 py-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-amber-500"
                  >
                    3000 🟡
                  </button>
                )}
              </div>
            </div>
            {user.streak > 0 && (
              <div className="mt-4 pt-3 border-t border-[color:var(--border-color)]">
                <p className="text-xs font-bold flex gap-2 items-center">
                  🔥 {user.streak} Day Streak!
                </p>
              </div>
            )}
          </div>

          <div className="bg-[color:var(--bg-card)] border border-[color:var(--border-color)] rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] uppercase tracking-widest opacity-60 font-bold">
                Leaderboard
              </h3>
              <div className="flex bg-[color:var(--bg-app)] border border-[color:var(--border-color)] rounded overflow-hidden">
                <button
                  className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${leaderboardMode === "global" ? "text-white" : "opacity-60"}`}
                  style={
                    leaderboardMode === "global"
                      ? { backgroundColor: "var(--primary)" }
                      : {}
                  }
                  onClick={() => setLeaderboardMode("global")}
                >
                  Global
                </button>
                <button
                  className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${leaderboardMode === "city" ? "text-white" : "opacity-60"}`}
                  style={
                    leaderboardMode === "city"
                      ? { backgroundColor: "var(--primary)" }
                      : {}
                  }
                  onClick={() => setLeaderboardMode("city")}
                >
                  {user.city}
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {firebaseUsers.length > 0 ? firebaseUsers
                .filter(
                  (p) => leaderboardMode === "global" || p.city === user.city,
                )
                .sort((a, b) => b.points - a.points)
                .slice(0, 5)
                .map((p, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-2 rounded-lg ${p.name === user.name ? "border border-[color:var(--border-color)] bg-[color:var(--bg-app)]" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-bold ${i === 0 ? "text-amber-500" : i === 1 ? "opacity-50" : i === 2 ? "text-amber-700" : "opacity-40"}`}
                      >
                        #{i + 1}
                      </span>
                      <div>
                        <p className="font-bold text-sm flex items-center gap-2">
                          <span>{p.activeAvatar || "🦊"}</span>
                          {p.name}{" "}
                          {p.isPro && <Sparkles className="text-amber-500 w-3 h-3" />}
                          {(p.inventory?.includes("badge_gold") || p.inventory?.includes("badge_bronze")) && (
                            <span className="text-sm" title="Badge">
                              {p.inventory?.includes("badge_gold") ? "🏆" : "👑"}
                            </span>
                          )}
                          {p.name === user.name && (
                            <span
                              className="text-white text-[8px] uppercase tracking-wider px-1 rounded"
                              style={{ backgroundColor: "var(--primary)" }}
                            >
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-xs opacity-60 flex items-center gap-1">
                          {leaderboardMode === "global" ? (
                            <Globe className="w-3 h-3" />
                          ) : (
                            <MapPin className="w-3 h-3" />
                          )}{" "}
                          {p.city}
                        </p>
                      </div>
                    </div>
                    <span
                      className="font-mono text-sm font-bold"
                      style={{ color: "var(--primary)" }}
                    >
                      {p.points}
                    </span>
                  </div>
                ))
               : (
                 <div className="text-center opacity-60 text-xs py-4">Loading leaderboard...</div>
               )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md border-[color:var(--border-color)] bg-[color:var(--bg-card)]">
          <DialogHeader>
            <DialogTitle>Settings & Profile</DialogTitle>
            <DialogDescription>
              Manage your preferences and active subscription here.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="text-sm font-bold opacity-70 uppercase tracking-widest">
                Avatar Selection
              </h3>
              <div className="flex flex-wrap gap-2">
                {["🦊", "🐱", "🐼", "🐯", "🐰", "🐶", "🦄", "🦉"].map((av) => (
                  <button
                    key={av}
                    onClick={() => setAvatar(av)}
                    className={`w-10 h-10 text-2xl flex items-center justify-center rounded-xl transition-all ${
                      user.activeAvatar === av || (!user.activeAvatar && av === "🦊")
                        ? "bg-[color:var(--primary)] text-white shadow-lg scale-110"
                        : "bg-[color:var(--bg-app)] opacity-60 hover:opacity-100"
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>

              {user.isPro && (
                <div className="flex gap-2 items-center mt-2">
                  <input
                    type="text"
                    placeholder="Custom avatar (e.g. Emoji or text)"
                    className="flex-1 bg-[color:var(--bg-app)] border border-[color:var(--border-color)] text-sm rounded-lg px-3 py-2 outline-none focus:border-amber-500 transition-colors"
                    value={customAvatar}
                    onChange={(e) => setCustomAvatar(e.target.value)}
                    maxLength={2}
                  />
                  <button
                    onClick={() => {
                      if (customAvatar.trim()) setAvatar(customAvatar.trim());
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    Set
                  </button>
                </div>
              )}
              {!user.isPro && (
                <p className="text-[10px] text-amber-500 font-medium">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Upgrade to Pro to use custom emoji avatars.
                </p>
              )}
            </div>

            <hr className="border-[color:var(--border-color)]" />

            <div className="space-y-4">
              <h3 className="text-sm font-bold opacity-70 uppercase tracking-widest">
                Subscription Status
              </h3>
              {user.isPro ? (
                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-amber-700 dark:text-amber-400">
                        Pro Tier Active
                      </h4>
                      <p className="text-xs text-amber-600/80 dark:text-amber-500/80 mt-1">
                        AI Coach, Custom Avatars & PDF Export
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      // Workaround: window.confirm is blocked in iframe, directly cancel.
                      cancelPro();
                    }}
                    className="w-full py-2 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/80 text-red-700 dark:text-red-400 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors border border-red-200 dark:border-red-800"
                  >
                    Cancel Subscription
                  </button>
                </div>
              ) : (
                <div className="bg-[color:var(--bg-app)] border border-[color:var(--border-color)] p-4 rounded-xl">
                  <p className="text-sm opacity-80 mb-3">
                    You're currently using the Free plan.
                  </p>
                  <button
                    onClick={() => {
                      setSettingsOpen(false);
                      navigate("/pro");
                    }}
                    className="w-full py-2 bg-[color:var(--primary)] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                  >
                    View Upgrade Options
                  </button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
