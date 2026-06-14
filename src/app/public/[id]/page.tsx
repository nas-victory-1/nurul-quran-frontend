"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

import socket, {
  connectSocket,
  disconnectSocket,
  joinRoom,
  type PageUpdateEvent,
  type SelectedQuestionEvent,
} from "@/lib/socket";
import {
  QURAN_PAGE_IMAGE_BASE,
  SOCKET_EVENTS,
  SOCKET_ROOMS,
} from "@/consts";
import { useGetContestStateQuery } from "@/services/contestApi";

export default function PublicViewPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];

  // Page info comes from the `contest_pages` room (page_update).
  const [pageUrl, setPageUrl] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState<string>("");
  // Contestant / question comes from the `contestants` room.
  const [contestantName, setContestantName] = useState<string>("");
  const [questionString, setQuestionString] = useState<string>("");
  const [isDisplaying, setIsDisplaying] = useState(true);

  // Recover the current page on a fresh load / reconnect.
  const { data: initialState } = useGetContestStateQuery(
    { contestId: id ?? "" },
    { skip: !id },
  );

  useEffect(() => {
    const state = initialState?.state;
    if (!state || pageUrl) return;
    if (!state.question_string || state.page_number == null) {
      setIsDisplaying(false);
      return;
    }
    setContestantName(state.contestant_name ?? "");
    setQuestionString(state.question_string ?? "");
    setPageNumber(String(state.page_number));
    setPageUrl(`${QURAN_PAGE_IMAGE_BASE}/${state.page_number}.png`);
  }, [initialState, pageUrl]);

  // Live updates over Socket.IO (listen-only).
  useEffect(() => {
    if (!id) return;

    connectSocket();
    joinRoom(SOCKET_ROOMS.CONTEST_PAGES);
    joinRoom(SOCKET_ROOMS.CONTESTANTS);

    const handlePageUpdate = (data: PageUpdateEvent) => {
      if (data.action === "remove") {
        setIsDisplaying(false);
        setPageUrl(null);
        return;
      }
      setIsDisplaying(true);
      setPageUrl(data.page_data.page_url);
      setPageNumber(String(data.page_data.page_number));
    };

    const handleSelectedQuestion = (data: SelectedQuestionEvent) => {
      setContestantName(data.contestantName ?? "");
      setQuestionString(data.questionString ?? "");
    };

    socket.on(SOCKET_EVENTS.PAGE_UPDATE, handlePageUpdate);
    socket.on(SOCKET_EVENTS.SELECTED_QUESTION_NUMBER, handleSelectedQuestion);

    return () => {
      socket.off(SOCKET_EVENTS.PAGE_UPDATE, handlePageUpdate);
      socket.off(SOCKET_EVENTS.SELECTED_QUESTION_NUMBER, handleSelectedQuestion);
      disconnectSocket();
    };
  }, [id]);

  if (!isDisplaying) {
    return (
      <p className="text-center mt-10 text-gray-600">
        Waiting for next question…
      </p>
    );
  }

  if (!pageUrl) {
    return <p className="text-center mt-10 text-gray-600">Loading…</p>;
  }

  return (
    <div className="lg:w-[50%] lg:mx-auto">
      {/* Header bar */}
      <div className="border-gray-800">
        <div className="flex bg-black rounded-b-xl flex-col lg:flex-row lg:justify-between lg:px-8 items-center py-6 justify-center px-4">
          <div className="flex items-center space-x-4 rounded-lg bg-black/80 backdrop-blur-sm">
            <h2 className="text-white font-semibold text-lg">
              {contestantName}
            </h2>
            <span className="text-emerald-400 text-sm">{questionString}</span>
            <span className="text-gray-400 text-sm">Page {pageNumber}</span>
          </div>
        </div>
      </div>

      {/* Question Image */}
      <div className="w-full relative max-w-6xl max-h-[90vh] h-[90vh]">
        <Image
          src={pageUrl}
          alt="Question"
          fill
          className="object-contain rounded-lg"
          unoptimized
          priority
        />
      </div>
    </div>
  );
}
