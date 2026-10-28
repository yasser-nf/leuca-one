import Link from "next/link";

export default function SetupPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
        Leuca DZ
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-leuca-ink">
        Configuration requise
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        L&apos;application tourne, mais Supabase n&apos;est pas encore branché.
        Suivez le README pour créer le projet, appliquer les migrations SQL et
        renseigner <code className="rounded bg-muted px-1">.env.local</code>.
      </p>
      <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm">
        <li>Créer un projet Supabase (Auth email/password, sans signup public).</li>
        <li>
          Exécuter dans l&apos;ordre les fichiers{" "}
          <code className="rounded bg-muted px-1">supabase/migrations/*.sql</code>.
        </li>
        <li>
          Copier <code className="rounded bg-muted px-1">.env.example</code> →{" "}
          <code className="rounded bg-muted px-1">.env.local</code> avec URL + anon key.
        </li>
        <li>Créer les 2 comptes associés dans Authentication → Users.</li>
        <li>Redémarrer <code className="rounded bg-muted px-1">npm run dev</code>.</li>
      </ol>
      <Link
        href="/login"
        className="mt-8 inline-flex text-sm font-medium text-accent underline"
      >
        Aller à la connexion
      </Link>
    </div>
  );
}
