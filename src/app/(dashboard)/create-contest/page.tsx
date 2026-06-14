"use client";

import { motion } from "framer-motion";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, Save, Trash2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useCreateContestMutation } from "@/services/contestApi";
import { surahList } from "@/data/surahs";
import { toastMessage } from "@/lib/toaster";

// value -> "1. Al-Fatiha" so the Select shows a friendly label when chosen.
const surahItems: Record<string, string> = Object.fromEntries(
  surahList.map((s) => [s.number.toString(), `${s.number}. ${s.name}`]),
);
const questionCountItems: Record<string, string> = Object.fromEntries(
  Array.from({ length: 10 }, (_, i) => [
    (i + 1).toString(),
    `${i + 1} question${i > 0 ? "s" : ""}`,
  ]),
);

const formSchema = z.object({
  name: z.string().min(1, "Contest name is required"),
  date: z.string().min(1, "Competition date is required"),
  startSurah: z.string().min(1, "Start surah is required"),
  endSurah: z.string().min(1, "End surah is required"),
  questionsPerParticipant: z.number().min(1),
  contestants: z.array(z.object({ name: z.string().optional() })),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateContestPage() {
  const router = useRouter();
  const [createContest, { isLoading }] = useCreateContestMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      date: "",
      startSurah: "",
      endSurah: "",
      questionsPerParticipant: 3,
      contestants: [{ name: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contestants",
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createContest({
        name: data.name,
        date: data.date,
        startSurahRange: parseInt(data.startSurah),
        endSurahRange: parseInt(data.endSurah),
        questionsPerContestant: data.questionsPerParticipant,
        contestants: data.contestants
          .filter((c) => c.name?.trim())
          .map((c) => ({ name: c.name as string })),
      }).unwrap();

      toastMessage({
        header: "Success",
        message: "Contest created successfully",
        toastType: "success",
      });
      router.push("/contests");
    } catch {
      toastMessage({
        header: "Could not create contest",
        message: "Something went wrong. Please try again.",
        toastType: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-full mb-4"
            >
              <Plus className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Contest
            </h1>
            <p className="text-gray-600">Set up a new Quran quiz competition</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Contest Information */}
            <div className="bg-emerald-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-emerald-900 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" /> Contest Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Contest Name *</Label>
                  <Input
                    {...register("name")}
                    placeholder="e.g., Annual Quran Competition 2024"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Competition Date *</Label>
                  <Input type="date" {...register("date")} />
                  {errors.date && (
                    <p className="text-sm text-red-600">{errors.date.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Competition Range */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" /> Competition Range
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Start Surah *</Label>
                  <Controller
                    control={control}
                    name="startSurah"
                    render={({ field }) => (
                      <Select
                        items={surahItems}
                        value={field.value || null}
                        onValueChange={(v) => field.onChange(v ?? "")}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select start surah" />
                        </SelectTrigger>
                        <SelectContent>
                          {surahList.map((s) => (
                            <SelectItem
                              key={s.number}
                              value={s.number.toString()}
                            >
                              {s.number}. {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.startSurah && (
                    <p className="text-sm text-red-600">
                      {errors.startSurah.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>End Surah *</Label>
                  <Controller
                    control={control}
                    name="endSurah"
                    render={({ field }) => (
                      <Select
                        items={surahItems}
                        value={field.value || null}
                        onValueChange={(v) => field.onChange(v ?? "")}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select end surah" />
                        </SelectTrigger>
                        <SelectContent>
                          {surahList.map((s) => (
                            <SelectItem
                              key={s.number}
                              value={s.number.toString()}
                            >
                              {s.number}. {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.endSurah && (
                    <p className="text-sm text-red-600">
                      {errors.endSurah.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Questions per Participant *</Label>
                  <Controller
                    control={control}
                    name="questionsPerParticipant"
                    render={({ field }) => (
                      <Select
                        items={questionCountItems}
                        value={field.value?.toString() ?? null}
                        onValueChange={(v) => field.onChange(parseInt(v ?? "1"))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1} question{i > 0 ? "s" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Contestants */}
            <div className="bg-purple-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-purple-900 flex items-center">
                  <Users className="w-5 h-5 mr-2" /> Contestants (Optional)
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ name: "" })}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Contestant
                </Button>
              </div>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-3">
                    <Input
                      placeholder={`Contestant ${index + 1} name`}
                      {...register(`contestants.${index}.name` as const)}
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => remove(index)}
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-purple-600 mt-3">
                You can add contestant names now or leave empty and add them
                later.
              </p>
            </div>

            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg"
              >
                <Save className="w-5 h-5 mr-2" />{" "}
                {isLoading ? "Creating…" : "Create Contest"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
