"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { BadgeCheck, CircleAlert, LoaderCircle, RotateCw } from "lucide-react";
import { GoogleIcon } from "@/components/branding/GoogleIcon";
import { GoogleConnection } from "@/components/profile/GoogleConnection";
import { QuotaMeter } from "@/components/profile/QuotaMeter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { UpgradeDialog } from "@/components/billing/UpgradeDialog";
import { useSignOut } from "@/hooks/use-sign-out";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { patchMe, patchSettings, switchPlan } from "@/lib/api/me";
import { queryKeys, useMe, useSettings, useUsage } from "@/lib/queries";
import { useToast } from "@/store/toast-store";
import { cn, formatDate } from "@/lib/utils";
import type { Settings, Usage, User } from "@/types";

const SETTINGS: Array<{ id: keyof Settings; title: string; body: string }> = [
  { id: "strictCitations", title: "Only answer with a source", body: "If no passage supports an answer, say so instead of guessing." },
  { id: "streamAnswers", title: "Stream answers", body: "Show answers as they're written instead of all at once." },
  { id: "weeklyDigest", title: "Weekly usage email", body: "A Monday summary of uploads and questions." },
  { id: "allowSharing", title: "Allow sharing", body: "Let admins share documents with teammates." },
];

const MAX_NAME = 80;

function formatResetTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC", timeZoneName: "short" }).format(
    new Date(iso),
  );
}

function PersonalDetails({ user }: { user: User }) {
  const queryClient = useQueryClient();
  const { update } = useSession();
  const [name, setName] = useState(user.name);
  const [saved, setSaved] = useState(false);

  const save = useMutation({
    mutationFn: (next: string) => patchMe({ name: next }),
    onSuccess: (next) => {
      queryClient.setQueryData(queryKeys.me, next);
      // Keep the copy in the session (used before /v1/me loads) in step.
      void update({ user: next });
      setName(next.name);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    },
  });

  const nameError = save.error instanceof ApiError ? (save.error.fieldErrors.name ?? save.error.message) : save.error ? errorMessage(save.error) : null;
  const trimmed = name.trim();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal details</CardTitle>
        <CardDescription>How you appear in your workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (trimmed && trimmed !== user.name) save.mutate(trimmed);
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Display name</Label>
            <Input
              id="profile-name"
              value={name}
              maxLength={MAX_NAME}
              onChange={(event) => {
                setName(event.target.value);
                save.reset();
              }}
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? "profile-name-error" : undefined}
            />
            {nameError && (
              <p id="profile-name-error" className="text-xs text-destructive">
                {nameError}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" value={user.email} disabled />
          </div>
          <GoogleConnection user={user} />
          <Button type="submit" disabled={save.isPending || !trimmed || trimmed === user.name}>
            {save.isPending && <LoaderCircle className="animate-spin" />}
            {saved ? "Changes saved" : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Preferences() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data: settings, isPending, isError, refetch } = useSettings();

  // Optimistic: flip the switch now, roll back if the server says no.
  const change = useMutation({
    mutationFn: (patch: Partial<Settings>) => patchSettings(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.settings });
      const previous = queryClient.getQueryData<Settings>(queryKeys.settings);
      if (previous) queryClient.setQueryData<Settings>(queryKeys.settings, { ...previous, ...patch });
      return { previous };
    },
    onError: (error, _patch, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.settings, context.previous);
      toast({ title: "Couldn't save that setting", description: errorMessage(error) });
    },
    onSuccess: (next) => {
      queryClient.setQueryData(queryKeys.settings, next);
      void queryClient.invalidateQueries({ queryKey: queryKeys.me });
      void queryClient.invalidateQueries({ queryKey: queryKeys.usage });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Answer preferences</CardTitle>
        <CardDescription>How PromptDox answers and when it emails you.</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {isError && !settings ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Your preferences didn&apos;t load.</p>
            <Button variant="secondary" size="sm" onClick={() => void refetch()}>
              <RotateCw /> Try again
            </Button>
          </div>
        ) : (
          SETTINGS.map((setting) => (
            <div key={setting.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <div>
                <label htmlFor={`setting-${setting.id}`} className="text-sm font-medium">
                  {setting.title}
                </label>
                <p className="mt-0.5 text-[13px] text-muted-foreground">{setting.body}</p>
              </div>
              {isPending ? (
                <Skeleton className="h-6 w-10 rounded-full" />
              ) : (
                <Switch
                  id={`setting-${setting.id}`}
                  checked={settings?.[setting.id] ?? false}
                  onCheckedChange={(checked) => change.mutate({ [setting.id]: checked })}
                />
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function UsageSection({ usage }: { usage: Usage | undefined }) {
  if (!usage) {
    return (
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[188px] rounded-xl" />
        <Skeleton className="h-[188px] rounded-xl" />
      </div>
    );
  }
  const isPro = usage.plan === "pro";
  const docsLimit = usage.documents.limit;
  const docsLeft = docsLimit === null ? null : docsLimit - usage.documents.used;
  const queriesLimit = usage.queriesToday.limit;
  const queriesLeft = queriesLimit === null ? null : queriesLimit - usage.queriesToday.used;
  const resets = `Resets at ${formatResetTime(usage.queriesToday.resetsAt)}.`;

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <QuotaMeter
        label="Documents uploaded"
        used={usage.documents.used}
        limit={docsLimit}
        unit="documents"
        hint={
          docsLeft === null
            ? "Your plan has no document limit."
            : docsLeft > 0
              ? `You can upload ${docsLeft} more on the ${isPro ? "Pro" : "Free"} plan.`
              : isPro
                ? "Limit reached. Delete a document to add more."
                : "Limit reached. Pro raises it to 500 documents."
        }
      />
      <QuotaMeter
        label="Questions today"
        used={usage.queriesToday.used}
        limit={queriesLimit}
        unit="questions"
        hint={
          queriesLeft === null
            ? "Your plan has no daily question limit."
            : queriesLeft > 0
              ? `${queriesLeft} left today. ${resets}`
              : `Daily limit reached. ${resets}`
        }
      />
    </div>
  );
}

function PlanControls({ usage }: { usage: Usage | undefined }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const downgrade = useMutation({
    mutationFn: () => switchPlan("free"),
    onSuccess: (next) => {
      queryClient.setQueryData<Usage>(queryKeys.usage, next);
      void queryClient.invalidateQueries({ queryKey: queryKeys.me });
      toast({ title: "Switched back to Free", description: "Your documents are kept. New uploads follow the Free limits." });
    },
    onError: (error) => toast({ title: "Couldn't change your plan", description: errorMessage(error) }),
  });

  if (!usage) return <Skeleton className="h-14 w-32" />;
  if (usage.plan === "pro") {
    return (
      <>
        <span className="rounded-md bg-marker px-2 py-0.5 text-[13px] font-medium">Pro plan</span>
        <Button variant="link" size="sm" onClick={() => downgrade.mutate()} disabled={downgrade.isPending}>
          {downgrade.isPending && <LoaderCircle className="animate-spin" />}
          Switch back to Free
        </Button>
      </>
    );
  }
  return (
    <>
      <span className="text-[13px] text-muted-foreground">Free plan</span>
      <UpgradeDialog>
        <Button size="sm">Upgrade to Pro</Button>
      </UpgradeDialog>
    </>
  );
}

export function ProfileView() {
  const { data: user, isPending, isError, error, refetch, isRefetching } = useMe();
  const { data: usage } = useUsage();
  const { signOut, pending: signingOut } = useSignOut();

  if (isError && !user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center" role="alert">
        <CircleAlert className="size-9 text-destructive" aria-hidden />
        <h1 className="mt-4 text-xl font-semibold">Your profile didn&apos;t load</h1>
        <p className="mt-1 max-w-sm text-[15px] text-muted-foreground">{errorMessage(error)}</p>
        <Button variant="secondary" className="mt-6" onClick={() => void refetch()} disabled={isRefetching}>
          <RotateCw className={cn(isRefetching && "animate-spin")} /> Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 lg:py-10">
      <h1 className="text-[28px] font-semibold tracking-[-0.025em]">Profile & usage</h1>

      {/* Identity */}
      {isPending || !user ? (
        <Skeleton className="mt-7 h-[140px] rounded-xl" />
      ) : (
        <section className="mt-7 flex flex-col gap-6 rounded-xl border border-border bg-surface p-6 sm:flex-row sm:items-center">
          <span className="relative grid size-16 shrink-0 place-items-center rounded-full bg-foreground text-xl font-semibold text-white">
            {user.initials}
            <BadgeCheck className="absolute -right-0.5 -bottom-0.5 size-6 rounded-full bg-surface fill-primary text-white" aria-label="Verified email" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">{user.name}</h2>
              <Badge variant="outline">{user.role}</Badge>
            </div>
            <p className="mt-1 text-[15px] text-muted-foreground">{user.email}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-muted-foreground">
              {user.googleConnected ? (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-foreground">
                  <GoogleIcon className="size-3.5" /> Google account connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border-strong px-2 py-1">
                  <GoogleIcon className="size-3.5 opacity-50" /> Google not connected
                </span>
              )}
              <span>{user.workspace}</span>
              <span>Member since {formatDate(user.memberSince)}</span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <PlanControls usage={usage} />
          </div>
        </section>
      )}

      {/* Usage */}
      <section aria-labelledby="usage-heading" className="mt-10">
        <h2 id="usage-heading" className="text-lg font-semibold tracking-tight">
          Usage
        </h2>
        <UsageSection usage={usage} />
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {user ? <PersonalDetails key={user.id} user={user} /> : <Skeleton className="h-[360px] rounded-xl" />}
        <Preferences />
      </div>

      <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          You can sign back in any time.
        </p>
        <Button variant="secondary" size="sm" onClick={() => void signOut()} disabled={signingOut}>
          {signingOut && <LoaderCircle className="animate-spin" />}
          Sign out
        </Button>
      </div>
    </div>
  );
}
