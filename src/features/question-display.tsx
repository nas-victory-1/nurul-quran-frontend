"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { endQuestion, setCurrentPage } from "@/store/contestSlice";
import {
    useLazyGetPageByNumberQuery,
    useRemoveCurrentPageMutation,
    useSaveContestStateMutation,
    useShowCurrentPageMutation,
} from "@/services/contestApi";
import { TOTAL_MUSHAF_PAGES } from "@/consts";
import { toastMessage } from "@/lib/toaster";
import type { GetPageResponse, PageDetail } from "@/types";

// Convert the GET /quran/pages/:n response into the PageDetail shape the
// current-page/show endpoint expects.
function toPageDetail(res: GetPageResponse): PageDetail {
    const { page, pageUrl } = res;
    return {
        page_number: page.page_number,
        page_url: pageUrl,
        first_verse_on_page_chapter_name: page.first_verse_chapter_name,
        first_verse_on_page_chapter_name_arabic:
            page.first_verse_chapter_name_arabic,
        first_verse_on_page_chapter_number: String(
            page.first_verse_chapter_number,
        ),
        first_verse_on_page_verse_number: String(page.first_verse_number),
    };
}

export default function QuestionDisplay() {
    const dispatch = useAppDispatch();
    const {
        id: contestId,
        currentContestantId,
        currentQuestionIndex,
        currentPageImageUrl,
        currentPageNumber,
        contestantsDict,
        questionsPerContestant,
    } = useAppSelector((state) => state.contest);

    const [getPage, { isFetching: isLoadingPage }] =
        useLazyGetPageByNumberQuery();
    const [showCurrentPage] = useShowCurrentPageMutation();
    const [removeCurrentPage] = useRemoveCurrentPageMutation();
    const [saveContestState] = useSaveContestStateMutation();

    const currentContestant = contestantsDict[currentContestantId];
    const questionNumber = currentQuestionIndex + 1;
    const questionString = `Question ${questionNumber} of ${questionsPerContestant}`;

    const pageNumber = currentPageNumber ?? 0;
    const canGoPrevious = pageNumber > 1;
    const canGoNext = pageNumber < TOTAL_MUSHAF_PAGES;

    const goToPage = async (target: number) => {
        if (target < 1 || target > TOTAL_MUSHAF_PAGES || contestId === null)
            return;
        try {
            const res = await getPage({ pageNumber: target }).unwrap();
            const detail = toPageDetail(res);
            dispatch(setCurrentPage(detail));
            await Promise.all([
                showCurrentPage({ page_url: detail }).unwrap(),
                saveContestState({
                    contestId: String(contestId),
                    contestantName: currentContestant,
                    pageNumber: detail.page_number,
                    questionString,
                }).unwrap(),
            ]);
        } catch {
            toastMessage({
                header: "Sync issue",
                message: "Could not change the projector page.",
                toastType: "error",
            });
        }
    };

    const handleEndQuestion = async () => {
        const contestantName = currentContestant;
        dispatch(endQuestion());
        try {
            await removeCurrentPage().unwrap();
            if (contestId !== null) {
                await saveContestState({
                    contestId: String(contestId),
                    contestantName,
                    pageNumber: null,
                    questionString: "",
                }).unwrap();
            }
        } catch (err) {
            toastMessage({
                header: "Sync issue",
                message: "Could not clear the projector.",
                toastType: "error",
            });
        }
    };

    return (
        <div className="lg:w-[50%] lg:mx-auto">
            {/* Navigation Bar */}
            <motion.div
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="border-gray-800"
            >
                <div className="flex bg-black rounded-b-xl flex-col lg:flex-row lg:justify-between lg:px-8 items-center py-2 justify-center px-4">
                    <div className="flex items-center space-x-4 rounded-lg bg-black/80 backdrop-blur-sm">
                        <h2 className="text-white font-semibold text-lg">
                            {currentContestant}
                        </h2>
                        <span className="text-emerald-400 text-sm">
                            {questionString}
                        </span>
                        <span className="text-gray-400 text-sm">
                            Page {currentPageNumber}
                        </span>
                    </div>

                    <div className="flex items-center space-x-2 p-4 rounded-lg bg-black/80 backdrop-blur-sm">
                        <Button
                            onClick={() => goToPage(pageNumber - 1)}
                            disabled={!canGoPrevious || isLoadingPage}
                            variant="outline"
                            size="sm"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Previous Page
                        </Button>

                        <Button
                            onClick={() => goToPage(pageNumber + 1)}
                            disabled={!canGoNext || isLoadingPage}
                            variant="outline"
                            size="sm"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
                        >
                            Next Page
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>

                        <Button
                            onClick={handleEndQuestion}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            size="sm"
                        >
                            <Square className="w-4 h-4 mr-1" />
                            End Question
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Question Image */}
            <div
                key={`${currentContestantId}-${currentQuestionIndex}-${currentPageNumber}`}
                className="w-full relative max-w-6xl max-h-[90vh] h-[90vh]"
            >
                {currentPageImageUrl && (
                    <Image
                        src={currentPageImageUrl}
                        alt={`Question ${questionNumber} for ${currentContestant} - Page ${currentPageNumber}`}
                        fill
                        className="object-contain rounded-lg"
                        unoptimized
                        priority
                    />
                )}
            </div>
        </div>
    );
}
