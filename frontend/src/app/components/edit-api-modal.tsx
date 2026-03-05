import { X, Save, Plus, Trash2, Key } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { apiFetch } from "../../utils/api";

interface EditApiModalProps {
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
  onSave: (updatedApi: any) => void;
}

export function EditApiModal({ isOpen, onClose, api, onSave }: EditApiModalProps) {
  const [name, setName] = useState(api?.name || "");
  const [endpoint, setEndpoint] = useState(api?.endpoint || "");
  const [description, setDescription] = useState(api?.description || "");
  const [fields, setFields] = useState(api?.fields || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when api changes or modal opens
  useEffect(() => {
    if (isOpen && api) {
      setName(api.name || "");
      setEndpoint(api.endpoint || "");
      setDescription(api.description || "");
      setFields(api.fields || []);
    }
  }, [isOpen, api]);

  if (!isOpen || !api) return null;

  const handleAddField = () => {
    setFields([...fields, { key: "", value: "" }]);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, key: "key" | "value", value: string) => {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
  };

  const handleSubmit = async () => {
    if (!name || !endpoint) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Filter out empty fields
      const validFields = fields.filter(f => f.key && f.key.trim() !== "");
      
      // Call backend API to update the request
      await apiFetch(`/user/requests/${api?.id}`, {
        method: "PUT",
        body: JSON.stringify({
          apiName: name,
          description: endpoint,
          fields: validFields,
        }),
      });

      const updatedApi = {
        ...api,
        name,
        endpoint,
        description,
        fields: validFields,
      };
      onSave(updatedApi);
      toast.success("API updated successfully!");
      onClose();
    } catch (error: any) {
      console.error("Error updating API:", error);
      toast.error(error.message || "Failed to update API");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Edit API</h2>
            <p className="text-sm text-slate-500 mt-0.5">Update your API configuration</p>
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
          {/* API Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              API Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              placeholder="e.g. Weather Service API"
            />
          </div>

          {/* API URL */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              API URL *
            </label>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              placeholder="https://api.example.com/v1"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              placeholder="Describe what this API does..."
            />
          </div>

          {/* Configuration Fields */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-slate-700">
                Configuration Fields
              </label>
              <button
                onClick={handleAddField}
                className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Field
              </button>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {fields.map((field, index) => (
                <div key={index} className="flex gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Key Name
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        value={field.key}
                        onChange={(e) => handleFieldChange(index, "key", e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="e.g. Authorization"
                      />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Value
                    </label>
                    <input
                      value={field.value}
                      onChange={(e) => handleFieldChange(index, "value", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="e.g. Bearer token_xyz"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveField(index)}
                    className="self-end mb-1 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {fields.length === 0 && (
                <div className="p-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-400 text-sm">No configuration fields added yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-70"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
