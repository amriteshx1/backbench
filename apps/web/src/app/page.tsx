"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getToken, clearToken } from "@/lib/auth";

export default function HomePage() {
  const token = getToken();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center p-6">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-3xl">Backbench</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Practice real backend engineering through API, DB, queue, and worker challenges.
          </p>

          {!token ? (
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/signup">Create account</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/profile">Go to profile</Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  clearToken();
                  window.location.reload();
                }}
              >
                Logout locally
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}