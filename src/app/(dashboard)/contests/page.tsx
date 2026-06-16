"use client";

import { useEffect, useState, type FormEvent } from "react";
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
    Pencil,
    Trash2,
    Play,
    Plus,
    Search,
    Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    useGetContestsQuery,
    useLazyGetContestDataQuery,
    useDeleteContestMutation,
    useUpdateContestMutation,
} from "@/services/contestApi";
import { useAppDispatch } from "@/hooks";
import { setContestData } from "@/store/contestSlice";
import { mapContestData, mapContests } from "@/utils/contest";
import { quranSurahs } from "@/data/surahs";
import { surahList } from "@/data/surahs";
import { toastMessage } from "@/lib/toaster";
import type { Contest } from "@/types";

type FilterKind = "all" | "upcoming" | "past";

const questionCountItems: Record<string, string> = Object.fromEntries(
    Array.from({ length: 10 }, (_, i) => [
        (i + 1).toString(),
        `${i + 1} question${i > 0 ? "s" : ""}`,
    ]),
);

type ContestEditForm = {
    name: string;
    date: string;
    startSurahRange: string;
    endSurahRange: string;
    questionsPerContestant: string;
    contestants: { name: string }[];
};

function ContestEditModal({
    contest,
    open,
    onClose,
    onSaved,
}: {
    contest: Contest | null;
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [updateContest, { isLoading }] = useUpdateContestMutation();
    const [form, setForm] = useState<ContestEditForm>({
        name: "",
        date: "",
        startSurahRange: "",
        endSurahRange: "",
        questionsPerContestant: "3",
        contestants: [{ name: "" }],
    });

    useEffect(() => {
        if (!contest) return;

        setForm({
            name: contest.name,
            date: contest.date.slice(0, 10),
            startSurahRange: contest.startSurahRange.toString(),
            endSurahRange: contest.endSurahRange.toString(),
            questionsPerContestant: contest.questionsPerContestant.toString(),
            contestants:
                contest.contestants.length > 0
                    ? contest.contestants.map((c) => ({ name: c.name }))
                    : [{ name: "" }],
        });
    }, [contest]);

    if (!open || !contest) return null;

    const updateField = <K extends keyof ContestEditForm>(
        key: K,
        value: ContestEditForm[K],
    ) => {
        setForm((current) => ({ ...current, [key]: value }));
    };

    const updateContestantName = (index: number, name: string) => {
        setForm((current) => ({
            ...current,
            contestants: current.contestants.map(
                (contestant, contestantIndex) =>
                    contestantIndex === index ? { name } : contestant,
            ),
        }));
    };

    const addContestant = () => {
        setForm((current) => ({
            ...current,
            contestants: [...current.contestants, { name: "" }],
        }));
    };

    const removeContestant = (index: number) => {
        setForm((current) => ({
            ...current,
            contestants: current.contestants.filter(
                (_contestant, contestantIndex) => contestantIndex !== index,
            ),
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            await updateContest({
                contestId: String(contest.id),
                name: form.name.trim(),
                date: form.date,
                startSurahRange: Number(form.startSurahRange),
                endSurahRange: Number(form.endSurahRange),
                questionsPerContestant: Number(form.questionsPerContestant),
                contestants: form.contestants,
            }).unwrap();

            toastMessage({
                header: "Contest updated",
                message: `${contest.name} was updated successfully.`,
                toastType: "success",
            });
            onSaved();
            onClose();
        } catch {
            toastMessage({
                header: "Could not update contest",
                message: "Please check the form and try again.",
                toastType: "error",
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="border-b border-gray-100 px-6 py-5">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Edit Contest
                            </h2>
                            <p className="text-sm text-gray-500">
                                Update the contest even after it has finished.
                            </p>
                        </div>
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Contest Name *</Label>
                            <Input
                                value={form.name}
                                onChange={(event) =>
                                    updateField("name", event.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Competition Date *</Label>
                            <Input
                                type="date"
                                value={form.date}
                                onChange={(event) =>
                                    updateField("date", event.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Start Surah *</Label>
                            <Select
                                value={form.startSurahRange}
                                onValueChange={(value) =>
                                    updateField("startSurahRange", value ?? "")
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select start surah" />
                                </SelectTrigger>
                                <SelectContent>
                                    {surahList.map((surah) => (
                                        <SelectItem
                                            key={surah.number}
                                            value={surah.number.toString()}
                                        >
                                            {surah.number}. {surah.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>End Surah *</Label>
                            <Select
                                value={form.endSurahRange}
                                onValueChange={(value) =>
                                    updateField("endSurahRange", value ?? "")
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select end surah" />
                                </SelectTrigger>
                                <SelectContent>
                                    {surahList.map((surah) => (
                                        <SelectItem
                                            key={surah.number}
                                            value={surah.number.toString()}
                                        >
                                            {surah.number}. {surah.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Questions per Participant *</Label>
                            <Select
                                value={form.questionsPerContestant}
                                onValueChange={(value) =>
                                    updateField(
                                        "questionsPerContestant",
                                        value ?? "3",
                                    )
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select question count" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(questionCountItems).map(
                                        ([value, label]) => (
                                            <SelectItem
                                                key={value}
                                                value={value}
                                            >
                                                {label}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="rounded-xl bg-purple-50 p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h3 className="text-lg font-semibold text-purple-900">
                                Contestants
                            </h3>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addContestant}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Contestant
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {form.contestants.map((contestant, index) => (
                                <div
                                    key={`${contest.id}-${index}`}
                                    className="flex items-center gap-3"
                                >
                                    <Input
                                        value={contestant.name}
                                        onChange={(event) =>
                                            updateContestantName(
                                                index,
                                                event.target.value,
                                            )
                                        }
                                        placeholder={`Contestant ${index + 1} name`}
                                    />
                                    {form.contestants.length > 1 ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="border-red-200 text-red-600 hover:bg-red-50"
                                            onClick={() =>
                                                removeContestant(index)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            {isLoading ? "Saving…" : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ContestsPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<FilterKind>("all");
    const [editingContest, setEditingContest] = useState<Contest | null>(null);

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

    const handleEditSaved = () => {
        setEditingContest(null);
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
                                            setEditingContest(
                                                nearestUpcomingContest,
                                            )
                                        }
                                        variant="outline"
                                        className="mt-3 ml-5 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                                        size="lg"
                                    >
                                        <Pencil className="w-5 h-5 mr-2" />
                                        Edit Contest
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
                                            {isUpcoming ? (
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        setEditingContest(
                                                            contest,
                                                        )
                                                    }
                                                    className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                                                >
                                                    <Pencil className="w-4 h-4 mr-2" />
                                                    Edit
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

            <ContestEditModal
                contest={editingContest}
                open={editingContest !== null}
                onClose={() => setEditingContest(null)}
                onSaved={handleEditSaved}
            />
        </div>
    );
}
