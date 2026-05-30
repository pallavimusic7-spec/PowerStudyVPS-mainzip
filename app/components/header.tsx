"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sun, LogOut, Menu, ChevronLeft, Moon, Computer,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

type Theme = "LIGHT" | "DARK" | "SYSTEM";

export function Header({ isMobileMenuOpen, setIsMobileMenuOpen }: HeaderProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>("SYSTEM");
  const [user, setUser] = useState<{
    name?: string;
    telegramId?: string;
    photoUrl?: string;
  } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("USER_THEME") as Theme | null;
    if (saved === "LIGHT" || saved === "DARK" || saved === "SYSTEM") {
      setTheme(saved);
    } else {
      localStorage.setItem("USER_THEME", "SYSTEM");
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const apply = (t: Theme) => {
      if (t === "DARK") root.classList.add("dark");
      else if (t === "LIGHT") root.classList.remove("dark");
      else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.classList.toggle("dark", prefersDark);
      }
    };
    apply(theme);
    localStorage.setItem("USER_THEME", theme);
    if (theme === "SYSTEM") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => root.classList.toggle("dark", e.matches);
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    }
  }, [theme]);

  useEffect(() => {
    const storedUser = localStorage.getItem("USER_DATA");
    if (storedUser) {
      try {
        const p = JSON.parse(storedUser);
        setUser({
          name: p.name?.trim() || "User",
          telegramId: p.telegramId,
          photoUrl: p.photoUrl,
        });
      } catch {
        setUser({ name: "User", photoUrl: "" });
      }
    } else {
      setUser({ name: "User", photoUrl: "" });
    }
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Failed to logout");
      localStorage.clear();
      router.push("/auth");
    } catch {
      console.error("Logout failed");
    }
  };

  const themeIcon = theme === "LIGHT"
    ? <Sun className="h-4 w-4" />
    : theme === "DARK"
    ? <Moon className="h-4 w-4" />
    : <Computer className="h-4 w-4" />;

  return (
    <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur border-b flex items-center justify-between px-4 gap-4">
      {/* Left */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="xl:hidden h-8 w-8"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Theme switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              {themeIcon}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => setTheme("LIGHT")} className="cursor-pointer gap-2">
              <Sun className="h-4 w-4" /> Light
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme("DARK")} className="cursor-pointer gap-2">
              <Moon className="h-4 w-4" /> Dark
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme("SYSTEM")} className="cursor-pointer gap-2">
              <Computer className="h-4 w-4" /> System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User greeting */}
        <span className="hidden sm:block text-sm text-muted-foreground truncate max-w-[140px]">
          Hi, {user?.name}
        </span>

        {/* Avatar + logout */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none rounded-full ring-2 ring-transparent hover:ring-primary/30 transition-all">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoUrl} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2 border-b">
              <p className="text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground">Student</p>
            </div>
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive gap-2 mt-1"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
