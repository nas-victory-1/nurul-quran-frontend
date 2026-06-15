"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks";
import { choosePickNumber, revealQuestion } from "@/store/contestSlice";

export default function QuestionPicking() {
    const dispatch = useAppDispatch();
    const {
        currentContestantId,
        currentQuestionIndex,
        contestantsDict,
        questionsDict,
        usedPickNumbers,
        pickedContestants,
    } = useAppSelector((state) => state.contest);

    const currentContestant = contestantsDict[currentContestantId];
    const currentQuestion =
        questionsDict[currentContestantId]?.[currentQuestionIndex];

    const handlePick = (number: number) => {
        if (!currentQuestion || usedPickNumbers.includes(number)) return;

        dispatch(choosePickNumber(number));
        dispatch(revealQuestion(currentQuestion));
    };

    const hasPicked = pickedContestants?.[currentContestantId];

    const handleRevealIfPicked = () => {
        if (!currentQuestion) return;
        dispatch(revealQuestion(currentQuestion));
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-emerald-100 px-4 py-8 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-2xl"
            >
                <div className="border-b border-emerald-100 bg-linear-to-r from-emerald-700 to-emerald-600 px-6 py-5 text-white sm:px-8">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Pick a Number
                            </h1>
                        </div>
                        <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                            <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/80">
                                Current Contestant
                            </p>
                            <p className="text-lg font-semibold">
                                {currentContestant}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-6 sm:px-8 sm:py-8">
                    {hasPicked ? (
                        <div className="mb-6 flex flex-col items-center gap-4">
                            <div className="text-center">
                                <Sparkles className="mx-auto h-10 w-10 text-emerald-500" />
                                <p className="mt-2 text-sm text-emerald-700">
                                    {currentContestant} already picked a number.
                                </p>
                            </div>
                            <div>
                                <button
                                    type="button"
                                    onClick={handleRevealIfPicked}
                                    className="rounded-xl bg-emerald-600 px-4 py-2 text-white shadow"
                                >
                                    Reveal Question
                                </button>
                            </div>
                        </div>
                    ) : null}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                        {Array.from({ length: 20 }, (_, index) => {
                            const number = index + 1;
                            const isUsed = usedPickNumbers.includes(number);

                            return (
                                <motion.button
                                    key={number}
                                    type="button"
                                    whileHover={
                                        isUsed
                                            ? undefined
                                            : { y: -2, scale: 1.02 }
                                    }
                                    whileTap={
                                        isUsed ? undefined : { scale: 0.98 }
                                    }
                                    onClick={() => handlePick(number)}
                                    disabled={isUsed}
                                    className={`group flex h-28 items-center justify-center rounded-2xl border text-center transition-all sm:h-32 ${
                                        isUsed
                                            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                            : "border-emerald-200 bg-white text-emerald-900 shadow-sm hover:border-emerald-400 hover:shadow-md"
                                    }`}
                                >
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-4xl font-black leading-none sm:text-5xl">
                                            {number}
                                        </span>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
