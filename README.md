# PEA Dashboard

Dashboard fintech moderne pour analyser un portefeuille boursier (PEA, CTO, etc.) à partir d’un export CSV.

## Stack

- **React 18+** (React 19)
- **Vite** — build et dev server
- **TypeScript** (mode strict)
- **Tailwind CSS** — styles + thème dark
- **shadcn/ui** — composants (Card, Button, Table, Badge, etc.)
- **Recharts** — graphiques (pie, bar, allocation)
- **React Hook Form** + **Zod** — validation (prévu pour formulaires étendus)
- **PapaParse** — parsing CSV
- **Framer Motion** — animations
- **Biome** — lint et format

## Installation

```bash
# Cloner ou aller dans le projet
cd pea-dashboard

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

Build de production :

```bash
npm run build
npm run preview
```

Lint / format :

```bash
npm run lint       # Vérification Biome
npm run lint:fix   # Correction automatique
npm run format     # Format du code
```

## Format CSV attendu

Fichier CSV avec **séparateur point-virgule**. Format minimal :

```
name;isin;quantity;buyingPrice;lastPrice;amount;variation
```

Format étendu (ex. export PEA) :

```
name;isin;quantity;buyingPrice;lastPrice;intradayVariation;amount;amountVariation;variation;lastMovementDate;compensation
```

- **name** : nom du titre (guillemets acceptés)
- **isin** : code ISIN
- **quantity** : quantité (virgule ou point décimal)
- **buyingPrice** / **lastPrice** : prix (virgule ou point, espaces milliers acceptés)
- **amount** : valeur de la position (ex. `1 016,28`)
- **variation** : variation en %
- **amountVariation** (optionnel) : variation en €
- **lastMovementDate** (optionnel) : date du dernier mouvement

Les nombres au format français (virgule décimale, espace milliers) sont reconnus automatiquement.

Un fichier exemple est fourni : **`sample-portfolio.csv`**.

## Architecture (feature-based)

```
src/
├── components/       # Composants réutilisables
│   ├── layout/       # AppLayout (header, structure)
│   └── ui/          # shadcn (Button, Card, Table, Badge, etc.)
├── features/         # Fonctionnalités métier
│   ├── upload/       # Import CSV (CsvDropzone)
│   ├── portfolio/    # KPIs, tableau des positions
│   ├── analytics/   # Graphiques (Recharts)
│   └── insights/    # Analyse auto, score diversification
├── hooks/            # usePortfolio, useAnalytics, useInsights
├── lib/              # utils (cn, formatEur, etc.)
├── types/            # Types TypeScript (portfolio, analytics, insights)
├── utils/            # csvParser, csvSchema, sectorMapping, geoMapping, insightsCalculator
└── pages/            # DashboardPage
```

- **Données** : le CSV est parsé puis normalisé en positions typées ; les hooks dérivent KPIs, séries pour graphiques et insights.
- **UI** : une seule page (dashboard) avec upload, KPIs, graphiques, section « AI Portfolio Insights » et tableau des positions (tri, filtre).

## Fonctionnalités

1. **Import CSV**  
   Glisser-déposer ou sélection d’un fichier. Parsing robuste (PapaParse + Zod), gestion des erreurs et normalisation des en-têtes.

2. **Dashboard**  
   - KPIs : valeur totale, gain/perte € et %, plus grosse position, plus rentable.  
   - Graphiques : répartition par position, par secteur (estimé), par zone géographique (estimée), performance par position (barres).  
   - Tableau : positions triables et filtrables, mise en avant gains/pertes.

3. **AI Portfolio Insights**  
   - Score de diversification (0–100).  
   - Alertes : concentration (>25 %), surpondération sectorielle, redondance ETF (ex. Nasdaq + US Tech), exposition géographique.  
   - Recommandations courtes.

Secteurs et régions sont **estimés** à partir du nom et de l’ISIN (mapping interne). Pour un usage pro, brancher une source de données (Morningstar, etc.).

## Design

- Thème **dark** par défaut, style fintech (inspiration Stripe / Linear / Vercel).
- Cartes arrondies (`rounded-2xl`), ombres légères, glassmorphism discret sur le header.
- Transitions et micro-animations (Framer Motion), skeletons pendant le chargement.

## Licence

Projet à usage personnel / démo. Adapter selon vos besoins.
