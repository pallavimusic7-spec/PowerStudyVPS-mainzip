import React from "react";
import Image from "next/image";
import { Clock, Play } from "lucide-react";

interface LiveClassCardProps {
  teacherName: string;
  teacherImage?: string;
  subject: string;
  startTime: string;
  tag: string;
  onClick?: () => void;
  priority?: boolean;
}

const tagConfig: Record<string, { bg: string; text: string; dot?: string }> = {
  LIVE:     { bg: "bg-red-500",     text: "text-white",         dot: "bg-white animate-pulse" },
  UPCOMING: { bg: "bg-primary/10",  text: "text-primary"        },
  ENDED:    { bg: "bg-muted",       text: "text-muted-foreground" },
};

const LiveClassCard: React.FC<LiveClassCardProps> = ({
  teacherName,
  teacherImage = "/assets/img/teacher-placeholder.png",
  subject,
  startTime,
  tag,
  onClick,
  priority = false,
}) => {
  const tagKey = tag?.toUpperCase() || "UPCOMING";
  const cfg = tagConfig[tagKey] || { bg: "bg-muted", text: "text-muted-foreground" };

  return (
    <div
      className="bg-card border rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer select-none flex flex-col group"
      style={{ width: 200, minWidth: 200, maxWidth: 200 }}
      onClick={onClick}
    >
      {/* Teacher image */}
      <div className="relative h-28 bg-muted overflow-hidden">
        <Image
          src={teacherImage}
          alt={teacherName || "Teacher"}
          fill
          style={{ objectFit: "contain" }}
          draggable={false}
          priority={priority}
        />
        {/* Play overlay on hover */}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 flex items-center justify-center transition-all duration-200">
          <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200 shadow">
            <Play className="w-4 h-4 text-primary fill-primary ml-0.5" />
          </div>
        </div>
        {/* Tag */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
            {cfg.dot && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
            {tag}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-xs font-semibold line-clamp-2 text-foreground leading-snug">{subject}</p>
        {teacherName?.trim() && (
          <p className="text-[11px] text-muted-foreground truncate">{teacherName}</p>
        )}
        <div className="flex items-center gap-1 mt-auto pt-1 text-[11px] text-muted-foreground">
          <Clock className="w-3 h-3 shrink-0" />
          {startTime}
        </div>
      </div>
    </div>
  );
};

export default LiveClassCard;
