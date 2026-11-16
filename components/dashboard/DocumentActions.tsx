"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Ellipsis, LoaderCircle, MessagesSquare, PencilLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input, Label } from "@/components/ui/input";
import { deleteDocument, renameDocument } from "@/lib/api/documents";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { queryKeys } from "@/lib/queries";
import { useToast } from "@/store/toast-store";
import type { DocumentItem } from "@/types";

const MAX_NAME = 200;

export function DocumentActions({ doc }: { doc: DocumentItem }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [dialog, setDialog] = useState<"rename" | "delete" | null>(null);
  const [draft, setDraft] = useState(doc.name);
  const [renameError, setRenameError] = useState<string | null>(null);

  const rename = useMutation({
    mutationFn: (name: string) => renameDocument(doc.id, name),
    onSuccess: (updated) => {
      queryClient.setQueryData<DocumentItem[]>(queryKeys.documents, (current) =>
        current?.map((item) => (item.id === updated.id ? updated : item)),
      );
      queryClient.setQueryData(queryKeys.document(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents });
      setDialog(null);
    },
    onError: (error) => setRenameError(error instanceof ApiError ? (error.fieldErrors.name ?? error.message) : errorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: () => deleteDocument(doc.id),
    onSuccess: () => {
      queryClient.setQueryData<DocumentItem[]>(queryKeys.documents, (current) => current?.filter((item) => item.id !== doc.id));
      for (const key of [queryKeys.document(doc.id), queryKeys.pages(doc.id), queryKeys.messages(doc.id), queryKeys.suggestions(doc.id)]) {
        queryClient.removeQueries({ queryKey: key });
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents });
      void queryClient.invalidateQueries({ queryKey: queryKeys.usage });
      setDialog(null);
      toast({ title: "Document deleted", description: `“${doc.name}” and its chat history were removed.` });
    },
    onError: (error) => {
      setDialog(null);
      toast({ title: "Couldn't delete the document", description: errorMessage(error) });
    },
  });

  const ready = doc.status === "ready";

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${doc.name}`}>
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="max-w-56 truncate">{doc.name}</DropdownMenuLabel>
          <DropdownMenuItem asChild disabled={!ready}>
            <Link href={`/workspace/${doc.id}`}>
              <MessagesSquare /> Open workspace
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              setDraft(doc.name);
              setRenameError(null);
              setDialog("rename");
            }}
          >
            <PencilLine /> Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setDialog("delete")}>
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialog === "rename"} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const name = draft.trim();
              if (!name || name === doc.name) {
                setDialog(null);
                return;
              }
              rename.mutate(name);
            }}
          >
            <DialogHeader>
              <DialogTitle>Rename document</DialogTitle>
              <DialogDescription>Only the display name changes. Citations and chat history are kept.</DialogDescription>
            </DialogHeader>
            <Label htmlFor={`rename-${doc.id}`} className="sr-only">
              Document name
            </Label>
            <Input
              id={`rename-${doc.id}`}
              value={draft}
              maxLength={MAX_NAME}
              onChange={(event) => {
                setDraft(event.target.value);
                setRenameError(null);
              }}
              aria-invalid={Boolean(renameError)}
              aria-describedby={renameError ? `rename-error-${doc.id}` : undefined}
              autoFocus
            />
            {renameError && (
              <p id={`rename-error-${doc.id}`} className="mt-1.5 text-xs text-destructive">
                {renameError}
              </p>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!draft.trim() || rename.isPending}>
                {rename.isPending && <LoaderCircle className="animate-spin" />}
                Save name
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "delete"} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this document?</DialogTitle>
            <DialogDescription>
              “{doc.name}”{doc.chunkCount > 0 ? ` and its ${doc.chunkCount} indexed passages` : ""} will be removed, along with its chat history. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" disabled={remove.isPending} onClick={() => remove.mutate()}>
              {remove.isPending ? <LoaderCircle className="animate-spin" /> : <Trash2 />} Delete document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
