import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  className?: string;
}

export function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  isLoading,
  className
}: AdminPaginationProps) {
  if (totalPages <= 0) return null;

  return (
    <div className={className || "flex flex-col sm:flex-row items-center justify-between p-4 border-t border-[#d9d4c9] bg-[#faf8f3] gap-4"}>
      {/* Left: results info */}
      <p className="text-[11px] font-semibold text-[#6b6b6b] tracking-wide uppercase">
        Showing page{" "}
        <span className="text-[#14110c] font-black">{currentPage}</span>
        {" "}of{" "}
        <span className="text-[#14110c] font-black">{totalPages}</span>
        {totalItems !== undefined && (
          <>
            {" "}·{" "}
            <span className="text-[#14110c] font-black">{totalItems}</span> total records
          </>
        )}
      </p>

      {/* Right: Prev / Next */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={isLoading || currentPage <= 1}
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#d9d4c9] bg-[#e6e1d8]/60 text-[11px] font-black text-[#14110c] uppercase tracking-widest transition-all duration-200 hover:border-[#b08d3e]/50 hover:bg-[#b08d3e]/10 hover:text-[#b08d3e] disabled:opacity-25 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Previous
        </button>

        <div className="bg-[#e6e1d8]/50 px-4 py-1.5 rounded-lg border border-[#d9d4c9]/50">
          <span className="text-xs font-black text-[#b08d3e]">Page {currentPage}</span>
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={isLoading || currentPage >= totalPages}
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-transparent bg-[#b08d3e] text-[11px] font-black text-[#14110c] uppercase tracking-widest shadow-md shadow-[#b08d3e]/20 transition-all duration-200 hover:bg-[#e6e1d8] hover:shadow-[#b08d3e]/40 disabled:opacity-25 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Next Page
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
