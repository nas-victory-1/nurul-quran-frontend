"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { RotateCcw, Sparkles, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { resetContest } from "@/store/contestSlice";

export default function ContestComplete() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { contestantsDict, questionsPerContestant } = useAppSelector(
    (state) => state.contest,
  );

  const totalContestants = Object.keys(contestantsDict).length;
  const totalQuestions = totalContestants * questionsPerContestant;

  const handleResetContest = () => {
    dispatch(resetContest());
    router.push("/contests");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-white opacity-50" />

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, duration: 0.8, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mb-8 shadow-lg"
          >
            <Trophy className="w-12 h-12 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Contest Complete!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-xl text-gray-600 mb-8"
          >
            Congratulations to all participants in the Quran Quiz Competition
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-emerald-50 rounded-2xl p-6 mb-8"
          >
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {totalContestants}
                </div>
                <div className="text-sm text-emerald-800 font-medium">
                  Contestants
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {questionsPerContestant}
                </div>
                <div className="text-sm text-emerald-800 font-medium">
                  Questions Each
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {totalQuestions}
                </div>
                <div className="text-sm text-emerald-800 font-medium">
                  Total Questions
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-emerald-600 mb-6">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">
                May Allah reward all participants
              </span>
              <Sparkles className="w-5 h-5" />
            </div>

            <Button
              onClick={handleResetContest}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Back to Contests
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
