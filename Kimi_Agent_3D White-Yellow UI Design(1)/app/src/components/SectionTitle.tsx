import { useScrollReveal } from "@/hooks/useScrollReveal";

interface SectionTitleProps {
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
}

export default function SectionTitle({
  eyebrow,
  title,
  description,
  centered = false,
}: SectionTitleProps) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`${centered ? "text-center" : ""} ${
        isVisible ? "reveal-visible" : "reveal-hidden"
      }`}
    >
      <span className="text-xs font-medium text-[#FFD100] uppercase tracking-[0.1em]">
        {eyebrow}
      </span>
      <h2 className="text-[32px] font-semibold text-[#1A1D20] tracking-tight mt-2 leading-tight">
        {title}
      </h2>
      {description && (
        <p className="text-base text-[#656B73] mt-3 max-w-[560px] leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
