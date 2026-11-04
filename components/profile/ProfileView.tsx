"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import { GoogleIcon } from "@/components/branding/GoogleIcon";
import { QuotaMeter } from "@/components/profile/QuotaMeter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { MOCK_USER } from "@/mock/site";
import { useWorkspaceStore } from "@/store/workspace-store";
import { formatDate } from "@/lib/utils";

const SETTINGS = [
  { id: "strict", title: "Only answer with a source", body: "If no passage supports an answer, say so instead of guessing.", defaultOn: true },
  { id: "stream", title: "Stream answers", body: "Show answers as they're written instead of all at once.", defaultOn: true },
  { id: "digest", title: "Weekly usage email", body: "A Monday summary of uploads and questions.", defaultOn: false },
  { id: "share", title: "Allow sharing", body: "Let admins share documents with teammates.", defaultOn: false },
] as const;

export function ProfileView() {
  const docCount = useWorkspaceStore((state) => state.documents.length);
  const queriesToday = useWorkspaceStore((state) => state.queriesToday);
  const [googleConnected, setGoogleConnected] = useState(MOCK_USER.googleConnected);
  const [settings, setSettings] = useState<Record<string, boolean>>(
    Object.fromEntries(SETTINGS.map((setting) => [setting.id, setting.defaultOn])),
  );
  const [name, setName] = useState(MOCK_USER.name);
  const [saved, setSaved] = useState(false);

  const docsLeft = MOCK_USER.documentLimit - docCount;
  const queriesLeft = MOCK_USER.dailyQueryLimit - queriesToday;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 lg:py-10">
      <h1 className="text-[28px] font-semibold tracking-[-0.025em]">Profile & usage</h1>

      {/* Identity */}
      <section className="mt-7 flex flex-col gap-6 rounded-xl border border-border bg-surface p-6 sm:flex-row sm:items-center">
        <span className="relative grid size-16 shrink-0 place-items-center rounded-full bg-foreground text-xl font-semibold text-white">
          {MOCK_USER.initials}
          <BadgeCheck className="absolute -right-0.5 -bottom-0.5 size-6 rounded-full bg-surface fill-primary text-white" aria-label="Verified email" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight">{name || MOCK_USER.name}</h2>
            <Badge variant="outline">{MOCK_USER.role}</Badge>
          </div>
          <p className="mt-1 text-[15px] text-muted-foreground">{MOCK_USER.email}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-muted-foreground">
            {googleConnected ? (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-foreground">
                <GoogleIcon className="size-3.5" /> Google account connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border-strong px-2 py-1">
                <GoogleIcon className="size-3.5 opacity-50" /> Google not connected
              </span>
            )}
            <span>{MOCK_USER.workspace}</span>
            <span>Member since {formatDate(MOCK_USER.memberSince)}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <span className="text-[13px] text-muted-foreground">Free plan</span>
          <Button asChild size="sm">
            <Link href="/pricing">Upgrade to Pro</Link>
          </Button>
        </div>
      </section>

      {/* Usage */}
      <section aria-labelledby="usage-heading" className="mt-10">
        <h2 id="usage-heading" className="text-lg font-semibold tracking-tight">
          Usage
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <QuotaMeter
            label="Documents uploaded"
            used={docCount}
            limit={MOCK_USER.documentLimit}
            unit="documents"
            hint={docsLeft > 0 ? `You can upload ${docsLeft} more on the Free plan.` : "Limit reached. Pro raises it to 500 documents."}
          />
          <QuotaMeter
            label="Questions today"
            used={queriesToday}
            limit={MOCK_USER.dailyQueryLimit}
            unit="questions"
            hint={queriesLeft > 0 ? `${queriesLeft} left today. Resets at midnight UTC.` : "Daily limit reached. Resets at midnight UTC."}
          />
        </div>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
            <CardDescription>Changes are kept for this session only.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                setSaved(true);
                setTimeout(() => setSaved(false), 1800);
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="profile-name">Display name</Label>
                <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-email">Email</Label>
                <Input id="profile-email" value={MOCK_USER.email} disabled />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <GoogleIcon className="size-5" />
                  <div>
                    <p className="text-sm font-medium">Google</p>
                    <p className="text-xs text-muted-foreground">{googleConnected ? "Used for sign-in" : "Not connected"}</p>
                  </div>
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={() => setGoogleConnected((value) => !value)}>
                  {googleConnected ? "Disconnect" : "Connect"}
                </Button>
              </div>
              <Button type="submit">{saved ? "Changes saved" : "Save changes"}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Answer preferences</CardTitle>
            <CardDescription>How PromptDox answers and when it emails you.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {SETTINGS.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div>
                  <label htmlFor={`setting-${setting.id}`} className="text-sm font-medium">
                    {setting.title}
                  </label>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">{setting.body}</p>
                </div>
                <Switch
                  id={`setting-${setting.id}`}
                  checked={settings[setting.id]}
                  onCheckedChange={(checked) => setSettings((current) => ({ ...current, [setting.id]: checked }))}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">Signing out resets this demo&apos;s sample data.</p>
        <Button asChild variant="secondary" size="sm">
          <Link href="/sign-in">Sign out</Link>
        </Button>
      </div>
    </div>
  );
}
