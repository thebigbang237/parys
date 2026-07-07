// app/(student)/(shell)/_components/NotificationsBell.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CreditCard, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ActivityItem = {
  id: string;
  type: "payment" | "reply";
  title: string;
  subtitle: string;
  created_at: string;
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

export default function NotificationsBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleOpen() {
    setIsOpen((v) => !v);
    if (!fetched) {
      setLoading(true);
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((data) => setActivity(data.activity || []))
        .catch(() => setActivity([]))
        .finally(() => {
          setLoading(false);
          setFetched(true);
        });
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative p-2 text-gray-700 hover:text-[#ff63ce] transition-colors bg-white border border-[#f0e0ec] rounded-full lg:border-0 lg:bg-transparent"
      >
        <Bell size={20} />
        {activity.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff63ce] rounded-full" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white border border-[#f0e0ec] shadow-lg z-50">
          <div className="px-4 py-3 border-b border-[#f0e0ec]">
            <p className="text-xs tracking-[2px] uppercase text-gray-500">
              Activité récente
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="text-sm text-gray-400 text-center py-8">
                Chargement...
              </p>
            ) : activity.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                Rien de nouveau pour l&apos;instant.
              </p>
            ) : (
              activity.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex gap-3 px-4 py-3 border-b border-[#f0e0ec] last:border-b-0",
                  )}
                >
                  <span className="text-[#ff63ce] mt-0.5 shrink-0">
                    {item.type === "payment" ? (
                      <CreditCard size={16} />
                    ) : (
                      <MessageCircle size={16} />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-900 leading-snug">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.subtitle} · {timeAgo(item.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
