import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router";
import { Plus, Trash2, Save, ArrowLeft, Info, Key, Globe, Layout, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { apiFetch } from "../../utils/api";

type FormValues = {
  name: string;
  description: string;
  fields: { key: string; value: string }[];
};

export function UserRegisterApi() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { register, control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: "",
      description: "",
      fields: [{ key: "", value: "" }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields"
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      // Filter out empty fields before sending
      const validFields = data.fields.filter(f => f.key && f.key.trim() !== "");

      // Send API request to backend
      const result = await apiFetch("/user/request-api", {
        method: "POST",
        body: JSON.stringify({
          apiName: data.name,
          description: data.description,
          fields: validFields,
        }),
      });

      if (result) {
        setIsSubmitting(false);
        toast.success("API Registration Request Submitted Successfully!");
        navigate("/user/dashboard");
      }
    } catch (error: any) {
      setIsSubmitting(false);
      toast.error(error.message || "Failed to submit API registration request");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <button 
        onClick={() => navigate("/user/dashboard")}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Register New API</h1>
              <p className="text-sm text-slate-500">Provide details for your external integration</p>
            </div>
          </div>
          <div className="flex gap-2">
            {[1, 2].map(i => (
              <div 
                key={i} 
                className={`w-10 h-1.5 rounded-full transition-all duration-300 ${step >= i ? "bg-blue-600" : "bg-slate-200"}`} 
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Layout className="w-4 h-4 text-blue-500" />
                      API Name
                    </label>
                    <input
                      {...register("name", { required: "Name is required" })}
                      placeholder="Enter API Name"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />
                    {errors.name && <span className="text-xs text-rose-500">{errors.name.message}</span>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    placeholder="Enter API Description"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                  >
                    Next Step
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Configuration Fields</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => append({ key: "", value: "" })}
                    className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Field
                  </button>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {fields.map((field, index) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={field.id}
                      className="flex gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl relative group"
                    >
                      <div className="flex-1">
                        <input
                          type="text"
                          {...register(`fields.${index}.key` as const, { required: true })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          {...register(`fields.${index}.value` as const, { required: true })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="self-end p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all"
                  >
                    Previous Step
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-70"
                  >
                    {isSubmitting ? "Submitting..." : (
                      <>
                        <Save className="w-5 h-5" />
                        Submit API Registration
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}