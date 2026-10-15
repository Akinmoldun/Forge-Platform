import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction } from "@/hooks/use-safe-query";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ListSkeleton } from "@/components/forge";
import { cn } from "@/lib/utils";
import {
  AVATAR_KEYS,
  AvatarIllustration,
} from "@/components/Illustrations";
import { toast } from "sonner";
import {
  Bell,
  CheckCheck,
  Globe,
  Loader2,
  Send,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

export default function ProfileSettingsPage() {
  const currentUser = useQuery(api.users.currentUser);
  const emailConfig = useQuery(api.email.getEmailConfig);

  const updateProfile = useMutation(api.users.updateProfile);
  const updateAvatarKey = useMutation(api.users.updateAvatarKey);
  const removeAvatar = useMutation(api.users.removeAvatar);
  const generateUploadUrl = useMutation(api.users.generateAvatarUploadUrl);
  const updatePrefs = useMutation(api.users.updateNotificationPreferences);
  const markAllRead = useMutation(api.analytics.markAllNotificationsRead);
  const sendTestEmail = useAction(api.email.sendTestEmail);

  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [timezone, setTimezone] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  // Email toggles
  const [emailMentions, setEmailMentions] = useState(true);
  const [emailAssigned, setEmailAssigned] = useState(true);
  const [emailComments, setEmailComments] = useState(true);
  const [emailStatus, setEmailStatus] = useState(true);
  const [emailInvites, setEmailInvites] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setJobTitle(currentUser.jobTitle || "");
      setTimezone(
        currentUser.timezone ||
          Intl.DateTimeFormat().resolvedOptions().timeZone ||
          "UTC",
      );
      setEmailMentions(currentUser.emailMentions !== false);
      setEmailAssigned(currentUser.emailAssigned !== false);
      setEmailComments(currentUser.emailComments !== false);
      setEmailStatus(currentUser.emailStatus !== false);
      setEmailInvites(currentUser.emailInvites !== false);
    }
  }, [currentUser]);

  if (currentUser === undefined) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl py-6">
          <ListSkeleton rows={4} />
        </div>
      </AppShell>
    );
  }

  const isGuest = Boolean(currentUser?.isAnonymous);

  const handleSaveProfile = async () => {
    if (savingProfile) return;
    setSavingProfile(true);
    try {
      await updateProfile({
        name: name.trim() || undefined,
        jobTitle: jobTitle.trim() || undefined,
        timezone: timezone.trim() || undefined,
      });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("Please select a PNG, JPG, or WebP image");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar image must be 2 MB or smaller");
      return;
    }

    setUploadingAvatar(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };

      await updateProfile({ avatarStorageId: storageId });
      toast.success("Avatar updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await removeAvatar();
      toast.success("Avatar removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove avatar");
    }
  };

  const handleTogglePref = async (
    field: "emailMentions" | "emailAssigned" | "emailComments" | "emailStatus" | "emailInvites",
    val: boolean,
  ) => {
    if (field === "emailMentions") setEmailMentions(val);
    if (field === "emailAssigned") setEmailAssigned(val);
    if (field === "emailComments") setEmailComments(val);
    if (field === "emailStatus") setEmailStatus(val);
    if (field === "emailInvites") setEmailInvites(val);

    try {
      await updatePrefs({ [field]: val });
      toast.success("Notification preferences updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save preference");
    }
  };

  const handleSendTestEmail = async () => {
    if (sendingTest) return;
    setSendingTest(true);
    try {
      const res = await sendTestEmail();
      if (res.ok) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send test email");
    } finally {
      setSendingTest(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (markingAllRead) return;
    setMarkingAllRead(true);
    try {
      await markAllRead();
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to mark notifications as read");
    } finally {
      setMarkingAllRead(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl pb-16">
        <div className="mb-6">
          <h1 className="text-[28px] font-[500] leading-tight tracking-[-0.02em] text-[#0D0D0D]">
            Account settings
          </h1>
          <p className="mt-1 text-[13px] text-[#575657]">
            Manage your personal profile, avatar, and notification preferences.
          </p>
        </div>

        {/* SECTION 1: PROFILE */}
        <section className="space-y-4 rounded-[16px] border border-border bg-white p-6">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <User className="size-4 text-[#575657]" />
            <h2 className="text-[15px] font-[600] text-[#0D0D0D]">Profile information</h2>
          </div>

          {/* Avatar row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 pt-2">
            <div className="relative">
              <Avatar className="size-20 border border-border">
                {currentUser?.image ? (
                  <AvatarImage
                    src={currentUser.image}
                    alt={currentUser.name ?? "Avatar"}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="bg-transparent border-0 p-0">
                  <AvatarIllustration
                    avatarKey={currentUser?.avatarKey}
                    name={currentUser?.name}
                    id={currentUser?._id}
                    size={80}
                  />
                </AvatarFallback>
              </Avatar>
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-xs">
                  <Loader2 className="size-5 animate-spin text-[#0D0D0D]" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarFileChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={uploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full text-[13px] h-8 px-3.5"
                >
                  <Upload className="size-3.5 mr-1.5" />
                  Upload new avatar
                </Button>

                {currentUser?.image && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleRemoveAvatar}
                    className="rounded-full text-[13px] h-8 px-3 text-[#B3261E] hover:bg-[#B3261E]/10 hover:text-[#B3261E]"
                  >
                    <Trash2 className="size-3.5 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-[#575657]">
                PNG, JPG or WebP up to 2 MB. Square or portrait works best.
              </p>
            </div>
          </div>

          {/* Choose an avatar (12 illustrations grid) */}
          <div className="space-y-2 pt-2 border-t border-border/70">
            <Label className="text-[13px] font-medium text-[#0D0D0D]">
              Choose an avatar
            </Label>
            <p className="text-[12px] text-[#575657]">
              Select from our 12 original illustrated avatars. Saves immediately.
            </p>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2.5 pt-1">
              {AVATAR_KEYS.map((key) => {
                const isSelected =
                  !currentUser?.image &&
                  (currentUser?.avatarKey === key ||
                    (!currentUser?.avatarKey && key === "fox"));
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={async () => {
                      try {
                        await updateAvatarKey({ avatarKey: key });
                        toast.success(`Selected ${key} avatar`);
                      } catch {
                        toast.error("Failed to update avatar");
                      }
                    }}
                    className={cn(
                      "group relative flex size-10 items-center justify-center rounded-full p-0.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer",
                      isSelected && "ring-2 ring-[#0D0D0D] ring-offset-2"
                    )}
                    aria-label={`Select ${key} avatar`}
                  >
                    <AvatarIllustration avatarKey={key} size={36} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 pt-3">
            {/* Display name */}
            <div className="space-y-1.5">
              <Label htmlFor="display-name" className="text-[13px] font-medium text-[#0D0D0D]">
                Display name
              </Label>
              <Input
                id="display-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="h-10 rounded-[12px] text-[13px]"
              />
            </div>

            {/* Job title */}
            <div className="space-y-1.5">
              <Label htmlFor="job-title" className="text-[13px] font-medium text-[#0D0D0D]">
                Job title <span className="font-normal text-[#9A9A9F]">(optional)</span>
              </Label>
              <Input
                id="job-title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Lead Software Engineer"
                className="h-10 rounded-[12px] text-[13px]"
              />
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px] font-medium text-[#0D0D0D]">
                Email address
              </Label>
              <Input
                id="email"
                value={currentUser?.email || (isGuest ? "Guest account (no email)" : "No email provided by GitHub")}
                disabled
                className="h-10 rounded-[12px] text-[13px] bg-[#F1F1F3] text-[#575657]"
              />
              <p className="text-[11px] text-[#575657]">
                Email address cannot be changed directly.
              </p>
            </div>

            {/* Timezone */}
            <div className="space-y-1.5">
              <Label htmlFor="timezone" className="text-[13px] font-medium text-[#0D0D0D]">
                Timezone
              </Label>
              <div className="relative">
                <Globe className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#575657]" />
                <Input
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="e.g. America/New_York"
                  className="h-10 rounded-[12px] pl-9 text-[13px]"
                />
              </div>
              <p className="text-[11px] text-[#575657]">
                Used for notification schedules and activity timestamps.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleSaveProfile}
              disabled={savingProfile || !name.trim()}
              className="rounded-full bg-[#0D0D0D] text-white hover:bg-[#262626] h-9 px-5 text-[13px]"
            >
              {savingProfile && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
              Save profile changes
            </Button>
          </div>
        </section>

        {/* SECTION 2: NOTIFICATION PREFERENCES */}
        <section className="mt-8 space-y-4 rounded-[16px] border border-border bg-white p-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-[#575657]" />
              <h2 className="text-[15px] font-[600] text-[#0D0D0D]">Notification preferences</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markingAllRead}
              className="rounded-full h-8 px-3 text-[12px]"
            >
              <CheckCheck className="size-3.5 mr-1 text-[#575657]" />
              Mark all as read
            </Button>
          </div>

          <p className="text-[13px] text-[#575657]">
            Choose which events trigger an email notification to your address. Welcome emails are always delivered on account creation.
          </p>

          <div className="divide-y divide-border/60">
            {/* Mentioned */}
            <div className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-[13px] font-[500] text-[#0D0D0D]">Mentions in comments</p>
                <p className="text-[12px] text-[#575657]">
                  Receive an email when a teammate mentions you with @name in a comment.
                </p>
              </div>
              <Switch
                checked={emailMentions}
                onCheckedChange={(val) => handleTogglePref("emailMentions", val)}
              />
            </div>

            {/* Assigned */}
            <div className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-[13px] font-[500] text-[#0D0D0D]">Issue assigned to you</p>
                <p className="text-[12px] text-[#575657]">
                  Receive an email when someone assigns an issue to you.
                </p>
              </div>
              <Switch
                checked={emailAssigned}
                onCheckedChange={(val) => handleTogglePref("emailAssigned", val)}
              />
            </div>

            {/* Comments */}
            <div className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-[13px] font-[500] text-[#0D0D0D]">Comments on your issues</p>
                <p className="text-[12px] text-[#575657]">
                  Receive an email when a comment is added to an issue you reported or are assigned to.
                </p>
              </div>
              <Switch
                checked={emailComments}
                onCheckedChange={(val) => handleTogglePref("emailComments", val)}
              />
            </div>

            {/* Status changes */}
            <div className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-[13px] font-[500] text-[#0D0D0D]">Status changes</p>
                <p className="text-[12px] text-[#575657]">
                  Receive an email when the status changes on an issue you reported or are assigned to.
                </p>
              </div>
              <Switch
                checked={emailStatus}
                onCheckedChange={(val) => handleTogglePref("emailStatus", val)}
              />
            </div>

            {/* Invites */}
            <div className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-[13px] font-[500] text-[#0D0D0D]">Workspace invitations</p>
                <p className="text-[12px] text-[#575657]">
                  Receive an email when you are invited to join a new workspace.
                </p>
              </div>
              <Switch
                checked={emailInvites}
                onCheckedChange={(val) => handleTogglePref("emailInvites", val)}
              />
            </div>
          </div>

          {/* Test email row */}
          <div className="mt-4 rounded-[12px] border border-border bg-[#FBFBFC] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-[13px] font-[500] text-[#0D0D0D]">Verify email delivery</p>
              <p className="text-[12px] text-[#575657]">
                Active provider:{" "}
                <span className="font-semibold text-[#0D0D0D]">
                  {emailConfig?.provider ?? "log"}
                </span>{" "}
                {emailConfig?.provider === "log" &&
                  "(unconfigured provider prints safe logs to console instead of sending)"}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={sendingTest || isGuest}
              onClick={handleSendTestEmail}
              className="rounded-full h-9 px-4 text-[13px] shrink-0"
            >
              {sendingTest ? (
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
              ) : (
                <Send className="size-3.5 mr-1.5" />
              )}
              Send test email to me
            </Button>
          </div>
          {isGuest && (
            <p className="text-[12px] text-[#575657]">
              Test emails and notifications are disabled for anonymous guest sessions.
            </p>
          )}
        </section>
      </div>
    </AppShell>
  );
}
