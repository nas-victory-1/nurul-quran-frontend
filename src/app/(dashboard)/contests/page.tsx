"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    compareDesc,
    format,
    isFuture,
    isPast,
    isToday,
    parseISO,
} from "date-fns";
import {
    AlertCircle,
    BookOpen,
    Calendar,
    CheckCircle,
    ChevronRight,
    Clock,
    Filter,
    Trash2,
    Play,
    Plus,
    Search,
    Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
    useGetContestsQuery,
    useLazyGetContestDataQuery,
    useDeleteContestMutation,
} from "@/services/contestApi";
import { useAppDispatch } from "@/hooks";
import { setContestData } from "@/store/contestSlice";
import { mapContestData, mapContests } from "@/utils/contest";
import { quranSurahs } from "@/data/surahs";
import { toastMessage } from "@/lib/toaster";

type FilterKind = "all" | "upcoming" | "past";

export default function ContestsPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<FilterKind>("all");

    const { data, isLoading, error } = useGetContestsQuery();
    const [getContestData, { isFetching: isLoadingContest }] =
        useLazyGetContestDataQuery();
    const [deleteContest, { isLoading: isDeletingContest }] =
        useDeleteContestMutation();

    const contests = mapContests(data?.contests ?? []);

    const loadContest = async (contestId: number) => {
        try {
            const result = await getContestData({
                contestId: String(contestId),
            }).unwrap();
            dispatch(setContestData(mapContestData(result)));
            router.push(`/contest/${contestId}`);
        } catch {
            toastMessage({
                header: "Could not start contest",
                message: "Failed to load contest data. Please try again.",
                toastType: "error",
            });
        }
    };

    const handleDeleteContest = async (
        contestId: number,
        contestName: string,
    ) => {
        const confirmed = window.confirm(
            `Delete ${contestName}? This will permanently remove the contest, contestants, and generated questions.`,
        );

        if (!confirmed) return;

        try {
            await deleteContest({ contestId: String(contestId) }).unwrap();
            toastMessage({
                header: "Contest deleted",
                message: `${contestName} was removed successfully.`,
                toastType: "success",
            });
        } catch {
            toastMessage({
                header: "Could not delete contest",
                message: "Please try again.",
                toastType: "error",
            });
        }
    };

    if (isLoading)
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
                Loading contests…
            </div>
        );
    if (error)
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-600">
                Something went wrong loading contests.
            </div>
        );

    const sortedContests = [...contests].sort((a, b) => {
        const dateA = parseISO(a.date);
        const dateB = parseISO(b.date);
        if (isFuture(dateA) && isPast(dateB)) return -1;
        if (isPast(dateA) && isFuture(dateB)) return 1;
        if (isFuture(dateA) && isFuture(dateB))
            return dateA.getTime() - dateB.getTime();
        return compareDesc(dateA, dateB);
    });

    const filteredContests = sortedContests.filter((contest) => {
        const matchesSearch = contest.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const contestDate = parseISO(contest.date);
        if (filter === "upcoming")
            return (
                matchesSearch && (isFuture(contestDate) || isToday(contestDate))
            );
        if (filter === "past")
            return (
                matchesSearch && isPast(contestDate) && !isToday(contestDate)
            );
        return matchesSearch;
    });

    const nearestUpcomingContest = sortedContests.find((contest) => {
        const contestDate = parseISO(contest.date);
        return isFuture(contestDate) || isToday(contestDate);
    });

    const getContestStatusBadge = (date: string) => {
        const contestDate = parseISO(date);
        if (isToday(contestDate)) {
            return (
                <Badge className="bg-green-500 text-white">
                    <Clock className="w-3 h-3 mr-1" />
                    Today
                </Badge>
            );
        }
        if (isFuture(contestDate)) {
            return (
                <Badge className="bg-blue-500 text-white">
                    <Calendar className="w-3 h-3 mr-1" />
                    Upcoming
                </Badge>
            );
        }
        return (
            <Badge className="bg-gray-500 text-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
            </Badge>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Quran Competitions
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Manage and run your Quran quiz competitions
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <Link href="/create-contest">
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Plus className="w-5 h-5 mr-2" />
                                Create New Contest
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Nearest Upcoming Contest (Featured) */}
                {nearestUpcomingContest && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-10"
                    >
                        <div className="bg-linear-to-r from-emerald-600 to-emerald-800 rounded-2xl shadow-xl overflow-hidden">
                            <div className="md:flex">
                                <div className="md:w-2/3 p-8 text-white">
                                    <div className="flex items-center mb-4">
                                        {getContestStatusBadge(
                                            nearestUpcomingContest.date,
                                        )}
                                        <span className="ml-3 text-emerald-100 text-sm">
                                            {format(
                                                parseISO(
                                                    nearestUpcomingContest.date,
                                                ),
                                                "EEEE, MMMM d, yyyy",
                                            )}
                                        </span>
                                    </div>

                                    <h2 className="text-3xl font-bold mb-4">
                                        {nearestUpcomingContest.name}
                                    </h2>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center">
                                            <BookOpen className="w-5 h-5 mr-2 text-emerald-200" />
                                            <span>
                                                Surah{" "}
                                                {
                                                    nearestUpcomingContest.startSurahRange
                                                }{" "}
                                                (
                                                {
                                                    quranSurahs[
                                                        nearestUpcomingContest
                                                            .startSurahRange
                                                    ]
                                                }
                                                ) to{" "}
                                                {
                                                    nearestUpcomingContest.endSurahRange
                                                }{" "}
                                                (
                                                {
                                                    quranSurahs[
                                                        nearestUpcomingContest
                                                            .endSurahRange
                                                    ]
                                                }
                                                )
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <Users className="w-5 h-5 mr-2 text-emerald-200" />
                                            <span>
                                                {
                                                    nearestUpcomingContest
                                                        .contestants.length
                                                }{" "}
                                                Contestants
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() =>
                                            loadContest(
                                                nearestUpcomingContest.id,
                                            )
                                        }
                                        disabled={isLoadingContest}
                                        className="bg-white text-emerald-700 hover:bg-emerald-100"
                                        size="lg"
                                    >
                                        <Play className="w-5 h-5 mr-2" />
                                        Start This Contest Now
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            handleDeleteContest(
                                                nearestUpcomingContest.id,
                                                nearestUpcomingContest.name,
                                            )
                                        }
                                        disabled={isDeletingContest}
                                        variant="outline"
                                        className="mt-3 ml-5 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                                        size="lg"
                                    >
                                        <Trash2 className="w-5 h-5 mr-2" />
                                        Delete Contest
                                    </Button>
                                </div>

                                <div className="md:block md:w-1/3 bg-emerald-900 p-8 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-4">
                                            <BookOpen className="w-10 h-10 text-white" />
                                        </div>
                                        <div className="text-white text-lg font-semibold">
                                            {
                                                nearestUpcomingContest.questionsPerContestant
                                            }{" "}
                                            Questions Per Contestant
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                        />
                        <Input
                            type="text"
                            placeholder="Search contests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-gray-300"
                        />
                    </div>
                    <div className="flex space-x-2">
                        {(["all", "upcoming", "past"] as const).map((kind) => (
                            <Button
                                key={kind}
                                variant={
                                    filter === kind ? "default" : "outline"
                                }
                                onClick={() => setFilter(kind)}
                                className={
                                    filter === kind
                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white capitalize"
                                        : "border-gray-300 text-gray-700 capitalize"
                                }
                            >
                                {kind}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Contest List */}
                <div className="space-y-4">
                    {filteredContests.length > 0 ? (
                        filteredContests.map((contest, index) => {
                            // Skip the featured upcoming contest (already displayed above).
                            if (contest.id === nearestUpcomingContest?.id)
                                return null;

                            const contestDate = parseISO(contest.date);
                            const isUpcoming =
                                isFuture(contestDate) || isToday(contestDate);

                            return (
                                <motion.div
                                    key={contest.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: index * 0.1,
                                    }}
                                    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                                >
                                    <div className="md:flex">
                                        <div className="p-6 md:w-4/5">
                                            <div className="flex items-center mb-3">
                                                {getContestStatusBadge(
                                                    contest.date,
                                                )}
                                                <span className="ml-3 text-gray-500 text-sm">
                                                    {format(
                                                        parseISO(contest.date),
                                                        "MMMM d, yyyy",
                                                    )}
                                                </span>
                                            </div>

                                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                {contest.name}
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                                <div className="flex items-center">
                                                    <BookOpen className="w-4 h-4 mr-2 text-emerald-600" />
                                                    <span>
                                                        Surah{" "}
                                                        {
                                                            contest.startSurahRange
                                                        }
                                                        -{contest.endSurahRange}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Users className="w-4 h-4 mr-2 text-emerald-600" />
                                                    <span>
                                                        {
                                                            contest.contestants
                                                                .length
                                                        }{" "}
                                                        Contestants
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-2 text-emerald-600" />
                                                    <span>
                                                        {
                                                            contest.questionsPerContestant
                                                        }{" "}
                                                        Questions Each
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-6 md:w-1/5 flex flex-col items-center justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-100">
                                            {isUpcoming ? (
                                                <Button
                                                    onClick={() =>
                                                        loadContest(contest.id)
                                                    }
                                                    disabled={isLoadingContest}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                                                >
                                                    <Play className="w-4 h-4 mr-2" />
                                                    Start Contest
                                                </Button>
                                            ) : null}
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    handleDeleteContest(
                                                        contest.id,
                                                        contest.name,
                                                    )
                                                }
                                                disabled={isDeletingContest}
                                                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <Filter className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">
                                No contests found
                            </h3>
                            <p className="mt-2 text-gray-500">
                                Try adjusting your search or filter criteria
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
