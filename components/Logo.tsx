import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/Logo_col.svg"
        alt="Logo"
        width={32}
        height={32}
        className="w-8 h-8"
      />
      <span className="text-[15px] font-bold tracking-tight">Diagnostika</span>
    </div>
  );
}
