"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  DoorOpen,
  CalendarCheck2,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Building2,
} from "lucide-react";

const nav = [
  { href: "/rooms",        label: "Salas",    icon: DoorOpen },
  { href: "/reservations", label: "Reservas", icon: CalendarCheck2 },
];

export function Sidebar() {
  const pathname     = usePathname();
  const router       = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const [mini, setMini]           = useState(false);

  const handleLogout = () => { logout(); router.push("/login"); };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-surface-900 border-r border-surface-700/50",
        "transition-all duration-300 ease-in-out sticky top-0 flex-shrink-0",
        mini ? "w-[60px]" : "w-[220px]"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center min-h-[60px] px-3 border-b border-surface-700/50 gap-2.5 overflow-hidden")}>
        <div className="w-8 h-8 flex-shrink-0 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center">
          <Building2 size={15} className="text-brand-400" />
        </div>
        {!mini && (
          <span className="font-display font-bold text-sm text-surface-50 truncate tracking-wide animate-fade-in">
            RoomBook
          </span>
        )}
        <button
          onClick={() => setMini(!mini)}
          className="ml-auto flex-shrink-0 p-1 rounded-lg text-surface-500 hover:text-surface-200 hover:bg-surface-800 transition-all"
          title={mini ? "Expandir" : "Recolher"}
        >
          {mini ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
        </button>
      </div>

      {/* User chip */}
      {!mini && (
        <div className="px-3 py-3 border-b border-surface-700/30 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500/40 to-brand-600/40 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-brand-200">
                {user?.name?.charAt(0).toUpperCase() ?? "?"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-surface-100 truncate">{user?.name}</p>
              {isAdmin && (
                <span className="text-[10px] text-brand-300 font-mono tracking-wider">ADMIN</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={mini ? label : undefined}
              className={cn(
                "flex items-center rounded-xl text-sm font-body font-medium transition-all group",
                mini ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5",
                active
                  ? "bg-brand-500/15 text-brand-300 border border-brand-500/20"
                  : "text-surface-400 hover:text-surface-100 hover:bg-surface-800"
              )}
            >
              <Icon size={16} className={cn("flex-shrink-0 transition-colors", active ? "text-brand-400" : "text-surface-500 group-hover:text-surface-300")} />
              {!mini && label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-surface-700/30">
        <button
          onClick={handleLogout}
          title={mini ? "Sair" : undefined}
          className={cn(
            "flex items-center rounded-xl text-sm font-body transition-all w-full",
            "text-surface-500 hover:text-danger-400 hover:bg-danger-500/10",
            mini ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5"
          )}
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!mini && "Sair"}
        </button>
      </div>
    </aside>
  );
}
