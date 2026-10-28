# Checklist Vercel — pour Yasser (à faire dans l’ordre)

**Constat technique (cloud) :** le code sur `main` est bon (Next.js + `/login`, `npm run build` OK).  
Toutes les URLs publiques renvoient encore `NOT_FOUND` (erreur **plateforme** Vercel, pas l’app).  
Le build GitHub affiche **Success** → il faut corriger le **projet** Vercel.

---

## 1) Ouvre le bon déploiement (pas une ancienne URL)

1. Connecte-toi sur [vercel.com](https://vercel.com) avec le compte **`mahfazati`**.
2. Projet **`leuca-stock`**.
3. Onglet **Deployments**.
4. Clique la ligne la plus haute avec :
   - branche **`main`**
   - statut **Ready** / vert  
   Lien direct (dernier connu) :  
   https://vercel.com/mahfazati/leuca-stock/8zuAXk5hvt8oMsmRX4HtF9WMAKLg
5. Bouton **Visit** (en haut à droite).

**Ce que tu dois voir :** la page **Leuca Sourcing** → connexion (**« Se connecter »**, champs Email / Mot de passe), ou éventuellement **/setup** si les variables d’env manquent.  
**Pas** une page blanche `NOT_FOUND` grise Vercel.

Si **Visit** montre déjà le login → l’app marche ; le souci est seulement le **domaine** (étape 3).

Si **Visit** = encore `NOT_FOUND` → saute à l’étape 2 (Framework / Root / Output).

---

## 2) Réglages Build (cause fréquente de NOT_FOUND)

**Settings → General** (ou **Build & Development Settings**) :

| Champ | Valeur correcte |
|--------|------------------|
| Framework Preset | **Next.js** |
| Root Directory | **vide** (`.`) — pas de sous-dossier |
| Build Command | `npm run build` (ou défaut) |
| Output Directory | **VIDE** — ne mets surtout pas `out`, `dist`, `.next`, `build`, `public` |
| Install Command | `npm install` |

**Settings → Git** : **Production Branch** = **`main`**.  
Repo lié = **`yasser-nf/leuca-one`**.

Sauve → **Deployments** → ⋯ sur le dernier → **Redeploy** (uncheck “Use existing Build Cache” si possible).

---

## 3) Domaines

**Settings → Domains** :

1. Ajoute / vérifie **`leuca-stock.vercel.app`**.
2. Il doit pointer vers **Production**.
3. Attends ~1 min → ouvre https://leuca-stock.vercel.app/login

Si le domaine n’existe pas : **Add** → `leuca-stock.vercel.app`.

---

## 4) Variables d’environnement

**Settings → Environment Variables** — pour **Production** (et Preview) :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Puis **Redeploy** Production.

---

## 5) Protection (si écran login Vercel / SSO)

**Settings → Deployment Protection** → pour Preview (et Production si besoin) : **désactiver** Vercel Authentication / mettre **None**.

---

## 6) Si rien ne marche encore

Option nucléaire (5 min) :

1. **Add New → Project** → import encore **`yasser-nf/leuca-one`**, branche **`main`**.
2. Framework Next.js, Root vide, Output vide.
3. Colle les 2 env vars.
4. Deploy → ouvre l’URL `.vercel.app` fournie → **/login**.

(Tu peux supprimer/renommer l’ancien projet `leuca-stock` cassé ensuite.)

---

## Rappel

- Le code repo est OK — pas un bug « main vide ».
- `https://leuca-stock.vercel.app` = NOT_FOUND tant que Domaines / Production Branch / Output Directory sont faux.
- Après correction : **Redeploy**, puis **Visit** doit montrer **login Leuca**.
