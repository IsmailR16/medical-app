"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { FeedbackModal } from "./FeedbackModal";

interface FeedbackButtonProps {
  collapsed: boolean;
  mobileOpen: boolean;
}

/** Sidebar feedback entry point — opens the shared FeedbackModal. */
export function FeedbackButton({ collapsed, mobileOpen }: FeedbackButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`group flex items-center gap-3 py-2.5 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] whitespace-nowrap w-full text-white/50 hover:bg-white/[0.06] hover:text-white/80 cursor-pointer ${
          collapsed && !mobileOpen ? "justify-center px-0" : "px-3"
        }`}
        aria-label="Skicka feedback"
      >
        <MessageCircle className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.5} />
        {(mobileOpen || !collapsed) && (
          <span className="text-[13px] font-medium">Feedback</span>
        )}
      </button>

      <FeedbackModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
