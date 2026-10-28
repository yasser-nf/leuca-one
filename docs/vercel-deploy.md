# Déployer Leuca Sourcing sur Vercel

App Next.js 14 (App Router) — `npm run build` OK sur la branche V1. Secrets uniquement dans le dashboard Vercel.

## Variables d’environnement (obligatoires)

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clé **anon** Supabase |

À définir pour **Preview** et **Production**. Redeploy après les avoir ajoutées.

---

## 404 / « NOT_FOUND » sur l’URL preview — cause réelle

Le déploiement Git de la branche PR **a réussi** (`Vercel – leuca-stock` = success).

L’URL preview du type :

`https://leuca-stock-git-cursor-v1-catalogue-stock-mvp-bc6d-mahfazati.vercel.app`

répond **302 → Vercel Authentication (SSO)**, pas une erreur Next.js. Sans session Vercel (compte du projet `mahfazati`), le navigateur peut afficher une page plateforme **404 NOT_FOUND**.

Ce n’est **pas** :
- un `main` vide
- un bug `basePath` / middleware / App Router
- un mauvais Root Directory (le build Next a bien tourné)

### Fix immédiat (dashboard — 30 s)

1. Ouvre [vercel.com](https://vercel.com) → projet **`leuca-stock`** (équipe/compte **mahfazati**).
2. **Settings → Deployment Protection** (parfois sous *Security*).
3. Pour **Preview** : mets la protection sur **None** / désactive **Vercel Authentication**  
   (ou « Only Preview Deployments » → off).
4. **Sauve**. Pas besoin de redeploy du code : recharge l’URL preview (ou ouvre-la via **Deployments → Visit** pendant que tu es connecté à Vercel).

**Contournement sans changer les settings :**  
Deployments → clic sur le dernier deploy de `cursor/v1-catalogue-stock-mvp-bc6d` → bouton **Visit** / **Open** (ajoute un cookie SSO). Tu dois être loggé sur le bon compte Vercel.

### `leuca-stock.vercel.app` = NOT_FOUND

Normal tant qu’il n’y a **pas de déploiement Production**. `main` n’a encore que le stub README. Options :

- **A.** Merger la PR [#1](https://github.com/yasser-nf/leuca-one/pull/1) dans `main` → Production Branch = `main` → redeploy Production  
- **B.** Temporairement : Settings → Git → **Production Branch** = `cursor/v1-catalogue-stock-mvp-bc6d`, puis Redeploy Production

---

## Premier import (si pas déjà fait)

1. **Add New → Project** → import **`yasser-nf/leuca-one`**
2. Framework : **Next.js** · Root Directory : **`.`** (racine) · Output : défaut (ne pas mettre `out` / `dist`)
3. Env : les 2 variables ci-dessus (Preview + Production)
4. Deploy

## Après accès OK

1. Ouvre `/login`
2. Comptes associés déjà créés dans Supabase Auth
3. Migrations `001`→`005` déjà appliquées

## Merge readiness

- Branche PR prête à merger pour la prod.
- Après merge : Production Branch = `main`, env Production renseignées, un redeploy Production.
- Désactiver Deployment Protection sur Preview (ou Production si tu veux un accès public sans login Vercel) — l’app a déjà son propre login Supabase.

## Checklist debug

| Symptôme | Action |
|----------|--------|
| 404 `x-vercel-error: NOT_FOUND` sur preview | Désactiver Vercel Authentication / ouvrir via Dashboard Visit |
| 404 sur `*.vercel.app` production | Pas de deploy Production — merger ou changer Production Branch |
| Login /setup « variables manquantes » | Ajouter env Preview+Production puis Redeploy |
| Build failed | Voir logs ; localement `npm run build` |

## Liens

- Repo : https://github.com/yasser-nf/leuca-one  
- PR V1 : https://github.com/yasser-nf/leuca-one/pull/1  
- Déploiement réussi (exemple) : voir check « Vercel – leuca-stock » sur la PR  
