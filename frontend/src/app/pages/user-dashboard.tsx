import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Filter, Trash2, Edit3, Eye, Copy, CheckCircle2, Clock, XCircle, ExternalLink, RefreshCw, Key, Database, Loader2, Send } from "lucide-react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ApiDetailsModal } from "../components/api-details-modal";
import { EditApiModal } from "../components/edit-api-modal";
import { ResendApiModal } from "../components/resend-api-modal";
import { apiFetch } from "../../utils/api";

interface ApiRegistration {
  id: string;
  name: string;
  endpoint: string;
  status: "pending" | "active" | "rejected" | "revoked";
  createdAt: string;
  fields: { key: string; value: string }[];
  feedback?: string;
  description?: string;
}

export function UserDashboard() {
  const [apis, setApis] = useState<ApiRegistration[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedApi, setSelectedApi] = useState<ApiRegistration | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isResendModalOpen, setIsResendModalOpen] = useState(false);

  // Fetch user's API requests from backend
  const fetchUserApis = useCallback(async () => {
    try {
      const data = await apiFetch("/user/my-requests");
      if (data && Array.isArray(data)) {
        // Transform API data to match component format
        const transformedApis = data.map((req: any) => {
          // For active (approved) APIs, show the API key
          // For other statuses, show the API URL from description
          const isActive = req.status === "approved";
          const displayEndpoint = isActive && req.apiKey 
            ? req.apiKey 
            : (req.description || "No API URL");
          
          return {
            id: req._id,
            name: req.apiName || "Unnamed API",
            endpoint: displayEndpoint,
            description: req.description || "",
            status: isActive ? "active" : req.status,
            createdAt: req.createdAt,
            // Use fields from backend
            fields: req.fields && req.fields.length > 0 
              ? req.fields 
              : [],
            feedback: req.feedback,
          };
        });
        setApis(transformedApis);
      }
    } catch (error) {
      console.error("Error fetching user APIs:", error);
    }
  }, []);

  // Initial fetch and polling for real-time updates
  useEffect(() => {
    const loadApis = async () => {
      setIsLoading(true);
      await fetchUserApis();
      setIsLoading(false);
    };

    loadApis();

    // Poll every 5 seconds for real-time updates (when admin approves/rejects)
    const interval = setInterval(() => {
      fetchUserApis();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchUserApis]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUserApis();
    setIsRefreshing(false);
    toast.success("Data refreshed");
  };

  const filteredApis = apis.filter(api => {
    const matchesSearch = api.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         api.endpoint.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || api.status === filter;
    return matchesSearch && matchesFilter;
  });

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
      default: return <RefreshCw className="w-4 h-4" />;
    }
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API Key copied to clipboard!");
  };

  const handleDeleteApi = async (id: string) => {
    if (confirm("Are you sure you want to delete this API registration?")) {
      try {
        // Call backend to delete the request
        await apiFetch(`/user/requests/${id}`, {
          method: "DELETE",
        });
        
        // Remove from local state after successful deletion
        const updatedApis = apis.filter(api => api.id !== id);
        setApis(updatedApis);
        toast.success("API registration deleted successfully");
      } catch (error: any) {
        console.error("Error deleting API:", error);
        toast.error(error.message || "Failed to delete API registration");
      }
    }
  };

  const handleEditApi = (api: ApiRegistration) => {
    setSelectedApi(api);
    setIsEditModalOpen(true);
  };

  const handleResendApi = (api: ApiRegistration) => {
    setSelectedApi(api);
    setIsResendModalOpen(true);
  };

  const handleViewDetails = (api: ApiRegistration) => {
    setSelectedApi(api);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Registered APIs</h1>
          <p className="text-slate-500">Manage and monitor your connected services</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-semibold hover:bg-slate-200 transition-all disabled:opacity-50"
          >
            {isRefreshing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            Refresh
          </button>
          <Link
            to="/user/register"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Register New API
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total APIs", count: apis.length, color: "blue" },
          { label: "Active", count: apis.filter(a => a.status === "active").length, color: "emerald" },
          { label: "Pending", count: apis.filter(a => a.status === "pending").length, color: "amber" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className={`text-2xl font-bold text-slate-900 mt-1`}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search APIs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* API List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-slate-500 font-medium">Loading your APIs...</p>
          </div>
        ) : filteredApis.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">API Name</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">API Key</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Registered</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApis.map((api) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={api.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{api.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Key className="w-3 h-3" />
                        {api.fields.length} Config fields
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <code className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono truncate max-w-[200px]">
                          {api.endpoint || "No API Key"}
                        </code>
                        {api.status === "active" && api.endpoint && (
                          <button
                            onClick={() => handleCopyApiKey(api.endpoint)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Copy API Key"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(api.status)} capitalize`}>
                        {getStatusIcon(api.status)}
                        {api.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(api.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => handleCopyApiKey(api.endpoint)}
                          title="Copy API Key"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleViewDetails(api)}
                          title="View Details"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditApi(api)}
                          title={api.status === "rejected" ? "Rejected APIs cannot be edited - use Resend instead" : api.status === "revoked" ? "Revoked APIs cannot be edited" : "Edit"}
                          disabled={api.status === "rejected" || api.status === "revoked"}
                          className={`p-1.5 rounded-lg transition-colors ${
                            api.status === "rejected" || api.status === "revoked"
                              ? "text-slate-300 cursor-not-allowed"
                              : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                          }`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {api.status === "rejected" && (
                          <button 
                            onClick={() => handleResendApi(api)}
                            title="Resubmit rejected API"
                            className="p-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteApi(api.id)}
                          title="Delete"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Database className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No APIs found</h3>
            <p className="text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || filter !== "all" 
                ? "Try adjusting your filters or search term to find what you're looking for." 
                : "You haven't registered any APIs yet. Click the button above to get started."}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {isEditModalOpen && selectedApi && (
        <EditApiModal
          isOpen={isEditModalOpen}
          api={selectedApi}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updatedApi) => {
            // Refresh from backend to ensure consistency
            fetchUserApis();
          }}
        />
      )}

      {isResendModalOpen && selectedApi && (
        <ResendApiModal
          isOpen={isResendModalOpen}
          api={selectedApi}
          onClose={() => setIsResendModalOpen(false)}
          onResubmit={(updatedApi) => {
            // Refresh from backend to ensure consistency
            fetchUserApis();
          }}
        />
      )}

      {isDetailsModalOpen && selectedApi && (
        <ApiDetailsModal
          isOpen={isDetailsModalOpen}
          api={selectedApi}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}
    </div>
  );
}