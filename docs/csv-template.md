# Import CSV — modèles Leuca

Téléchargez aussi le fichier depuis **Plus → Import CSV** dans l’app.

## Colonnes (ordre libre, en-têtes exacts)

| Colonne | Obligatoire | Notes |
|---------|-------------|-------|
| `name` | oui | Nom commercial |
| `supplier_name` | oui | Créé s’il n’existe pas |
| `category` | oui | `Soleil` \| `Optique` \| `Clip-on` \| `Accessoire` |
| `colors` | oui | Séparées par virgule |
| `unit_price_cny` | oui | > 0 |
| `unit_weight_g` | oui | > 0 |
| `moq` | oui | > 0 |
| `gender` | non | Homme, Femme, Unisexe, Enfant |
| `frame_shape` | non | |
| `frame_material` | non | |
| `lens_type` | non | |
| `size_mm` | non | ex. 52-18-145 |
| `unit_price_usd` | non | Affichage seul |
| `packaging` | non | |
| `retail_price_dzd` | non | |
| `min_stock_alert` | non | défaut 3 |
| `supplier_ref` | non | |
| `status` | non | Actif / À recommander / Arrêté |
| `notes` | non | |

## Exemple

```csv
name,supplier_name,category,gender,frame_shape,frame_material,lens_type,colors,size_mm,unit_price_cny,unit_price_usd,unit_weight_g,moq,packaging,retail_price_dzd,min_stock_alert,supplier_ref,status,notes
Lunettes soleil noir,Wenzhou Optics,Soleil,Unisexe,Aviateur,Métal,UV400,"Noir,Écaille",52-18-145,45,,85,12,Étui+chiffon,4500,3,REF-001,Actif,
```

Les photos ne sont pas dans le CSV : un placeholder est attaché ; remplacez-les dans la fiche produit.
