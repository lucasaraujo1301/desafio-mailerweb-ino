"use client";

import React from "react";
import { Reservation } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime, formatTime } from "@/lib/utils";
import { CalendarX2, Users, Clock, DoorOpen } from "lucide-react";

interface Props {
  reservations: Reservation[];
  onCancel: (r: Reservation) => void;
}

export function ReservationsTable({ reservations, onCancel }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-body">
        <thead>
          <tr className="border-b border-surface-700/50">
            {["Título", "Sala", "Data / Horário", "Participantes", "Status", "Ações"].map((h) => (
              <th key={h} className="text-left text-xs font-semibold tracking-widest uppercase text-surface-400 px-4 py-3 first:pl-0 last:pr-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reservations.map((res, i) => (
            <tr
              key={res.id}
              className="border-b border-surface-800 hover:bg-surface-800/40 transition-colors group"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <td className="px-4 py-4 pl-0">
                <p className="font-semibold text-surface-100 font-display">{res.title}</p>
              </td>
              <td className="px-4 py-4">
                <span className="flex items-center gap-1.5 text-surface-300">
                  <DoorOpen size={12} className="text-surface-500" />
                  {res.room_detail?.name ?? `#${res.room}`}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="text-surface-300">
                  <p>{formatDateTime(res.start_datetime)}</p>
                  <p className="text-xs text-surface-500 flex items-center gap-1 mt-0.5">
                    <Clock size={10} /> até {formatTime(res.end_datetime)}
                  </p>
                </div>
              </td>
              <td className="px-4 py-4">
                <span className="flex items-center gap-1.5 text-surface-300">
                  <Users size={12} className="text-surface-500" />
                  {res.users_detail?.length ?? res.users?.length ?? 0}
                  {res.users_detail && res.users_detail.length > 0 && (
                    <span className="text-xs text-surface-500 ml-1">
                      ({res.users_detail.slice(0, 2).map((u) => u.name.split(" ")[0]).join(", ")}
                      {res.users_detail.length > 2 ? "…" : ""})
                    </span>
                  )}
                </span>
              </td>
              <td className="px-4 py-4">
                <Badge variant={res.is_active ? "success" : "danger"} dot>
                  {res.is_active ? "Ativa" : "Cancelada"}
                </Badge>
              </td>
              <td className="px-4 py-4 pr-0">
                <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                  {res.status === "active" && (
                    <Button
                      size="xs"
                      variant="ghost"
                      icon={<CalendarX2 size={13} />}
                      onClick={() => onCancel(res)}
                      className="hover:text-danger-400 hover:bg-danger-500/10"
                    >
                      Cancelar
                    </Button>
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