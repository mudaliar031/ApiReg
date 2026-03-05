import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { LogOut, LayoutDashboard, Database, ShieldCheck, User as UserIcon, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export function Root() {
  const [user, setUser] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("userRole");
    
    // Parse user object if it exists
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        // Store email for display in sidebar
        setUser(userObj.email || userObj.fullName || storedUser);
      } catch {
        // If parsing fails, use as-is
        setUser(storedUser);
      }
    }
    setRole(storedRole);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    setUser(null);
    setRole(null);
    navigate("/");
  };

  const isLoginPage = location.pathname === "/";
  const isPublicPage = isLoginPage || location.pathname === "/forgot-password" || location.pathname === "/reset-password";

  if (isPublicPage) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Outlet />
        <Toaster position="top-right" richColors />
      </main>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            exit={{ x: -250 }}
            className="w-64 bg-slate-900 text-white flex flex-col z-50 fixed inset-y-0 lg:relative"
          >
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Database className="w-6 h-6 text-blue-400" />
                <span className="font-bold text-xl tracking-tight">API</span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1 rounded-md hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-4">
              {role === "user" && (
                <>
                  <Link
                    to="/user/dashboard"
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      location.pathname.includes("/user/dashboard")
                        ? "bg-blue-600 text-white"
                        : "hover:bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>User Dashboard</span>
                  </Link>
                  <Link
                    to="/user/register"
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      location.pathname.includes("/user/register")
                        ? "bg-blue-600 text-white"
                        : "hover:bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Database className="w-5 h-5" />
                    <span>Register API</span>
                  </Link>
                </>
              )}

              {role === "admin" && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      location.pathname.includes("/admin/dashboard")
                        ? "bg-indigo-600 text-white"
                        : "hover:bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>Admin Panel</span>
                  </Link>

                  <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Management
                  </div>

                  <Link
                    to="/admin/manage-users"
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      location.pathname.includes("/admin/manage-users")
                        ? "bg-indigo-600 text-white"
                        : "hover:bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>Manage Users</span>
                  </Link>
                </>
              )}
            </nav>

            <div className="p-4 border-t border-slate-800">
              <div className="flex items-center gap-3 px-3 py-2 text-slate-400 mb-4">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold uppercase text-white">
                  {user?.[0] || "U"}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-white truncate">{user}</span>
                  <span className="text-xs text-slate-500 capitalize">{role}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Log out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-auto flex flex-col relative">
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 h-16 flex items-center px-6">
          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="mr-4 p-2 rounded-md hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="font-semibold text-slate-800">
            {role === "admin" ? "Admin Management" : "User Dashboard"}
          </div>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}