import { Eye, FileText, Ban, CheckCircle, Trash2, Clock, MoreVertical, RotateCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface ApiRequestActionsMenuProps {
  id: string;
  status: "pending" | "active" | "rejected" | "revoked";
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRevoke: (id: string) => void;
  onUnrevoke: (id: string) => void;
  onSetPendingApproval: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ApiRequestActionsMenu({
  id,
  status,
  onApprove,
  onReject,
  onRevoke,
  onUnrevoke,
  onSetPendingApproval,
  onDelete,
}: ApiRequestActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (action: (id: string) => void) => {
    action(id);
    setIsOpen(false);
  };

  return (
    <div className="relative flex justify-end" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 bottom-full mb-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50"
          >
            <div className="p-2">
              {status === "pending" && (
                <button
                  onClick={() => handleAction(onApprove)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Approve Request
                </button>
              )}

              {status === "pending" && (
                <button
                  onClick={() => handleAction(onReject)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Ban className="w-4 h-4 text-rose-600" />
                  Reject Request
                </button>
              )}

              {status === "active" && (
                <button
                  onClick={() => handleAction(onRevoke)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  <Ban className="w-4 h-4 text-amber-600" />
                  Revoke Access
                </button>
              )}

              {status === "revoked" && (
                <button
                  onClick={() => handleAction(onUnrevoke)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-emerald-600" />
                  Restore Access
                </button>
              )}

              {(status === "active" || status === "rejected" || status === "revoked") && (
                <button
                  onClick={() => handleAction(onSetPendingApproval)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  <Clock className="w-4 h-4 text-amber-600" />
                  Set Pending Approval
                </button>
              )}

              <div className="my-1 border-t border-slate-200" />

              <button
                onClick={() => handleAction(onDelete)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                Delete Request
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}