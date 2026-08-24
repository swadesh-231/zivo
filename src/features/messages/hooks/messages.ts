"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { unwrap } from "@/lib/action-result";
import { createMessage, getMessages, type ProjectMessage } from "../actions";

const POLL_INTERVAL_MS = 3000;

const BUILD_WINDOW_MS = 20 * 60 * 1000;

export type BuildState = "idle" | "building" | "stalled";

export const messageKeys = {
  byProject: (projectId: string) => ["messages", projectId] as const,
};

export function getBuildState(
  messages: ProjectMessage[] | undefined,
): BuildState {
  if (!messages?.length) return "idle";

  const last = messages[messages.length - 1];

  if (last.role !== "USER") return "idle";

  const age = Date.now() - new Date(last.createdAt).getTime();

  return age < BUILD_WINDOW_MS ? "building" : "stalled";
}

export function useMessages(projectId: string) {
  return useQuery({
    queryKey: messageKeys.byProject(projectId),
    queryFn: async () => unwrap(await getMessages(projectId)),
    enabled: Boolean(projectId),
    refetchInterval: (query) =>
      getBuildState(query.state.data) === "building" ? POLL_INTERVAL_MS : false,
    refetchIntervalInBackground: false,
  });
}

export function useCreateMessage(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prompt: string) =>
      unwrap(await createMessage(projectId, prompt)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.byProject(projectId),
      });
    },
  });
}
