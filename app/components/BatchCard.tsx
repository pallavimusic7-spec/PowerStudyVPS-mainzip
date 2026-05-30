"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { enrollBatch, UnenrollBatch } from "@/utils/api";
import { toast } from "sonner";
import { CalendarCheck2, UserCheck, BookmarkPlus, PinOff, ArrowRight } from "lucide-react";

export type BatchCardProps = {
  id?: string;
  title?: string;
  type?: string;
  image?: string;
  startDate?: string;
  endDate?: string;
  price?: string;
  forText?: string;
  isPlaceholder?: boolean;
  priority?: boolean;
};

export default function BatchCard({
  id = "",
  title = "",
  type = "",
  image,
  startDate = "",
  endDate = "",
  price = "",
  forText = "",
  isPlaceholder = false,
  priority = false,
}: BatchCardProps) {
  const router = useRouter();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const displayImage = image || "/assets/img/video-placeholder.svg";

  useEffect(() => { setHasMounted(true); }, []);

  useEffect(() => {
    if (!hasMounted) return;
    const update = () => {
      try {
        const list = JSON.parse(localStorage.getItem("enrolledBatches") || "[]") as { batchId: string }[];
        setIsEnrolled(list.some((b) => b.batchId === id));
      } catch { /* ignore */ }
    };
    update();
    window.addEventListener("batchesUpdated", update);
    return () => window.removeEventListener("batchesUpdated", update);
  }, [id, hasMounted]);

  const handleEnroll = async () => {
    try {
      const res = await enrollBatch(id, title);
      if (res.success) {
        let list: { batchId: string; name: string }[] = [];
        try { list = JSON.parse(localStorage.getItem("enrolledBatches") || "[]"); if (!Array.isArray(list)) list = []; } catch { list = []; }
        if (!list.some((b) => b.batchId === id)) {
          list.push({ batchId: id, name: title });
          localStorage.setItem("enrolledBatches", JSON.stringify(list));
          toast.success(`Enrolled in "${title}"`);
        } else {
          toast("Already enrolled in this batch.");
        }
        window.dispatchEvent(new Event("batchesUpdated"));
        setIsEnrolled(true);
      } else {
        toast.error(res.message || "Enrollment failed.");
      }
    } catch {
      toast.error("An error occurred while enrolling.");
    }
  };

  const handleUnenroll = async () => {
    try {
      const res = await UnenrollBatch(id, title);
      if (res.success) {
        let list: { batchId: string }[] = [];
        try { list = JSON.parse(localStorage.getItem("enrolledBatches") || "[]"); if (!Array.isArray(list)) list = []; } catch { list = []; }
        list = list.filter((b) => b.batchId !== id);
        localStorage.setItem("enrolledBatches", JSON.stringify(list));
        window.dispatchEvent(new Event("batchesUpdated"));
        setIsEnrolled(false);
        toast.success(`Unenrolled from "${title}"`);
      } else {
        toast.error(res.message || "Failed to unenroll.");
      }
    } catch {
      toast.error("An error occurred while unenrolling.");
    }
  };

  if (isPlaceholder) {
    return (
      <div className="bg-card border rounded-2xl overflow-hidden animate-pulse">
        <div className="h-44 skeleton" />
        <div className="p-4 space-y-3">
          <div className="h-4 skeleton rounded w-3/4" />
          <div className="h-3 skeleton rounded w-1/2" />
          <div className="h-3 skeleton rounded w-2/3" />
          <div className="flex gap-2 pt-1">
            <div className="h-9 skeleton rounded-lg flex-1" />
            <div className="h-9 skeleton rounded-lg flex-1" />
          </div>
        </div>
      </div>
    );
  }

  if (!hasMounted) return null;

  return (
    <div className="bg-card border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col group">
      {/* Image */}
      <div className="relative h-44 bg-muted overflow-hidden">
        <Image
          src={displayImage}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          priority={priority}
        />
        {/* Language badge */}
        <div className="absolute top-2 left-2">
          <span className="bg-background/90 backdrop-blur text-foreground text-[11px] font-semibold px-2 py-1 rounded-md">
            {type || "Hinglish"}
          </span>
        </div>
        {/* Free badge */}
        <div className="absolute top-2 right-2">
          <span className="bg-emerald-500 text-white text-[11px] font-bold px-2 py-1 rounded-md">
            FREE
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <h3 className="font-semibold text-sm leading-snug line-clamp-2">{title}</h3>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          {forText && (
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{forText}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <CalendarCheck2 className="w-3.5 h-3.5 shrink-0" />
            <span>{startDate} – {endDate}</span>
          </div>
        </div>

        {price && (
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-muted-foreground line-through">₹{price}</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹0</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <button
            onClick={() => router.push(`/study/batches/${id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold border rounded-lg py-2.5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
          >
            Open <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {isEnrolled ? (
            <button
              onClick={handleUnenroll}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold bg-destructive/10 text-destructive rounded-lg py-2.5 hover:bg-destructive hover:text-white transition-all"
            >
              <PinOff className="w-3.5 h-3.5" /> Unenroll
            </button>
          ) : (
            <button
              onClick={handleEnroll}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg py-2.5 hover:opacity-90 transition-all"
            >
              <BookmarkPlus className="w-3.5 h-3.5" /> Enroll
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
