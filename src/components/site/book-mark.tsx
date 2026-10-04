export function BranchMark({
  className = "",
  size = 74,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r="43"
        stroke="currentColor"
        strokeWidth="0.65"
        opacity="0.45"
      />
      <path
        d="M48 80 Q54 53 48 20 M50 62 Q31 55 27 38 M51 54 Q68 48 74 29 M50 40 Q38 36 35 25 M51 68 Q67 63 74 49 M31 49 L20 45 M68 42 L79 39 M54 72 L64 78"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="48" cy="18" r="2" fill="currentColor" />
    </svg>
  );
}
export function BookCover() {
  return (
    <div
      aria-hidden="true"
      className="flex h-36 w-24 shrink-0 flex-col items-center justify-between rounded-r-lg rounded-l-sm border border-[#47604c] bg-[#243b2d] py-4 text-[#c6ae80] shadow-lg"
      style={{ borderLeft: "7px solid #364b3c" }}
    >
      <span className="font-serif text-base">Zenith</span>
      <BranchMark size={60} />
      <span className="h-px w-8 bg-current opacity-50" />
    </div>
  );
}
