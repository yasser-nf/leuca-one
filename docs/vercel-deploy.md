# Déployer Leuca Sourcing sur Vercel

App Next.js 14 (App Router) — prête pour Vercel. Les secrets restent dans le dashboard Vercel, **jamais** dans le repo.

## Variables d’environnement (obligatoires)

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase (`https://….supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé **anon** (publique) Supabase |

Optionnel (scripts admin seulement, **ne pas** exposer au client) : `SUPABASE_SERVICE_ROLE_KEY`.

## Option A — Dashboard Vercel (recommandé)

1. Aller sur [vercel.com](https://vercel.com) → **Add New…** → **Project**.
2. **Import** le repo GitHub **`yasser-nf/leuca-one`** (autoriser GitHub si demandé).
3. **Configure Project**
   - Framework Preset : **Next.js** (auto)
   - Root Directory : `.` (racine)
   - Build Command : `npm run build` (défaut)
   - Output : laisser le défaut Next.js
4. **Branch**
   - Pour tester la V1 tout de suite : déployer depuis la branche PR  
     `cursor/v1-catalogue-stock-mvp-bc6d`  
     (dans *Git* → Production Branch, ou créer un Deployment depuis cette branche).
   - Pour la prod stable : merger la PR [#1](https://github.com/yasser-nf/leuca-one/pull/1) dans `main`, puis Production Branch = `main`.
5. **Environment Variables** → Add pour **Production** (et Preview si tu veux) :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
   Coller les mêmes valeurs que dans `.env.local` local.
6. **Deploy**.
7. Ouvrir l’URL `https://….vercel.app` → `/login`.

### Après le premier deploy

- Auth : les 2 comptes associés doivent déjà exister dans Supabase Auth.
- Migrations SQL déjà appliquées (001→005) sur ce projet Supabase.
- Domaine custom (optionnel) : Project → Settings → Domains.

## Option B — CLI (si installée chez toi)

```bash
npm i -g vercel
vercel login
cd leuca-one
vercel link          # lier au projet
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel --prod        # ou vercel (preview)
```

Sur la machine cloud Cursor : **pas de CLI Vercel authentifiée** — faire Option A.

## Checklist si la page blanche / erreur

1. Variables bien présentes sur l’environnement **Production** (pas seulement Preview).
2. Redeploy après ajout des env (`Deployments` → ⋯ → Redeploy).
3. Console navigateur : erreurs Supabase → vérifier URL/clé et RLS/migrations.
4. Build local : `npm run build` doit passer (vérifié sur la branche V1).

## Liens

- Repo : https://github.com/yasser-nf/leuca-one  
- PR V1 : https://github.com/yasser-nf/leuca-one/pull/1  
- Env exemple (placeholders) : `.env.example` dans le repo  
