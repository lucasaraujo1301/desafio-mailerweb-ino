"use client";

import React from "react";
import { Room } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/contexts/AuthContext";
import { Pencil, Trash2, CalendarPlus, Users } from "lucide-react";

interface Props {
  rooms: Room[];
  onEdit: (r: Room) => void;
  onDelete: (r: Room) => void;
  onBook: (r: Room) => void;
}

export function RoomsTable({ rooms, onEdit, onDelete, onBook }: Props) {
  const { isAdmin } = useAuth();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-body">
        <thead>
          <tr className="border-b border-surface-700/50">
            {["Sala", "Capacidade", "Status", "Ações"].map((h) => (
              <th key={h} className="text-left text-xs font-semibold tracking-widest uppercase text-surface-400 px-4 py-3 first:pl-0 last:pr-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rooms.map((room, i) => (
            <tr
              key={room.id}
              className="border-b border-surface-800 hover:bg-surface-800/40 transition-colors group"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <td className="px-4 py-4 pl-0">
                <p className="font-semibold text-surface-100 font-display">{room.name}</p>
              </td>
              <td className="px-4 py-4">
                <span className="flex items-center gap-1.5 text-surface-300">
                  <Users size={12} className="text-surface-500" /> {room.capacity}
                </span>
              </td>
              <td className="px-4 py-4">
                <Badge variant={room.is_active ? "success" : "neutral"} dot>
                  {room.is_active ? "Ativa" : "Inativa"}
                </Badge>
              </td>
              <td className="px-4 py-4 pr-0">
                <div className="flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="xs"
                    variant="outline"
                    icon={<CalendarPlus size={13} />}
                    onClick={() => onBook(room)}
                    disabled={!room.is_active}
                    title="Reservar"
                  >
                    Reservar
                  </Button>
                  {isAdmin && (
                    <>
                      <Button size="xs" variant="ghost" icon={<Pencil size={13} />} onClick={() => onEdit(room)} title="Editar" />
                      <Button size="xs" variant="ghost" icon={<Trash2 size={13} />} onClick={() => onDelete(room)} title="Excluir" className="hover:text-danger-400 hover:bg-danger-500/10" />
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
