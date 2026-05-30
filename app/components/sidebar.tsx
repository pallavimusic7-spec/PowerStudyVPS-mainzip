"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen, Contact, GraduationCap, Presentation,
  Send, BookOpenCheck, X,
} from "lucide-react";
import Image from "next/image";

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  sidebarTitle?: string;
  sidebarLogoUrl?: string;
  BookLibrary?: string;
  tgChannel?: string;
}

export function Sidebar({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  sidebarTitle,
  sidebarLogoUrl,
  BookLibrary,
  tgChannel,
}: SidebarProps) {
  const pathname = usePathname();

  const sidebarItems = [
    { icon: BookOpen,      text: "Dashboard",    href: "/study/"          },
    { icon: Presentation,  text: "All Courses",  href: "/study/batches"   },
    { icon: GraduationCap, text: "My Courses",   href: "/study/mybatches" },
    { icon: Send,          text: "Telegram",     href: tgChannel || ""    },
    { icon: BookOpenCheck, text: "Book Library", href: BookLibrary || ""  },
    { icon: Contact,       text: "Contact",      href: "/contact"         },
  ];

  const isActive = (href: string) => {
    if (href === "/study/") return pathname === "/study" || pathname === "/study/";
    if (href === "/study/batches")
      return pathname === "/study/batches" || !!pathname?.startsWith("/study/batches/");
    if (href === "/study/mybatches")
      return pathname === "/study/mybatches" || !!pathname?.startsWith("/study/mybatches/");
    return pathname === href;
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 xl:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`
          z-50 w-60 bg-card border-r flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${isMobileMenuOpen
            ? "fixed top-0 left-0 translate-x-0 h-full shadow-2xl"
            : "fixed top-0 left-0 -translate-x-full h-full"}
          xl:sticky xl:top-0 xl:translate-x-0 xl:h-screen xl:z-auto xl:shadow-none
        `}
      >
        {/* Logo area */}
        <div className="h-16 px-4 border-b flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 overflow-hidden flex items-center justify-center shrink-0">
            {sidebarLogoUrl ? (
              <Image
                src={sidebarLogoUrl}
                alt={sidebarTitle || "Logo"}
                width={32}
                height={32}
                priority
                className="w-full h-full object-cover"
              />
            ) : (
              <BookOpen className="w-4 h-4 text-primary" />
            )}
          </div>
          <span className="font-bold text-sm truncate flex-1">
            {sidebarTitle || "EduFlow"}
          </span>
          <button
            className="xl:hidden text-muted-foreground hover:text-foreground transition-colors p-1"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mt-1">
            Navigation
          </p>
          {sidebarItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.text}
                href={item.href as string}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.text}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground/60" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t shrink-0">
          <div className="bg-primary/5 rounded-lg px-3 py-2 text-xs text-muted-foreground text-center">
            {sidebarTitle || "EduFlow"}
          </div>
        </div>
      </aside>
    </>
  );
}
