import { X, ExternalLink, CheckCircle2, Clock, XCircle, Key, Copy, Info, Terminal, Shield } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface ApiDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  api: {
    id: string;
    name: string;
    endpoint: string;
    status: "pending" | "active" | "rejected" | "revoked";
    createdAt: string;
    fields: { key: string; value: string }[];
    description?: string;
  } | null;
}

export function ApiDetailsModal({ isOpen, onClose, api }: ApiDetailsModalProps) {
  if (!isOpen || !api) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "pending": return "text-amber-600 bg-amber-50 border-amber-100";
      case "rejected": return "text-rose-600 bg-rose-50 border-rose-100";
      case "revoked": return "text-slate-600 bg-slate-50 border-slate-100";
      default: return "text-slate-600 bg-slate-50 border-slate-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle2 className="w-5 h-5" />;
      case "pending": return <Clock className="w-5 h-5" />;
      case "rejected": return <XCircle className="w-5 h-5" />;
      default: return <XCircle className="w-5 h-5" />;
    }
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API Key copied to clipboard!");
  };

  // Check if API is approved (active)
  const isApproved = api.status === "active" || api.status === "approved";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900">{api.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(api.status)} capitalize`}>
                  {getStatusIcon(api.status)}
                  {api.status}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
            {/* Configuration Fields - Show for all statuses */}
            {api.fields && api.fields.length > 0 && (
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Key className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Configuration Details
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {api.fields.map((field, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500 uppercase">{field.key}:</span>
                        {field.key.toLowerCase().includes("key") || field.key.toLowerCase().includes("token") || field.key.toLowerCase().includes("secret") ? (
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono text-slate-700">{"•".repeat(Math.min(field.value.length, 20))}</code>
                            <button
                              onClick={() => handleCopyApiKey(field.value)}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Copy"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-700 font-mono">{field.value || "(not set)"}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show API Key usage instructions for approved APIs */}
                {isApproved && api.fields.some(f => f.key === "API Key") && (
                  <>
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="bg-white/60 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2 text-blue-800 font-semibold text-sm">
                          <Terminal className="w-4 h-4" />
                          How to use your API Key
                        </div>
                        <div className="text-xs text-slate-600 space-y-2">
                          <p>Include your API key in the request header:</p>
                          <div className="bg-slate-800 text-slate-200 rounded p-3 font-mono text-xs overflow-x-auto">
                            <p>Authorization: Bearer YOUR_API_KEY</p>
                            <p className="text-slate-400 mt-1"># Example with curl:</p>
                            <p>curl -H "Authorization: Bearer YOUR_API_KEY" \</p>
                            <p className="pl-4">-H "Content-Type: application/json" \</p>
                            <p className="pl-4">{api.endpoint || "https://api.example.com"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* API Key */}
            {api.endpoint && api.endpoint !== "No API Key" && (
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                  API Key
                </h3>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <code className="flex-1 text-sm font-mono text-slate-700 break-all">
                    {api.endpoint}
                  </code>
                  <button
                    onClick={() => handleCopyApiKey(api.endpoint)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Copy API Key"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Description */}
            {api.description && (
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Description
                </h3>
                <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  {api.description}
                </p>
              </div>
            )}

            {/* Pending Status Message */}
            {api.status === "pending" && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-800">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">Pending Approval</span>
                </div>
                <p className="text-sm text-amber-700 mt-2">
                  Your API request is currently under review. You will be notified once it's approved.
                </p>
              </div>
            )}

            {/* Rejected Status Message */}
            {api.status === "rejected" && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-rose-800">
                  <XCircle className="w-5 h-5" />
                  <span className="font-semibold">Request Rejected</span>
                </div>
                {api.fields?.some(f => f.key === "feedback") && (
                  <p className="text-sm text-rose-700 mt-2">
                    Reason: {api.fields.find(f => f.key === "feedback")?.value}
                  </p>
                )}
              </div>
            )}

            {/* Metadata */}
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                Registration Details
              </h3>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">API ID:</span>
                  <span className="font-mono text-slate-700">{api.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Registered:</span>
                  <span className="text-slate-700">
                    {new Date(api.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
