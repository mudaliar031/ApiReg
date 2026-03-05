import { useState, useEffect, useCallback } from "react";
import { ShieldCheck, Activity, Search, ShieldAlert, Filter, Eye, CheckCircle, XCircle, RefreshCw, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { FilterModal } from "../components/filter-modal";
import { ApiRequestActionsMenu } from "../components/api-request-actions-menu";
import { AdminApiDetailsModal } from "../components/admin-api-details-modal";
import { apiFetch } from "../../utils/api";

interface ApiRequest {
  id: string;
  name: string;
  user: string;
  userEmail: string;
  description: string;
  status: "pending" | "active" | "approved" | "rejected" | "revoked";
  createdAt: string;
  fields?: { key: string; value: string }[];
  apiKey?: string;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "suspended";
  apiCount: number;
}

export function AdminDashboard() {
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedApiRequest, setSelectedApiRequest] = useState<ApiRequest | null>(null);
  const [filters, setFilters] = useState<{ status?: string; role?: string; dateRange?: string }>({});

  // Fetch requests from API
  const fetchRequests = useCallback(async () => {
    try {
      const data = await apiFetch("/admin/requests");
      if (data) {
        // Transform API data to match component format
        const transformedRequests = data.map((req: any) => ({
          id: req._id,
          name: req.apiName || "Unnamed API",
          user: req.user?.fullName || "Unknown User",
          userEmail: req.user?.email || "No email",
          description: req.description || "No description",
          status: req.status === "approved" ? "active" : req.status,
          createdAt: req.createdAt,
          apiKey: req.apiKey,
          fields: req.fields && req.fields.length > 0 
            ? req.fields 
            : req.apiKey 
              ? [{ key: "API Key", value: req.apiKey }] 
              : [],
        }));
        setRequests(transformedRequests);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  }, []);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      const data = await apiFetch("/admin/users");
      if (data) {
        const transformedUsers = data.map((user: any) => ({
          id: user._id,
          name: user.fullName,
          email: user.email,
          role: user.role,
          status: user.status,
          apiCount: user.apiCount || 0,
        }));
        setUsers(transformedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  // Initial fetch and polling for real-time updates
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchRequests(), fetchUsers()]);
      setIsLoading(false);
    };

    loadData();

    // Poll every 5 seconds for real-time updates
    const interval = setInterval(() => {
      fetchRequests();
      fetchUsers();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchRequests, fetchUsers]);

  const handleApprove = async (id: string) => {
    try {
      const data = await apiFetch(`/admin/apis/${id}/approve`, {
        method: "POST",
      });
      if (data) {
        // Update local state
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "active" as const, fields: data.request?.apiKey ? [{ key: "API Key", value: data.request.apiKey }] : [] } : r));
        toast.success("API request approved successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to approve request");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const data = await apiFetch(`/admin/apis/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ feedback: "Request rejected by admin" }),
      });
      if (data) {
        // Update local state
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "rejected" as const } : r));
        toast.error("API request rejected");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to reject request");
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      const data = await apiFetch(`/admin/apis/${id}/revoke`, {
        method: "POST",
      });
      if (data) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "revoked" as const } : r));
        toast.warning("API access revoked");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to revoke access");
    }
  };

  const handleSetPendingApproval = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "pending" as const } : r));
    toast.info("API set to pending approval");
  };

  const handleUnrevoke = async (id: string) => {
    try {
      const data = await apiFetch(`/admin/apis/${id}/unrevoke`, {
        method: "POST",
      });
      if (data) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "active" as const, fields: data.request?.apiKey ? [{ key: "API Key", value: data.request.apiKey }] : [] } : r));
        toast.success("API access restored successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to restore API access");
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (confirm("Are you sure you want to delete this request?")) {
      try {
        // Call backend to delete the request
        await apiFetch(`/admin/requests/${id}`, {
          method: "DELETE",
        });
        
        // Remove from local state after successful deletion
        setRequests(prev => prev.filter(r => r.id !== id));
        toast.success("Request deleted successfully");
      } catch (error: any) {
        console.error("Error deleting request:", error);
        toast.error(error.message || "Failed to delete request");
      }
    }
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchRequests(), fetchUsers()]);
    setIsRefreshing(false);
    toast.success("Data refreshed");
  };

  const handleApplyFilters = (newFilters: { status?: string; role?: string; dateRange?: string }) => {
    setFilters(newFilters);
    toast.success("Filters applied");
  };

  // Helper function to check if a date is within the specified range
  const isWithinDateRange = (date: string, range: string): boolean => {
    const requestDate = new Date(date);
    const now = new Date();
    
    switch (range) {
      case "today":
        return requestDate.toDateString() === now.toDateString();
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return requestDate >= weekAgo;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return requestDate >= monthAgo;
      default:
        return true;
    }
  };

  // Apply all filters (search + status + date range)
  const filteredRequests = requests.filter(r => {
    // Search filter
    const matchesSearch = 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = !filters.status || filters.status === "all" || r.status === filters.status;
    
    // Date range filter
    const matchesDate = !filters.dateRange || filters.dateRange === "all" || isWithinDateRange(r.createdAt, filters.dateRange);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            Admin Management
          </h1>
          <p className="text-slate-500">Oversee all API registrations and system users</p>
        </div>
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
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total APIs", count: requests.length, color: "blue", icon: Activity },
          { label: "Pending Approval", count: requests.filter(r => r.status === "pending").length, color: "amber", icon: Activity },
          { label: "Active APIs", count: requests.filter(r => r.status === "active").length, color: "emerald", icon: Activity },
          { label: "Suspended APIs", count: requests.filter(r => r.status === "revoked").length, color: "rose", icon: Activity },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-bold text-slate-900 mt-1`}>{stat.count}</p>
            </div>
            <stat.icon className={`absolute -right-2 -bottom-2 w-16 h-16 opacity-5 text-${stat.color}-600 group-hover:scale-110 transition-transform`} />
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden min-h-[500px]">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search API requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors border border-slate-200"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-24 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-slate-500 font-medium">Crunching system data...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Requester</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">API Details</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {filteredRequests.map((req) => (
                    <motion.tr
                      key={req.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                            {req.user[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{req.user}</div>
                            <div className="text-[10px] text-slate-500">{req.userEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 text-sm">{req.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">{req.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide
                          ${req.status === "active" ? "text-emerald-600 bg-emerald-50 border-emerald-100" : 
                            req.status === "pending" ? "text-amber-600 bg-amber-50 border-amber-100" :
                            "text-rose-600 bg-rose-50 border-rose-100"}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedApiRequest(req)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {req.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(req.id)}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(req.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <ApiRequestActionsMenu
                            id={req.id}
                            status={req.status}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onRevoke={handleRevoke}
                            onUnrevoke={handleUnrevoke}
                            onSetPendingApproval={handleSetPendingApproval}
                            onDelete={handleDeleteRequest}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}

          {!isLoading && filteredRequests.length === 0 && (
            <div className="p-16 text-center">
              <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">No results found</h3>
              <p className="text-slate-500 mt-1">Try a different search term or filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
      />

      {/* Admin API Details Modal */}
      {selectedApiRequest && (
        <AdminApiDetailsModal
          isOpen={true}
          onClose={() => setSelectedApiRequest(null)}
          request={selectedApiRequest}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}