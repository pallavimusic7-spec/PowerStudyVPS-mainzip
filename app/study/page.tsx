"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getEnrolledBatches,
  getTodaysSchedule,
  getUserDetailsList,
} from "@/utils/api";
import { toast } from "sonner";
import LiveClassCard from "@/app/components/LiveClassCard";
import PromotionPopup from "@/app/components/PromotionPopup";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown, ChevronRight, CalendarDays,
  BookOpen, Send, ArrowRight,
} from "lucide-react";

interface ButtonLink { Name: string; Link: string; }
interface Promotion {
  title: string;
  message?: string;
  imageUrl?: string;
  button?: ButtonLink;
}

type EnrolledBatch = { _id: string; batchId: string; name: string };

export default function StudyHome() {
  const router = useRouter();
  const [serverInfo, setServerInfo] = useState<any>(null);
  const [availableClasses, setAvailableClasses] = useState<EnrolledBatch[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [teacherMap, setTeacherMap] = useState<Record<string, { name: string; imageUrl: string }>>({});
  const [selectedClass, setSelectedClass] = useState<EnrolledBatch>({ _id: "", batchId: "", name: "Select Batch" });
  const [errorMsg, setErrorMsg] = useState("");
  const [userName, setUserName] = useState("there");

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const TgChannel = serverInfo?.tg_channel || process.env.NEXT_PUBLIC_TG;

  const promotion: Promotion = {
    title: "Telegram Community !!",
    message: "Join The Channel For Latest Updates 👍 Don't miss any future updates!",
    imageUrl: "https://adsempire.com/blog/wp-content/uploads/adsempire/1132x670_AE_telegram_hid.png",
    button: { Name: "Join Now!", Link: TgChannel },
  };

  useEffect(() => {
    fetch("/api/auth/serverInfo")
      .then((r) => r.json())
      .then((d) => setServerInfo(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const u = localStorage.getItem("USER_DATA");
    if (u) {
      try {
        const p = JSON.parse(u);
        setUserName(p.name?.split(" ")[0] || "there");
      } catch { }
    }
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };
  const onMouseUp = () => setIsDragging(false);
  const onMouseLeave = () => setIsDragging(false);
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current.offsetLeft || 0);
    scrollRef.current.scrollLeft = scrollLeft - (x - startX);
  };

  const fetchTodaysSchedule = async (batchId: string) => {
    try {
      const scheduleRes = await getTodaysSchedule(batchId);
      const scheduleData = (scheduleRes.data || []).filter(
        (item: any) => item.isVideoLecture === true
      );

      const teacherIdSet = new Set<string>();
      scheduleData.forEach((item: any) => {
        if (Array.isArray(item.teachers))
          item.teachers.forEach((id: string) => teacherIdSet.add(id));
      });
      const uniqueTeacherIds = Array.from(teacherIdSet);

      let teacherList: any[] = [];
      if (uniqueTeacherIds.length > 0) {
        const res = await getUserDetailsList(uniqueTeacherIds);
        teacherList = res.data || [];
      }

      const map: Record<string, { name: string; imageUrl: string }> = {};
      teacherList.forEach((t: any) => {
        map[t._id] = {
          name: t.name,
          imageUrl: t.imageId
            ? `${t.imageId.baseUrl}${t.imageId.key}`
            : "/assets/img/teacher-placeholder.png",
        };
      });
      scheduleData.forEach((item: any) => {
        const hasTeachers = Array.isArray(item.teachers) && item.teachers.length > 0;
        if (!hasTeachers && item.videoDetails?.image) {
          map[item._id] = { name: "", imageUrl: item.videoDetails.image };
        }
      });

      setSchedule(scheduleData);
      setTeacherMap(map);
      setErrorMsg("");
    } catch (err: any) {
      setErrorMsg(
        err?.message?.includes("401")
          ? "Session expired. Please log in again."
          : "Could not load today's schedule."
      );
      setSchedule([]);
      setTeacherMap({});
    }
  };

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const data = await getEnrolledBatches();
        const fetched = data.enrolledBatches || [];
        setAvailableClasses(fetched);
        localStorage.setItem("enrolledBatches", JSON.stringify(fetched));
        localStorage.setItem("USER_DATA", JSON.stringify(data.user));

        let finalBatch = fetched[0] || { _id: "", batchId: "", name: "Select Batch" };
        const savedRaw = localStorage.getItem("selectedBatch");
        if (savedRaw && savedRaw !== "undefined") {
          try {
            const saved = JSON.parse(savedRaw);
            const found = fetched.find((b: EnrolledBatch) => b._id === saved._id);
            if (found) finalBatch = found;
          } catch { }
        }

        setSelectedClass(finalBatch);
        localStorage.setItem("selectedBatch", JSON.stringify(finalBatch));
        if (finalBatch.batchId) fetchTodaysSchedule(finalBatch.batchId);
      } catch (err: any) {
        if (err.response?.status === 401) toast.error("Unauthorized. Please login again.");
        else toast.error("Failed to load enrolled batches");
        setAvailableClasses([]);
        setSelectedClass({ _id: "", batchId: "", name: "Select Batch" });
      }
    };
    fetchBatches();
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold capitalize">Hello, {userName} 👋</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Here's what's on for today</p>
      </div>

      {/* Schedule card */}
      <div className="bg-card border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Today's Schedule</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border rounded-lg px-3 py-1.5 transition-colors hover:bg-secondary max-w-[200px]">
                <span className="truncate">{selectedClass.name}</span>
                <ChevronDown className="w-3.5 h-3.5 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-60 overflow-y-auto">
              {availableClasses.length === 0 ? (
                <p className="text-xs text-muted-foreground p-3">No enrolled batches</p>
              ) : (
                availableClasses.map((cls) => (
                  <DropdownMenuItem
                    key={cls._id}
                    onClick={() => {
                      setSelectedClass(cls);
                      localStorage.setItem("selectedBatch", JSON.stringify(cls));
                      fetchTodaysSchedule(cls.batchId);
                    }}
                    className="text-sm cursor-pointer"
                  >
                    {cls.name}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Class cards */}
        <div className="p-4">
          {errorMsg && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3 mb-4">
              {errorMsg}
            </div>
          )}

          <div
            ref={scrollRef}
            className={`flex gap-3 overflow-x-auto no-scrollbar pb-1 ${
              schedule.length > 0 ? "cursor-grab select-none" : ""
            }`}
            style={{ scrollBehavior: "smooth" }}
            onMouseDown={schedule.length > 0 ? onMouseDown : undefined}
            onMouseUp={schedule.length > 0 ? onMouseUp : undefined}
            onMouseLeave={schedule.length > 0 ? onMouseLeave : undefined}
            onMouseMove={schedule.length > 0 ? onMouseMove : undefined}
          >
            {schedule.length === 0 ? (
              <div className="w-full py-12 flex flex-col items-center gap-3 text-muted-foreground">
                <BookOpen className="w-8 h-8 opacity-30" />
                <p className="text-sm">No classes scheduled for today</p>
              </div>
            ) : (
              schedule.map((cls: any, idx: number) => {
                const teacherId = cls.teachers?.[0];
                const teacher = teacherMap[teacherId] || teacherMap[cls._id];
                const teacherName = teacher?.name || "";
                const teacherImage = teacher?.imageUrl;

                const startTime = new Date(cls.startTime);
                const endTime = new Date(cls.endTime);
                const now = new Date();
                const isBefore = now < startTime;
                const isDuring = now >= startTime && now <= endTime;
                const isAfter = now > endTime;

                const hoursLeft = Math.floor(
                  (startTime.getTime() - now.getTime()) / (1000 * 60 * 60)
                );
                const minutesLeft = Math.floor(
                  ((startTime.getTime() - now.getTime()) / (1000 * 60)) % 60
                );

                const handleClick = () => {
                  const { batchId, subjectId, _id: childId, urlType } = cls;
                  if (urlType === "vimeo" || (urlType === "awsVideo" && isBefore)) {
                    toast.error(
                      startTime > now
                        ? `Upcoming in ${hoursLeft > 0 ? `${hoursLeft}h ` : ""}${minutesLeft}m`
                        : "Class hasn't started yet. Try refreshing."
                    );
                  } else if (urlType === "penpencilvdo") {
                    router.push(
                      `/watch?batchId=${batchId}&SubjectId=${subjectId?._id}&ChildId=${childId}&Type=penpencilvdo&isLocked=false`
                    );
                  } else if (urlType === "awsVideo") {
                    if (isDuring) {
                      router.push(
                        `/live?batchId=${batchId}&SubjectId=${subjectId?._id}&ChildId=${childId}&Type=awsVideo`
                      );
                    } else if (isAfter) {
                      toast.error("Live session has ended.");
                    }
                  }
                };

                return (
                  <LiveClassCard
                    key={cls._id}
                    teacherName={teacherName}
                    teacherImage={teacherImage}
                    subject={cls.subjectId?.name || "Subject"}
                    startTime={startTime.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    tag={cls.tag}
                    onClick={handleClick}
                    priority={idx === 0}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t bg-secondary/30 flex justify-end">
          <button
            onClick={() => {
              if (selectedClass.batchId)
                router.push(`/study/batches/${selectedClass.batchId}`);
              else
                toast.error("No batch enrolled yet!");
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition-colors"
          >
            View full schedule <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Community card */}
      <div className="bg-card border rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
            <Send className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Join our community</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Get latest updates and batch info on Telegram
            </p>
          </div>
        </div>
        <button
          onClick={() => TgChannel && window.open(TgChannel, "_blank")}
          className="flex items-center gap-2 text-sm font-semibold bg-sky-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shrink-0"
        >
          Join Telegram <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <PromotionPopup promotion={promotion} />
    </div>
  );
}
