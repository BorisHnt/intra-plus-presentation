# 42+ Extension — Site vitrine

Site vitrine moderne et responsive pour présenter l'extension 42+. Il inclut un écran d'accueil animé, une transition fluide vers la page principale et des sections features/showroom/FAQ.

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
