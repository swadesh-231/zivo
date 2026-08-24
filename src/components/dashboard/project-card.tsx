"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import type { Project } from "@/db/schema";
import {
  useDeleteProject,
  useRenameProject,
} from "@/features/projects/hooks/projects";
import { formatProjectName, formatRelativeTime, seededGradient } from "@/lib/format";

export function ProjectCard({ project }: { project: Project }) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [name, setName] = useState(project.name);

  const rename = useRenameProject();
  const remove = useDeleteProject();

  const submitRename = async () => {
    try {
      await rename.mutateAsync({ id: project.id, name });
      setIsRenaming(false);
      toast.add({ type: "success", title: "Project renamed" });
    } catch (error) {
      toast.add({
        type: "error",
        title: "Could not rename",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const submitDelete = async () => {
    try {
      await remove.mutateAsync(project.id);
      setIsConfirmingDelete(false);
      toast.add({ type: "success", title: "Project deleted" });
    } catch (error) {
      toast.add({
        type: "error",
        title: "Could not delete",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  return (
    <>
      <div className="group relative overflow-hidden rounded-xl border border-border/70 bg-card/40 transition-colors hover:border-border hover:bg-card/70">
        <Link href={`/projects/${project.id}`} className="block">
          <div
            className="relative aspect-16/10 w-full"
            style={{ background: seededGradient(project.id) }}
          >
            <div className="absolute inset-0 bg-linear-to-t from-black/25 to-transparent" />
            <span className="absolute bottom-3 left-3 font-mono text-xs text-white/80">
              {project.id.slice(0, 8)}
            </span>
          </div>

          <div className="p-3.5">
            <p className="truncate text-sm font-medium capitalize">
              {formatProjectName(project.name)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Updated {formatRelativeTime(project.updatedAt)}
            </p>
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${project.name}`}
                className="absolute top-2 right-2 bg-background/70 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100"
              />
            }
          >
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => {
                setName(project.name);
                setIsRenaming(true);
              }}
            >
              <Pencil />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setIsConfirmingDelete(true)}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>
              Only you can see this name. It does not affect the generated app.
            </DialogDescription>
          </DialogHeader>

          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void submitRename();
              }
            }}
            aria-label="Project name"
            autoFocus
          />

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRenaming(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void submitRename()}
              disabled={rename.isPending || !name.trim()}
            >
              {rename.isPending ? <Spinner /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isConfirmingDelete}
        onOpenChange={setIsConfirmingDelete}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              The conversation, generated files, and preview link are removed
              permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void submitDelete();
              }}
              disabled={remove.isPending}
            >
              {remove.isPending ? <Spinner /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
