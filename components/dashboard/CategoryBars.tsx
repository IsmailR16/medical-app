"use client";

import { motion } from "motion/react";
import { ClipboardCheck, TrendingUp, TrendingDown } from "lucide-react";

interface CategoryData {
  category: string;
  score: number;
  trend: string | null;
  trendUp: boolean;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.32, 0.72, 0, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export function CategoryBars({ categories }: { categories: CategoryData[] }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="p-6 space-y-6"
    >
      {categories.map((item) => (
        <motion.div key={item.category} variants={fadeUp}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#457b9d]/[0.06] flex items-center justify-center">
                <ClipboardCheck className="w-3.5 h-3.5 text-[#457b9d]" strokeWidth={1.5} />
              </div>
              <h3 className="text-[14px] font-semibold text-[#1d3557]">{item.category}</h3>
            </div>
            <div className="flex items-center gap-4">
              {item.trend && (
                <div
                  className={`flex items-center gap-1 text-[12px] font-semibold ${
                    item.trendUp ? "text-emerald-600" : "text-[#e63946]"
                  }`}
                >
                  {item.trendUp ? (
                    <TrendingUp className="w-3.5 h-3.5" strokeWidth={1.5} />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" strokeWidth={1.5} />
                  )}
                  {item.trend}%
                </div>
              )}
              <span className="text-xl font-extrabold text-[#1d3557] tracking-tight font-mono min-w-[40px] text-right">
                {item.score}
              </span>
            </div>
          </div>
          <div className="w-full bg-[#F9FAFB] rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.score}%` }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className={`h-full rounded-full ${
                item.trendUp ? "bg-[#457b9d]" : "bg-[#e63946]"
              }`}
            />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
