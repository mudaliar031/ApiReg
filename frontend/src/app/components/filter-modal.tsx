import { X, Filter, Check } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: { status?: string; role?: string; dateRange?: string }) => void;
  type?: "requests" | "users";
}

export function FilterModal({ isOpen, onClose, onApplyFilters, type = "requests" }: FilterModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("all");

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters({
      status: selectedStatus !== "all" ? selectedStatus : undefined,
      role: selectedRole !== "all" ? selectedRole : undefined,
      dateRange: selectedDateRange !== "all" ? selectedDateRange : undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedStatus("all");
    setSelectedRole("all");
    setSelectedDateRange("all");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Filter className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Filter {type === "requests" ? "Requests" : "Users"}</h2>
              <p className="text-sm text-slate-500 mt-0.5">Refine your search results</p>
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
        <div className="p-6 space-y-6">
          {type === "requests" ? (
            <>
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Status
                </label>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All Statuses" },
                    { value: "pending", label: "Pending Approval" },
                    { value: "active", label: "Active" },
                    { value: "rejected", label: "Rejected" },
                    { value: "revoked", label: "Revoked" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={selectedStatus === option.value}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="text-sm font-medium text-slate-700">{option.label}</span>
                      {selectedStatus === option.value && (
                        <Check className="w-4 h-4 text-indigo-600 ml-auto" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Date Range
                </label>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All Time" },
                    { value: "today", label: "Today" },
                    { value: "week", label: "This Week" },
                    { value: "month", label: "This Month" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="dateRange"
                        value={option.value}
                        checked={selectedDateRange === option.value}
                        onChange={(e) => setSelectedDateRange(e.target.value)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="text-sm font-medium text-slate-700">{option.label}</span>
                      {selectedDateRange === option.value && (
                        <Check className="w-4 h-4 text-indigo-600 ml-auto" />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Role Filter */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Role
                </label>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All Roles" },
                    { value: "user", label: "Users" },
                    { value: "admin", label: "Administrators" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="role"
                        value={option.value}
                        checked={selectedRole === option.value}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="text-sm font-medium text-slate-700">{option.label}</span>
                      {selectedRole === option.value && (
                        <Check className="w-4 h-4 text-indigo-600 ml-auto" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Account Status
                </label>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All Statuses" },
                    { value: "active", label: "Active" },
                    { value: "suspended", label: "Suspended" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={selectedStatus === option.value}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="text-sm font-medium text-slate-700">{option.label}</span>
                      {selectedStatus === option.value && (
                        <Check className="w-4 h-4 text-indigo-600 ml-auto" />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between gap-3">
          <button
            onClick={handleReset}
            className="px-6 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-colors"
          >
            Reset
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              <Filter className="w-4 h-4" />
              Apply Filters
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}