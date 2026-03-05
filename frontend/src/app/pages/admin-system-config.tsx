import { useState } from "react";
import { ArrowLeft, Settings, Save, Globe, Mail, Bell, Shield, Database, Clock } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

export function AdminSystemConfig() {
  const [config, setConfig] = useState({
    siteName: "API Management Platform",
    siteUrl: "https://api-platform.example.com",
    adminEmail: "admin@example.com",
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "noreply@example.com",
    smtpPassword: "••••••••",
    autoApproveAPIs: false,
    requireEmailVerification: true,
    maxAPIsPerUser: "10",
    sessionTimeout: "30",
    enableNotifications: true,
    enableApiAnalytics: true,
    maintenanceMode: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Configuration saved successfully!");
    }, 1000);
  };

  const updateConfig = (key: string, value: string | boolean) => {
    setConfig({ ...config, [key]: value });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
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
            <Settings className="w-8 h-8 text-indigo-600" />
            System Configuration
          </h1>
          <p className="text-slate-500 mt-1">Manage platform settings and preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-70"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">General Settings</h2>
              <p className="text-sm text-slate-500">Basic platform configuration</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={config.siteName}
                onChange={(e) => updateConfig("siteName", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Site URL
              </label>
              <input
                type="text"
                value={config.siteUrl}
                onChange={(e) => updateConfig("siteUrl", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Admin Email
            </label>
            <input
              type="email"
              value={config.adminEmail}
              onChange={(e) => updateConfig("adminEmail", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Email Configuration</h2>
              <p className="text-sm text-slate-500">SMTP server settings</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                SMTP Host
              </label>
              <input
                type="text"
                value={config.smtpHost}
                onChange={(e) => updateConfig("smtpHost", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                SMTP Port
              </label>
              <input
                type="text"
                value={config.smtpPort}
                onChange={(e) => updateConfig("smtpPort", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                SMTP Username
              </label>
              <input
                type="text"
                value={config.smtpUser}
                onChange={(e) => updateConfig("smtpUser", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                SMTP Password
              </label>
              <input
                type="password"
                value={config.smtpPassword}
                onChange={(e) => updateConfig("smtpPassword", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* API Settings */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">API Settings</h2>
              <p className="text-sm text-slate-500">Configure API behavior</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Max APIs per User
              </label>
              <input
                type="number"
                value={config.maxAPIsPerUser}
                onChange={(e) => updateConfig("maxAPIsPerUser", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={config.sessionTimeout}
                onChange={(e) => updateConfig("sessionTimeout", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>
          
          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
              <div>
                <div className="font-bold text-slate-900 text-sm">Auto-approve API Requests</div>
                <div className="text-xs text-slate-500 mt-0.5">Automatically approve new API registrations</div>
              </div>
              <input
                type="checkbox"
                checked={config.autoApproveAPIs}
                onChange={(e) => updateConfig("autoApproveAPIs", e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
              <div>
                <div className="font-bold text-slate-900 text-sm">Require Email Verification</div>
                <div className="text-xs text-slate-500 mt-0.5">Users must verify email before using platform</div>
              </div>
              <input
                type="checkbox"
                checked={config.requireEmailVerification}
                onChange={(e) => updateConfig("requireEmailVerification", e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
              <div>
                <div className="font-bold text-slate-900 text-sm">Enable Notifications</div>
                <div className="text-xs text-slate-500 mt-0.5">Send email notifications for important events</div>
              </div>
              <input
                type="checkbox"
                checked={config.enableNotifications}
                onChange={(e) => updateConfig("enableNotifications", e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
              <div>
                <div className="font-bold text-slate-900 text-sm">Enable API Analytics</div>
                <div className="text-xs text-slate-500 mt-0.5">Track API usage and performance metrics</div>
              </div>
              <input
                type="checkbox"
                checked={config.enableApiAnalytics}
                onChange={(e) => updateConfig("enableApiAnalytics", e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">System Settings</h2>
              <p className="text-sm text-slate-500">Advanced system controls</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <label className="flex items-center justify-between p-4 bg-rose-50 rounded-xl border-2 border-rose-200 cursor-pointer hover:bg-rose-100 transition-colors">
            <div>
              <div className="font-bold text-rose-900 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Maintenance Mode
              </div>
              <div className="text-xs text-rose-700 mt-0.5">Disable public access for system maintenance</div>
            </div>
            <input
              type="checkbox"
              checked={config.maintenanceMode}
              onChange={(e) => updateConfig("maintenanceMode", e.target.checked)}
              className="w-5 h-5 text-rose-600 rounded focus:ring-2 focus:ring-rose-500"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
