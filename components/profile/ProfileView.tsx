"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Building2, Calendar, Crown, LogOut, Mail, Sparkles } from "lucide-react";
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
  { id: "strict", title: "Strict citation mode", body: "Refuse to answer when no supporting passage is found.", defaultOn: true },
  { id: "stream", title: "Stream responses", body: "Show answers token by token as they are generated.", defaultOn: true },
  { id: "digest", title: "Weekly usage digest", body: "Email a summary of documents and queries every Monday.", defaultOn: false },
  { id: "share", title: "Allow workspace sharing", body: "Let admins share document collections with teammates.", defaultOn: false },
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
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 lg:py-10">
      <header>
        <p className="font-mono text-xs tracking-[0.18em] text-cyan-300 uppercase">Profile</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Account & usage</h1>
      </header>

      {/* Identity card */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-border glass-strong relative mt-8 overflow-hidden rounded-3xl p-6 sm:p-8"
      >
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative w-fit">
            <span className="grid size-20 place-items-center rounded-3xl bg-linear-to-br from-cyan-400 to-violet-500 text-2xl font-semibold text-white shadow-[0_0_40px_-8px] shadow-cyan-400/60">
              {MOCK_USER.initials}
            </span>
            <span className="absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full bg-background ring-2 ring-background">
              <BadgeCheck className="size-5 text-cyan-300" aria-label="Verified" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">{name || MOCK_USER.name}</h2>
              <Badge variant="violet">{MOCK_USER.role}</Badge>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="size-4" aria-hidden /> {MOCK_USER.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="size-4" aria-hidden /> {MOCK_USER.workspace}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" aria-hidden /> Member since {formatDate(MOCK_USER.memberSince)}
              </span>
            </div>
            <div className="mt-4">
              {googleConnected ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/8 py-1 pr-3 pl-1 text-xs text-emerald-100">
                  <span className="grid size-5 place-items-center rounded-full bg-white">
                    <GoogleIcon className="size-3" />
                  </span>
                  Google account connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 py-1 pr-3 pl-1 text-xs text-muted-foreground">
                  <span className="grid size-5 place-items-center rounded-full bg-white/80">
                    <GoogleIcon className="size-3" />
                  </span>
                  Google not connected
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            <Badge variant="outline" className="justify-center">
              <Crown aria-hidden /> Free plan
            </Badge>
            <Button asChild size="sm">
              <Link href="/pricing">
                <Sparkles /> Upgrade
              </Link>
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Quotas */}
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
            hint={docsLeft > 0 ? `${docsLeft} uploads left on the Free plan` : "Limit reached. Upgrade for 500 documents."}
          />
          <QuotaMeter
            label="Queries today"
            used={queriesToday}
            limit={MOCK_USER.dailyQueryLimit}
            unit="queries"
            hint={queriesLeft > 0 ? `${queriesLeft} queries left · resets at midnight UTC` : "Daily limit reached. Resets at midnight UTC."}
          />
        </div>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Personal info */}
        <Card>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
            <CardDescription>Changes are kept in local state only.</CardDescription>
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
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/8 p-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-lg bg-white">
                    <GoogleIcon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">Google</p>
                    <p className="text-xs text-muted-foreground">{googleConnected ? "Used for single sign-on" : "Not connected"}</p>
                  </div>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setGoogleConnected((value) => !value)}>
                  {googleConnected ? "Disconnect" : "Connect"}
                </Button>
              </div>
              <Button type="submit" className="w-full sm:w-auto">
                {saved ? "Saved ✓" : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Assistant preferences</CardTitle>
            <CardDescription>Control how PromptDox answers and notifies you.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-white/6">
            {SETTINGS.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div>
                  <label htmlFor={`setting-${setting.id}`} className="text-sm font-medium">
                    {setting.title}
                  </label>
                  <p className="mt-0.5 text-xs text-muted-foreground">{setting.body}</p>
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

      <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-red-400/20 bg-red-500/5 p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-red-200">Sign out of PromptDox</p>
          <p className="text-xs text-muted-foreground">This demo resets all mock data on a full page reload.</p>
        </div>
        <Button asChild variant="outline" size="sm" className="border-red-400/30 text-red-200 hover:bg-red-500/10">
          <Link href="/sign-in">
            <LogOut /> Sign out
          </Link>
        </Button>
      </div>
    </div>
  );
}
