import { X, CheckCircle2, Clock, XCircle, Database, ExternalLink, Ban, Check, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface Api {
  id: string;
  name: string;
  endpoint: string;
  status: "pending" | "active" | "rejected" | "revoked";
  createdAt: string;
  fields: { key: string; value: string }[];
}
interface UserApisModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  apis: Api[];
  onRevokeApi?: (apiId: string) => void;
  onApproveApi?: (apiId: string) => void;
  onUnrevokeApi?: (apiId: string) => void;
  isLoading?: boolean;
}

export function UserApisModal({ isOpen, onClose, userName, userEmail, apis, onRevokeApi, onApproveApi, onUnrevokeApi, isLoading }: UserApisModalProps) {
  if (!isOpen) return null;

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
      case "active": return <CheckCircle2 className="w-4 h-4" />;
      case "pending": return <Clock className="w-4 h-4" />;
      case "rejected": return <XCircle className="w-4 h-4" />;
      case "revoked": return <XCircle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  const handleRevokeApi = (apiId: string) => {
    if (onRevokeApi) {
      onRevokeApi(apiId);
      toast.success("API revoked successfully!");
    }
  };

  const handleApproveApi = (apiId: string) => {
    if (onApproveApi) {
      onApproveApi(apiId);
      toast.success("API approved successfully!");
    }
  };

  const handleUnrevokeApi = (apiId: string) => {
    if (onUnrevokeApi) {
      onUnrevokeApi(apiId);
      toast.success("API restored successfully!");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{userName}'s APIs</h2>
              <p className="text-sm text-slate-500 mt-0.5">{userEmail}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {isLoading ? (
              <div className="py-16 text-center">
                <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Loading APIs...</p>
              </div>
            ) : apis.length > 0 ? (
              <div className="space-y-4">
                {apis.map((api) => (
                  <div
                    key={api.id}
                    className="border border-slate-200 rounded-xl p-5 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900">{api.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono text-slate-600">
                            {api.endpoint}
                          </code>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-blue-500" />
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(api.status)} capitalize`}>
                        {getStatusIcon(api.status)}
                        {api.status}
                      </span>
                    </div>

                    {api.fields && api.fields.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Configuration Fields
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {api.fields.map((field, idx) => (
                            <div key={idx} className="bg-slate-50 rounded-lg p-3">
                              <div className="text-xs font-semibold text-slate-700">{field.key}</div>
                              <div className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                                {field.value || "(empty)"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        Registered on {new Date(api.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="space-x-2">
                        {api.status === "pending" && (
                          <button
                            onClick={() => handleApproveApi(api.id)}
                            className="px-2 py-1 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-500 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {api.status === "revoked" && (
                          <button
                            onClick={() => handleUnrevokeApi(api.id)}
                            className="px-2 py-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-colors"
                            title="Restore API Access"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        {api.status !== "revoked" && (
                          <button
                            onClick={() => handleRevokeApi(api.id)}
                            className="px-2 py-1 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-500 transition-colors"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No APIs Registered</h3>
                <p className="text-slate-500 mt-1">This user hasn't registered any APIs yet.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
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