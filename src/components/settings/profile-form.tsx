"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Upload } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { updateUser, useSession } from "@/lib/auth-client";
import { getInitials } from "@/lib/format";
import {
  AVATAR_ACCEPT,
  AVATAR_HINT,
  uploadAvatar,
  validateAvatar,
} from "@/lib/upload-avatar";

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 80;

type ProfileUser = {
  name: string;
  email: string;
  image?: string | null;
};

export function ProfileForm({
  user: initialUser,
  uploadsEnabled,
}: {
  user: ProfileUser;
  uploadsEnabled: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user ?? initialUser;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initialUser.name);
  const [isSavingName, setIsSavingName] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const isUploading = uploadPercent !== null;
  const trimmedName = name.trim();
  const nameChanged = trimmedName !== user.name;
  const nameValid = trimmedName.length >= MIN_NAME_LENGTH;
  const canSaveName = nameValid && nameChanged && !isSavingName;

  const saveName = async () => {
    if (!canSaveName) return;

    setIsSavingName(true);
    const { error } = await updateUser({ name: trimmedName });
    setIsSavingName(false);

    if (error) {
      toast.add({
        type: "error",
        title: "Could not update your name",
        description: error.message ?? "Please try again.",
      });
      return;
    }

    router.refresh();
    toast.add({ type: "success", title: "Name updated" });
  };

  const setImage = async (image: string | null) => {
    const { error } = await updateUser({ image });

    if (error) {
      throw new Error(error.message ?? "Could not update your photo.");
    }

    router.refresh();
  };

  const handleFile = async (file: File) => {
    const problem = validateAvatar(file);

    if (problem) {
      toast.add({ type: "error", title: "Unsupported image", description: problem });
      return;
    }

    setUploadPercent(0);

    try {
      const url = await uploadAvatar(file, setUploadPercent);
      await setImage(url);
      toast.add({ type: "success", title: "Photo updated" });
    } catch (error) {
      toast.add({
        type: "error",
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setUploadPercent(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removePhoto = async () => {
    setIsRemoving(true);

    try {
      await setImage(null);
      toast.add({ type: "success", title: "Photo removed" });
    } catch (error) {
      toast.add({
        type: "error",
        title: "Could not remove the photo",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Your photo and name appear on your account menu.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-5">
          <Avatar className="size-16">
            <AvatarImage src={user.image ?? undefined} alt="" />
            <AvatarFallback className="text-lg">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={AVATAR_ACCEPT}
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    void handleFile(file);
                  }
                }}
              />

              <Button
                variant="outline"
                size="sm"
                disabled={isUploading || isRemoving || !uploadsEnabled}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? <Spinner /> : <Upload data-icon="inline-start" />}
                {isUploading ? "Uploading" : "Upload photo"}
              </Button>

              {user.image ? (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isUploading || isRemoving}
                  onClick={() => void removePhoto()}
                >
                  {isRemoving ? <Spinner /> : <Trash2 data-icon="inline-start" />}
                  Remove
                </Button>
              ) : null}
            </div>

            {isUploading ? (
              <Progress value={uploadPercent} className="max-w-64" />
            ) : (
              <p className="text-xs text-muted-foreground">
                {uploadsEnabled
                  ? AVATAR_HINT
                  : "Uploads are unavailable until IMAGEKIT_PUBLIC_KEY and IMAGEKIT_PRIVATE_KEY are set."}
              </p>
            )}
          </div>
        </div>

        <Field>
          <FieldLabel htmlFor="profile-name">Display name</FieldLabel>
          <Input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void saveName();
              }
            }}
            placeholder="Your name"
            maxLength={MAX_NAME_LENGTH}
            className="max-w-sm"
          />
          <FieldDescription>
            Used across Zivo. Between {MIN_NAME_LENGTH} and {MAX_NAME_LENGTH}{" "}
            characters.
          </FieldDescription>
        </Field>
      </CardContent>

      <CardFooter className="justify-end border-t">
        <Button onClick={() => void saveName()} disabled={!canSaveName}>
          {isSavingName ? <Spinner /> : null}
          Save changes
        </Button>
      </CardFooter>
    </Card>
  );
}
