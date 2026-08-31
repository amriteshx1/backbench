"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type MeResponse = {
  user: {
    id: string;
    email: string;
    username: string;
    avatarUrl: string | null;
  };
  profile: {
    displayName: string | null;
    bio: string | null;
    githubUrl: string | null;
    solvedCount: number;
  } | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = getToken();

  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    githubUrl: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: () => apiRequest<MeResponse>("/me", { token }),
    enabled: Boolean(token),
  });

  useEffect(() => {
    if (meQuery.data?.profile) {
      setForm({
        displayName: meQuery.data.profile.displayName ?? "",
        bio: meQuery.data.profile.bio ?? "",
        githubUrl: meQuery.data.profile.githubUrl ?? "",
        avatarUrl: meQuery.data.user.avatarUrl ?? "",
      });
    }
  }, [meQuery.data]);

  const updateMutation = useMutation({
    mutationFn: () =>
      apiRequest<MeResponse>("/me/profile", {
        method: "PATCH",
        token,
        body: {
          displayName: form.displayName || null,
          bio: form.bio || null,
          githubUrl: form.githubUrl || null,
          avatarUrl: form.avatarUrl || null,
        },
      }),
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Update failed");
    },
  });

  if (!token) return null;

  if (meQuery.isLoading) {
    return <main className="p-6">Loading profile...</main>;
  }

  if (meQuery.isError) {
    return (
      <main className="p-6 space-y-4">
        <p>Session expired or invalid.</p>
        <Button
          onClick={() => {
            clearToken();
            router.push("/login");
          }}
        >
          Login again
        </Button>
      </main>
    );
  }

  const user = meQuery.data?.user;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Email: {user?.email}</p>
            <p>Username: {user?.username}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={form.displayName}
              onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="githubUrl">GitHub URL</Label>
            <Input
              id="githubUrl"
              value={form.githubUrl}
              onChange={(e) => setForm((p) => ({ ...p, githubUrl: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              value={form.avatarUrl}
              onChange={(e) => setForm((p) => ({ ...p, avatarUrl: e.target.value }))}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/challenges">Challenge catalog</Link>
            </Button>
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save profile"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                clearToken();
                router.push("/login");
              }}
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}