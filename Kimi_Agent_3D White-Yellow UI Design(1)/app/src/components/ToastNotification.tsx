import { useEffect } from "react";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToastStore, type ToastItem } from "@/hooks/useToastStore";

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const borderColors = {
  success: "border-l-[#2ECC71]",
  error: "border-l-[#E74C3C]",
  warning: "border-l-[#F39C12]",
  info: "border-l-[#FFD100]",
};

const iconColors = {
  success: "text-[#2ECC71]",
  error: "text-[#E74C3C]",
  warning: "text-[#F39C12]",
  info: "text-[#FFD100]",
};

export default function ToastNotification() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onClose,
}: {
  toast: ToastItem;
  onClose: () => void;
}) {
  const Icon = icons[toast.type];

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`bg-white border border-[#E5E7E9] border-l-[3px] ${borderColors[toast.type]} rounded-xl shadow-lg px-5 py-4 flex items-start gap-3 min-w-[320px] max-w-[400px] animate-[toast-in_400ms_ease]`}
    >
      <Icon className={`w-5 h-5 ${iconColors[toast.type]} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1A1D20]">{toast.message}</p>
        {toast.description && (
          <p className="text-xs text-[#656B73] mt-1">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-[#A7ACB3] hover:text-[#1A1D20] transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
