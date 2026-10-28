# Leuca Sourcing

Application interne **Leuca DZ** — sourcing Chine (catalogue, fournisseurs, stock manuel).  
Stack : Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui + Supabase.

## V1 (ce dépôt)

- Auth email/mot de passe (2 associés, pas d’inscription publique)
- Fournisseurs + cartes de visite
- Modèles + photos (compression client ≤1600 px / ~300 Ko)
- Mouvements de stock + vue `product_stock`
- Tableau de bord (valeur stock = prix CNY × taux settings)
- Paramètres : taux **CNY→DZD** + **CNY→USD** (DZD→USD dérivé) ; prix affichés CNY · DZD · USD
- Import CSV (template fourni ; pas de fichier métier encore)

**Hors V1 :** commandes, expéditions, coût de revient, OCR, sync ventes, catalogue public.

## Prérequis

- Node 20+
- Projet [Supabase](https://supabase.com)

## Configuration Supabase (Yasser)

1. Créer un projet Supabase (région au choix).
2. **Authentication → Providers → Email** activé.  
   Désactiver les inscriptions publiques si possible (**Auth → Settings → Allow new users to sign up** = off) ; créer les 2 comptes associés manuellement (**Authentication → Users → Add user**).
3. Dans **SQL Editor**, exécuter dans l’ordre :
   - `supabase/migrations/001_enums_and_tables.sql`
   - `supabase/migrations/002_product_stock_view.sql`
   - `supabase/migrations/003_rls.sql`
   - `supabase/migrations/004_storage.sql`
4. Vérifier les buckets privés `products` et `business-cards` (créés par la migration storage).
5. Copier **Project URL** + **anon public key** (Settings → API).

## Lancer en local

```bash
cp .env.example .env.local
# renseigner NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY

npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) → `/login`.

Sans variables d’environnement, l’app redirige vers `/setup` avec les instructions.

## Déploiement Vercel

1. Importer le repo GitHub.
2. Ajouter les mêmes variables d’environnement.
3. Deploy. Créer les 2 utilisateurs dans Supabase Auth.

## Import CSV

Voir [docs/csv-template.md](./docs/csv-template.md) ou **Plus → Import CSV** dans l’app.

## Structure

```
src/app/(app)/     # routes authentifiées (dashboard, products, suppliers, stock, …)
src/app/login/     # connexion
supabase/migrations/
docs/csv-template.md
```
