"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const configured = isSupabaseConfigured();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!configured) {
      toast.error("Supabase non configuré. Voir /setup.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message === "Invalid login credentials"
          ? "Email ou mot de passe incorrect."
          : error.message);
        return;
      }
      router.replace("/");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6">
      <div className="mb-10">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
          Leuca DZ
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-leuca-ink">
          Leuca Sourcing
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Connexion réservée aux associés.
        </p>
      </div>

      {!configured ? (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Variables Supabase manquantes.{" "}
          <a href="/setup" className="font-medium underline">
            Voir la configuration
          </a>
          .
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="associe@leuca.dz"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading || !configured}>
          {loading ? "Connexion…" : "Se connecter"}
        </Button>
      </form>
    </div>
  );
}
