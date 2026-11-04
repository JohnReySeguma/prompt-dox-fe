"use client";

import Link from "next/link";
import { useState } from "react";
import { Ellipsis, MessagesSquare, PencilLine, Trash2 } from "lucide-react";
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
import { useWorkspaceStore } from "@/store/workspace-store";
import type { DocumentItem } from "@/types";

export function DocumentActions({ doc }: { doc: DocumentItem }) {
  const renameDocument = useWorkspaceStore((state) => state.renameDocument);
  const deleteDocument = useWorkspaceStore((state) => state.deleteDocument);
  const [dialog, setDialog] = useState<"rename" | "delete" | null>(null);
  const [draft, setDraft] = useState(doc.name);

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
              renameDocument(doc.id, draft);
              setDialog(null);
            }}
          >
            <DialogHeader>
              <DialogTitle>Rename document</DialogTitle>
              <DialogDescription>Only the display name changes. Citations and chat history are kept.</DialogDescription>
            </DialogHeader>
            <Label htmlFor={`rename-${doc.id}`} className="sr-only">
              Document name
            </Label>
            <Input id={`rename-${doc.id}`} value={draft} onChange={(event) => setDraft(event.target.value)} autoFocus />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!draft.trim()}>
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
              “{doc.name}” and its {doc.chunkCount} indexed chunks will be removed, along with its chat history. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                setDialog(null);
                deleteDocument(doc.id);
              }}
            >
              <Trash2 /> Delete document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
