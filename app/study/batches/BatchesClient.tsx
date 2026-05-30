"use client";

import { useEffect, useState } from "react";
import BatchCard from "@/app/components/BatchCard";
import { fetchBatches, searchBatch } from "@/utils/api";
import { useDebounce } from "@/utils/useDebounce";
import { Search, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

const Carousel = dynamic(() => import("@/app/components/Carousel"), { ssr: false });

export interface Batch {
  _id: string;
  batchId: string;
  batchName: string;
  batchImage: string;
  language: string;
  template: string;
  startDate: string;
  endDate: string;
  batchPrice: number;
  byName: string;
}

export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, "dd MMM yyyy");
}

export default function BatchesClient() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const searchParams = useSearchParams();

  useEffect(() => { setHasMounted(true); }, []);

  useEffect(() => {
    const toastMsg = searchParams?.get("toast");
    if (toastMsg) toast.error(decodeURIComponent(toastMsg));
  }, [searchParams]);

  useEffect(() => {
    if (!hasMounted) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const activeSearch = debouncedSearchTerm.trim() !== "";
        const response = activeSearch
          ? await searchBatch(debouncedSearchTerm, page)
          : await fetchBatches(page.toString());

        const newBatches = response?.data || [];
        const currentPage = response?.currentPage || 1;
        const totalPages = response?.totalPages || 1;

        setBatches((prev) => page === 1 ? newBatches : [...prev, ...newBatches]);
        setHasMore(currentPage < totalPages);
      } catch (err: any) {
        if (err.response?.status === 401) toast.error("Unauthorized: Please login again.");
        else toast.error("Failed to load batches");
        if (page === 1) setBatches([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [debouncedSearchTerm, page, hasMounted]);

  useEffect(() => {
    setPage(1);
    setBatches([]);
  }, [debouncedSearchTerm]);

  const loadMore = () => { if (!loading && hasMore) setPage((p) => p + 1); };

  if (!hasMounted) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Courses</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Browse and enroll in available courses
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 text-sm bg-card border rounded-xl outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground"
          placeholder="Search courses by name…"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Carousel */}
      <div className="rounded-2xl overflow-hidden border bg-card">
        <Carousel
          items={[
            {
              content: (
                <img
                  src="https://static.pw.live/5eb393ee95fab7468a79d189/ADMIN/2cd05c71-3897-4e88-9c73-3e307e0dde03.jpg"
                  alt="Slide 1"
                  className="w-full h-full object-contain"
                />
              ),
            },
            {
              content: (
                <img
                  src="https://static.pw.live/5eb393ee95fab7468a79d189/ADMIN/4f17deae-eab1-4b19-b5cb-2bb2291d60e5.jpg"
                  alt="Slide 2"
                  className="w-full h-full object-contain"
                />
              ),
            },
            {
              content: (
                <img
                  src="https://static.pw.live/5eb393ee95fab7468a79d189/ADMIN/afeb7785-0e5e-4fc9-95e7-57b328032009.jpg"
                  alt="Slide 3"
                  className="w-full h-full object-contain"
                />
              ),
            },
          ]}
        />
      </div>

      {/* Grid */}
      {loading && page === 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <BatchCard key={i} isPlaceholder />)}
        </div>
      ) : batches.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {batches
              .filter((b) => b.template === "NORMAL")
              .map((batch, i) => (
                <BatchCard
                  key={batch._id}
                  id={batch.batchId}
                  title={batch.batchName}
                  image={batch.batchImage}
                  type={batch.language}
                  startDate={formatDate(batch.startDate)}
                  endDate={formatDate(batch.endDate)}
                  price={batch.batchPrice?.toFixed(0) || "0"}
                  forText={batch.byName || ""}
                  priority={i < 4}
                />
              ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2.5 text-sm font-medium border rounded-xl bg-card hover:bg-secondary transition-colors disabled:opacity-50"
              >
                {loading ? "Loading…" : "Load more courses"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No courses found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
