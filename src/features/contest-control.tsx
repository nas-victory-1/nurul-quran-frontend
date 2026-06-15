"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Play, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { startPicking, revealQuestion } from "@/store/contestSlice";
import {
    useBroadcastContestantsMutation,
    useSaveContestStateMutation,
    useShowCurrentPageMutation,
} from "@/services/contestApi";
import { toastMessage } from "@/lib/toaster";
import MQILogo from "@/assets/img/mqi-logo.png";

export default function ContestControl() {
    const dispatch = useAppDispatch();
    const {
        id: contestId,
        currentContestantId,
        currentQuestionIndex,
        pickedContestants,
        questionsDict,
        contestantsDict,
        questionsPerContestant,
        contestantIds,
    } = useAppSelector((state) => state.contest);

    const [showCurrentPage, { isLoading: isShowing }] =
        useShowCurrentPageMutation();
    const [broadcastContestants] = useBroadcastContestantsMutation();
    const [saveContestState] = useSaveContestStateMutation();

    const currentContestant = contestantsDict[currentContestantId];
    const questionNumber = currentQuestionIndex + 1;
    const currentContestantIndex = contestantIds.indexOf(currentContestantId);
    const totalContestants = contestantIds.length;
    const currentQuestion =
        questionsDict[currentContestantId]?.[currentQuestionIndex];

    const handleRevealQuestion = async () => {
        if (!currentQuestion || contestId === null) return;

        const hasPicked = pickedContestants?.[currentContestantId];

        // If it's the contestant's first question and they haven't picked yet,
        // open the picking UI. Otherwise reveal immediately.
        if (currentQuestionIndex === 0 && !hasPicked) {
            dispatch(startPicking());
        } else {
            dispatch(revealQuestion(currentQuestion));
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-emerald-50 to-emerald-100 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            delay: 0.2,
                            type: "spring",
                            stiffness: 200,
                        }}
                        className="flex justify-center"
                    >
                        <Image
                            src={MQILogo}
                            alt="MQI Logo"
                            className="size-32"
                            priority
                        />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        MQI AyahQuiz — Judge&apos;s Panel
                    </h1>
                    <p className="text-gray-600">
                        You&apos;re in control — ready when they are.
                    </p>
                </div>

                <div className="bg-emerald-50 rounded-xl p-6 mb-8 flex flex-col gap-2 space-y-12">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <Users className="w-5 h-5 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-800">
                                Contestant {currentContestantIndex + 1} of{" "}
                                {totalContestants}
                            </span>
                        </div>
                        <span className="text-sm text-emerald-600 font-medium">
                            Question {questionNumber} of{" "}
                            {questionsPerContestant}
                        </span>
                    </div>

                    <h2 className="text-2xl font-bold text-emerald-900 mb-4">
                        {currentContestant}
                    </h2>

                    {/* Contestant Progress */}
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-emerald-700 mb-1">
                            <span>Contestant Progress</span>
                            <span>
                                {currentContestantIndex + 1}/{totalContestants}
                            </span>
                        </div>
                        <div className="w-full bg-emerald-200 rounded-full h-2 mb-3">
                            <div
                                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                    width: `${((currentContestantIndex + 1) / totalContestants) * 100}%`,
                                }}
                            />
                        </div>
                    </div>

                    {/* Question Progress for Current Contestant */}
                    <div>
                        <div className="flex justify-between text-xs text-emerald-700 mb-1">
                            <span>Questions for {currentContestant}</span>
                            <span>
                                {questionNumber}/{questionsPerContestant}
                            </span>
                        </div>
                        <div className="w-full bg-emerald-200 rounded-full h-2">
                            <div
                                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                    width: `${(questionNumber / questionsPerContestant) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Button
                        onClick={handleRevealQuestion}
                        disabled={isShowing}
                        size="lg"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-semibold rounded-xl shadow-lg"
                    >
                        <Play className="w-6 h-6 mr-2" />
                        Reveal question for {currentContestant}
                    </Button>
                </motion.div>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Click the button above to reveal the question</p>
                </div>
            </motion.div>
        </div>
    );
}
