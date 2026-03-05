import { X, Eye, User, Mail, Globe, Calendar, Key, CheckCircle, XCircle, Copy } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface AdminApiDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: {
    id: string;
    name: string;
    user: string;
    userEmail: string;
    description: string;
    status: "pending" | "active" | "rejected" | "revoked";
    createdAt: string;
    fields?: { key: string; value: string }[];
    apiKey?: string;
  };
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function AdminApiDetailsModal({ isOpen, onClose, request, onApprove, onReject }: AdminApiDetailsModalProps) {
  if (!isOpen) return null;

  const handleApprove = () => {
    if (onApprove) {
      onApprove(request.id);
    }
    onClose();
  };

  const handleReject = () => {
    if (onReject) {
      onReject(request.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">API Registration Details</h2>
              <p className="text-sm text-slate-500 mt-0.5">Complete information about this request</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wide
                ${request.status === "active" ? "text-emerald-600 bg-emerald-50 border-emerald-100" : 
                  request.status === "pending" ? "text-amber-600 bg-amber-50 border-amber-100" :
                  request.status === "rejected" ? "text-rose-600 bg-rose-50 border-rose-100" :
                  "text-slate-600 bg-slate-50 border-slate-100"}`}>
                {request.status}
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(request.createdAt).toLocaleString()}
            </div>
          </div>

          {/* User Information */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              Requester Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                <p className="text-sm font-medium text-slate-900 mt-1">{request.user}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                <p className="text-sm font-medium text-slate-900 mt-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {request.userEmail}
                </p>
              </div>
            </div>
          </div>

          {/* API Information */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              API Configuration
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">API Name</label>
                <p className="text-base font-bold text-slate-900 mt-1">{request.name}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                <div className="mt-1 bg-white rounded-lg p-2 border border-blue-100">
                  <code className="text-sm text-blue-700 font-mono break-all">{request.description}</code>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Fields */}
          {request.fields && request.fields.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600" />
                Configuration Fields
              </h3>
              <div className="space-y-2">
                {request.fields.map((field, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border border-slate-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{field.key}</label>
                        <p className="text-sm font-mono text-slate-900 mt-1 break-all">{field.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API Key Display - Only show for active APIs */}
          {(request.status === "active" || request.status === "revoked") && request.apiKey && (
            <div className="bg-emerald-50 rounded-xl p-4 space-y-3 border border-emerald-100">
              <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-600" />
                API Key
              </h3>
              <div className="bg-white rounded-lg p-3 border border-emerald-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-mono text-emerald-800 break-all">{request.apiKey}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(request.apiKey || "");
                      toast.success("API Key copied to clipboard!");
                    }}
                    className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
                    title="Copy API Key"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-emerald-600">This API key is active and can be used for authentication.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-between gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
          {request.status === "pending" && (
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={handleApprove}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
