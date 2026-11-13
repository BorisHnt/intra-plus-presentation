# Intra+ — Site public

> L'accueil affiche temporairement le suivi de développement d'Intra+ 2.0.
> L'ancien showroom, ses pages et ses captures restent conservés dans le dépôt
> pendant le chantier.

La page publique présente l'avancement global, les modules en cours, la
pipeline de livraison et l'estimation de disponibilité de la Beta 2.0.

Les pourcentages se mettent à jour dans `index.html` en modifiant simplement
les attributs `data-progress` et les valeurs visibles associées.

## Démarrage rapide

1) Cloner le dépôt
```bash
git clone <url-du-repo>
cd intra-plus-presentation
```

2) Ouvrir en local
- Ouvrez `index.html` dans votre navigateur.

3) Déployer sur GitHub Pages
- Poussez le code sur GitHub.
- Dans les paramètres du repo, activez GitHub Pages sur la branche `main` (root).
- Votre site sera disponible à l'URL fournie par GitHub.

## Palette de couleurs
- Rose : `rgb(243,112,178)`
- Violet : `rgb(171,159,248)`
- Bleu : `#0e2957`
- Anthracite : `#1a1a1a`

## Structure des fichiers
```
.
├── README.md
├── index.html
├── styles/
│   └── style.css
├── scripts/
│   └── main.js
└── assets/
    ├── logo.png
    └── logo.svg
```

## Notes
- Aucun framework ni dépendance externe.
- Animations CSS + IntersectionObserver pour les reveals.
- `logo.png` est généré à partir de `assets/logo.svg`.
