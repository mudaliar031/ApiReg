import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Users,
  Search,
  UserPlus,
  Trash2,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { toast } from "sonner";

import { AddUserModal } from "../components/add-user-modal";
import { UserApisModal } from "../components/user-apis-modal";
import { apiFetch } from "../../utils/api";

interface ApiRecord {
  id: string;
  name: string;
  endpoint: string;
  status: "pending" | "active" | "rejected" | "revoked";
  createdAt: string;
  fields: { key: string; value: string }[];
}

interface UserRecord {
  _id: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "suspended" | "deactivated";
  createdAt: string;
  apiCount: number;
}

export function AdminManageUsers() {
  // ============== STATE ==============
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [userApis, setUserApis] = useState<ApiRecord[]>([]);
  const [isUserApisModalOpen, setIsUserApisModalOpen] = useState(false);
  const [isLoadingApis, setIsLoadingApis] = useState(false);

  // ============== FETCH USERS ==============
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch("/admin/users");
      
      if (Array.isArray(data)) {
        const formattedUsers: UserRecord[] = data.map((u: any) => ({
          _id: u._id || u.id || "",
          fullName: u.fullName || u.name || "Unknown",
          email: u.email || "",
          role: u.role || "user",
          status: u.status || "active",
          createdAt: u.createdAt || new Date().toISOString(),
          apiCount: u.apiCount || 0,
        }));
        setUsers(formattedUsers);
      }
    } catch (err: any) {
      console.error("Error fetching users:", err);
      const errorMsg = err?.message || "Failed to connect to server";
      if (errorMsg.includes("fetch") || errorMsg.includes("network")) {
        toast.error("Server is not responding. Make sure backend is running on http://localhost:5000");
      } else {
        toast.error(`Failed to fetch users: ${errorMsg}`);
      }
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ============== SEARCH FILTER ==============
  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============== FETCH USER APIs ==============
  const handleViewUserApis = async (user: UserRecord) => {
    setSelectedUser(user);
    setIsLoadingApis(true);
    setIsUserApisModalOpen(true);
    
    try {
      const data = await apiFetch(`/admin/users/${encodeURIComponent(user.email)}/apis`);
      
      if (Array.isArray(data)) {
        const formattedApis: ApiRecord[] = data.map((api: any) => ({
          id: api.id || api._id || "",
          name: api.name || "Unnamed API",
          endpoint: api.endpoint || api.description || "No endpoint",
          status: api.status || "pending",
          createdAt: api.createdAt || new Date().toISOString(),
          fields: api.fields || [],
        }));
        setUserApis(formattedApis);
      } else {
        setUserApis([]);
      }
    } catch (err: any) {
      console.error("Error fetching user APIs:", err);
      toast.error("Failed to fetch user APIs");
      setUserApis([]);
    } finally {
      setIsLoadingApis(false);
    }
  };

  // ============== ADD USER ==============
  const handleAddUser = async (newUser: { name: string; email: string; role: "user" | "admin"; password: string; }) => {
    try {
      const response = await apiFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify({
          fullName: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
        }),
      });
      
      toast.success("User created successfully!");

      const newUserRecord: UserRecord = {
        _id: response.user?._id || `temp_${Date.now()}`,
        fullName: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: "active",
        createdAt: response.user?.createdAt || new Date().toISOString(),
        apiCount: 0,
      };
      setUsers((prev) => [newUserRecord, ...prev]);
      setIsAddUserModalOpen(false);
    } catch (err: any) {
      console.error("Error adding user:", err);
      const errorMsg = err?.message || "Failed to create user";
      toast.error(errorMsg);
      throw err;
    }
  };

  // ============== DELETE USER ==============
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete "${userName}"? This will also delete all their API registrations.`)) return;
    
    try {
      await apiFetch(`/admin/users/${userId}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("User deleted successfully");
    } catch (err: any) {
      console.error("Error deleting user:", err);
      toast.error(err?.message || "Failed to delete user");
    }
  };

  // ============== SUSPEND USER ==============
  const handleSuspendUser = async (userId: string) => {
    try {
      await apiFetch(`/admin/users/${userId}/suspend`, { method: "POST" });
      setUsers((prev) =>
        prev.map((u) => {
          if (u._id === userId) {
            return { ...u, status: "suspended" };
          }
          return u;
        })
      );
      toast.success("User suspended successfully");
    } catch (err: any) {
      console.error("Error suspending user:", err);
      toast.error(err?.message || "Failed to suspend user");
    }
  };

  // ============== ACTIVATE USER ==============
  const handleActivateUser = async (userId: string) => {
    try {
      await apiFetch(`/admin/users/${userId}/activate`, { method: "POST" });
      setUsers((prev) =>
        prev.map((u) => {
          if (u._id === userId) {
            return { ...u, status: "active" };
          }
          return u;
        })
      );
      toast.success("User activated successfully");
    } catch (err: any) {
      console.error("Error activating user:", err);
      toast.error(err?.message || "Failed to activate user");
    }
  };

  // ============== DEACTIVATE USER ==============
  const handleDeactivateUser = async (userId: string) => {
    try {
      await apiFetch(`/admin/users/${userId}/deactivate`, { method: "POST" });
      setUsers((prev) =>
        prev.map((u) => {
          if (u._id === userId) {
            return { ...u, status: "deactivated" };
          }
          return u;
        })
      );
      toast.success("User deactivated successfully");
    } catch (err: any) {
      console.error("Error deactivating user:", err);
      toast.error(err?.message || "Failed to deactivate user");
    }
  };

  // ============== APPROVE API ==============
  const handleApproveApi = async (apiId: string) => {
    try {
      await apiFetch(`/admin/apis/${apiId}/approve`, { method: "POST" });
      
      // Update the API in state
      setUserApis((prev) =>
        prev.map((api) => {
          if (api.id === apiId) {
            return { ...api, status: "active" };
          }
          return api;
        })
      );
      
      // Update the user API count
      if (selectedUser) {
        setUsers((prev) =>
          prev.map((u) => {
            if (u.email === selectedUser.email) {
              return { ...u, apiCount: u.apiCount + 1 };
            }
            return u;
          })
        );
      }
      
      toast.success("API approved successfully");
    } catch (err: any) {
      console.error("Error approving API:", err);
      toast.error(err?.message || "Failed to approve API");
    }
  };

  // ============== REVOKE API ==============
  const handleRevokeApi = async (apiId: string) => {
    try {
      await apiFetch(`/admin/apis/${apiId}/revoke`, { method: "POST" });
      
      // Update the API in state
      setUserApis((prev) =>
        prev.map((api) => {
          if (api.id === apiId) {
            return { ...api, status: "revoked", fields: [] };
          }
          return api;
        })
      );
      
      toast.warning("API access revoked");
    } catch (err: any) {
      console.error("Error revoking API:", err);
      toast.error(err?.message || "Failed to revoke API");
    }
  };

  // ============== UNREVOKE API (Restore) ==============
  const handleUnrevokeApi = async (apiId: string) => {
    try {
      const data = await apiFetch(`/admin/apis/${apiId}/unrevoke`, { method: "POST" });
      
      // Update the API in state with new API key
      setUserApis((prev) =>
        prev.map((api) => {
          if (api.id === apiId) {
            return { 
              ...api, 
              status: "active",
              fields: data.request?.apiKey ? [{ key: "API Key", value: data.request.apiKey }] : []
            };
          }
          return api;
        })
      );
      
      toast.success("API access restored successfully");
    } catch (err: any) {
      console.error("Error unrevoking API:", err);
      toast.error(err?.message || "Failed to restore API");
    }
  };

  // ============== COMPUTED VALUES ==============
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const suspendedUsers = users.filter((u) => u.status === "suspended").length;
  const deactivatedUsers = users.filter((u) => u.status === "deactivated").length;
  const adminUsers = users.filter((u) => u.role === "admin").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link 
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold mb-3 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-indigo-600" />
            Manage Users
          </h1>
          <p className="text-slate-500 mt-1">View and manage all user accounts</p>
        </div>
        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalUsers}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Users</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activeUsers}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suspended</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{suspendedUsers}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deactivated</p>
          <p className="text-2xl font-bold text-slate-600 mt-1">{deactivatedUsers}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-slate-500 font-medium">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-24 flex flex-col items-center justify-center space-y-4">
            <p className="text-slate-500 font-medium">
              {users.length === 0 ? "No users found" : "No results matching your search"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">APIs</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm uppercase
                          ${user.role === "admin" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{user.fullName}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold uppercase tracking-wider ${user.role === "admin" ? "text-indigo-600" : "text-slate-500"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                        ${user.status === "active" ? "text-emerald-700 bg-emerald-100/50" : 
                          user.status === "suspended" ? "text-rose-700 bg-rose-100/50" :
                          "text-slate-700 bg-slate-100/50"}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${Math.min(user.apiCount * 15, 100)}%` }} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{user.apiCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* View APIs */}
                        <button
                          onClick={() => handleViewUserApis(user)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View APIs"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {/* Suspend / Activate / Deactivate */}
                        {user.status === "active" ? (
                          <button
                            onClick={() => handleSuspendUser(user._id)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Suspend User"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : user.status === "suspended" ? (
                          <>
                            <button
                              onClick={() => handleActivateUser(user._id)}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Activate User"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeactivateUser(user._id)}
                              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Deactivate User"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleActivateUser(user._id)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Activate User"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteUser(user._id, user.fullName)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete User"
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
        )}
      </div>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <AddUserModal
          isOpen={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          onAddUser={handleAddUser}
        />
      )}

      {/* User APIs Modal */}
      {selectedUser && (
        <UserApisModal
          isOpen={isUserApisModalOpen}
          onClose={() => {
            setIsUserApisModalOpen(false);
            setSelectedUser(null);
            setUserApis([]);
          }}
          userName={selectedUser.fullName}
          userEmail={selectedUser.email}
          apis={userApis}
          onRevokeApi={handleRevokeApi}
          onApproveApi={handleApproveApi}
          onUnrevokeApi={handleUnrevokeApi}
          isLoading={isLoadingApis}
        />
      )}
    </div>
  );
}

