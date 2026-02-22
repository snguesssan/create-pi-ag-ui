# Pi AG-UI — Guide de démarrage

> Donne un frontend web à un agent IA en 5 minutes.

Pi AG-UI est un template prêt à l'emploi qui connecte le [Pi coding agent](https://github.com/badlogic/pi-mono) à une interface web via le protocole [AG-UI](https://github.com/ag-ui-protocol/ag-ui) et [CopilotKit](https://copilotkit.ai).

Tu obtiens : un chat streaming, des outils exécutés dans le navigateur, du human-in-the-loop, un panneau d'état temps réel, et le support du raisonnement (thinking) — le tout dans une app Next.js.

<!-- Screenshot: https://github.com/samy-clivolt/pi-ag-ui -->

---

## Table des matières

1. [Prérequis](#1--prérequis)
2. [Créer un projet](#2--créer-un-projet)
3. [Configurer la clé API](#3--configurer-la-clé-api)
4. [Lancer](#4--lancer)
5. [Ce que tu obtiens](#5--ce-que-tu-obtiens)
6. [Personnaliser l'agent](#6--personnaliser-lagent)
7. [Ajouter des outils frontend](#7--ajouter-des-outils-frontend)
8. [Activer les fonctionnalités avancées](#8--activer-les-fonctionnalités-avancées)
9. [Mettre à jour le core](#9--mettre-à-jour-le-core)
10. [Architecture](#10--architecture)
11. [Dépannage](#11--dépannage)

---

## 1 — Prérequis

| Outil | Version | Vérifier |
|-------|---------|----------|
| **Node.js** | ≥ 18 | `node --version` |
| **npm** (ou pnpm/yarn/bun) | ≥ 9 | `npm --version` |
| **Clé API Anthropic** | — | [console.anthropic.com](https://console.anthropic.com/) |

### Configurer le registry (GitHub Packages)

Le package est hébergé sur GitHub Packages. Ajoute cette ligne à ton `~/.npmrc` :

```bash
# Remplace <TOKEN> par un GitHub Personal Access Token avec le scope read:packages
# Créer un token : https://github.com/settings/tokens/new (cocher read:packages)

@samy-clivolt:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<TOKEN>
```

> **Astuce** : Si tu ne veux pas toucher à ton `~/.npmrc` global, tu peux créer un `.npmrc` à la racine de ton projet après le scaffolding.

---

## 2 — Créer un projet

```bash
npx @snguesssan/create-pi-ag-ui my-app
```

Le CLI te demandera quel package manager utiliser (npm, pnpm, yarn ou bun), puis installera les dépendances automatiquement.

**Options** :

```bash
# Choisir pnpm directement
npx @snguesssan/create-pi-ag-ui my-app --pm pnpm

# Ne pas installer les dépendances (tu le feras toi-même)
npx @snguesssan/create-pi-ag-ui my-app --skip-install

# Aide
npx @snguesssan/create-pi-ag-ui --help
```

---

## 3 — Configurer la clé API

```bash
cd my-app
```

Ouvre `.env.local` (créé automatiquement depuis `.env.example`) et ajoute ta clé :

```env
ANTHROPIC_API_KEY=sk-ant-api03-...
```

C'est la seule variable obligatoire. Tout le reste a des valeurs par défaut.

---

## 4 — Lancer

```bash
npm run dev
```

Ouvre **http://localhost:3000**. Tu as un agent IA fonctionnel avec un chat, un panneau d'état, et des outils.

### Essaie ça tout de suite

Tape un de ces messages dans le chat :

| Message | Ce qui se passe |
|---------|----------------|
| `Show me a success notification` | L'agent appelle un outil frontend → notification inline dans le chat |
| `Switch to light theme` | L'agent bascule le thème → carte de confirmation inline |
| `Bookmark the AG-UI docs` | L'agent ajoute un bookmark → carte avec lien cliquable |
| `Ask me to confirm before proceeding` | Human-in-the-loop → boutons Confirm/Deny inline |
| `Copy this code: console.log('hello')` | L'agent copie dans le presse-papier → aperçu inline |

---

## 5 — Ce que tu obtiens

### Structure du projet

```
my-app/
├── src/
│   ├── app/
│   │   ├── api/copilotkit/route.ts   ← Route API : connecte le Pi agent au frontend
│   │   ├── page.tsx                  ← Page principale (chat + sidebar)
│   │   └── layout.tsx
│   ├── components/                   ← 🎨 Tes composants (modifie-les librement)
│   │   ├── ChatUI.tsx                  Chat principal
│   │   ├── FrontendTools.tsx           Outils que l'agent peut appeler
│   │   ├── ToolRenderers.tsx           Rendu visuel des appels d'outils
│   │   ├── AgentStatePanel.tsx         Panneau d'état (sidebar)
│   │   ├── ActivityPanel.tsx           Activités en cours
│   │   ├── ThinkingBlock.tsx           Indicateur de raisonnement
│   │   ├── ModelPicker.tsx             Sélecteur de modèle
│   │   └── ThreadSwitcher.tsx          Multi-conversations
│   └── lib/
│       └── agent-state-context.tsx     React context (état partagé agent ↔ UI)
├── .env.local                        ← Ta config locale
└── package.json
```

### Ce qui est inclus

| Fonctionnalité | Description |
|----------------|-------------|
| 💬 **Chat streaming** | Réponses en temps réel, mot par mot |
| 🛠️ **7 outils frontend** | theme, notification, bookmark, clipboard, URL, data table, model switch |
| 🎨 **Generative UI** | Cartes visuelles inline pour chaque outil |
| 🤝 **Human-in-the-loop** | Boutons confirm/deny et input inline (pas de `window.confirm`) |
| 🧠 **Raisonnement** | Bloc "Thinking..." collapsible avec le raisonnement du modèle |
| 📊 **Panneau d'état** | Status, timeline, activités, tokens estimés, coût |
| 🔀 **Multi-thread** | Plusieurs conversations isolées en parallèle |
| 📱 **Responsive** | Sidebar collapsible, mobile-friendly |
| 🔄 **Sélecteur de modèle** | Change de modèle à la volée via dropdown ou le chat |

---

## 6 — Personnaliser l'agent

### Changer le modèle

Dans `.env.local` :

```env
PI_MODEL=claude-sonnet-4-20250514
```

Ou via l'UI : utilise le dropdown "Model" dans la sidebar, ou dis à l'agent *"Switch to Claude Haiku"*.

Modèles supportés : tous ceux du [Pi SDK](https://github.com/badlogic/pi-mono) (Anthropic, OpenAI, etc.).

### Activer le raisonnement (thinking)

```env
PI_THINKING_LEVEL=medium   # off | minimal | low | medium | high | xhigh
```

Un bloc "🧠 Thinking..." apparaîtra dans le chat avec le raisonnement du modèle.

### Changer le titre de l'app

```env
NEXT_PUBLIC_APP_TITLE=Mon Agent IA
```

---

## 7 — Ajouter des outils frontend

Les outils frontend sont des fonctions que l'agent peut appeler et qui s'exécutent **dans le navigateur de l'utilisateur**. Ils sont définis dans `src/components/FrontendTools.tsx`.

### Étape 1 : Déclarer l'outil

Ajoute dans le composant `FrontendTools` :

```tsx
useCopilotAction({
  name: "showWeather",
  description: "Display the current weather for a city",
  parameters: [
    { name: "city", type: "string", description: "City name", required: true },
  ],
  handler: async ({ city }) => {
    // Ta logique ici — fetch API, calcul, DOM, etc.
    const res = await fetch(`https://wttr.in/${city}?format=3`);
    const weather = await res.text();
    return weather; // Le texte retourné est envoyé à l'agent
  },
});
```

C'est tout. L'outil est automatiquement :
1. Envoyé au modèle IA (qui décide quand l'appeler)
2. Exécuté dans le navigateur quand le modèle le demande
3. Le résultat est renvoyé à l'agent pour qu'il continue

### Étape 2 (optionnel) : Ajouter un rendu visuel

Dans `src/components/ToolRenderers.tsx`, ajoute un renderer pour afficher une carte inline dans le chat :

```tsx
useRenderToolCall({
  name: "showWeather",
  description: "Display weather",
  parameters: [
    { name: "city", type: "string" as const, description: "City", required: true },
  ],
  render: ({ args, status }) => (
    <ToolCard icon="🌤️" title="Weather" detail={(args as any).city} status={status} />
  ),
});
```

### Étape 3 (optionnel) : Partager de l'état avec l'agent

Tu peux exposer n'importe quelle donnée frontend à l'agent :

```tsx
useCopilotReadable({
  description: "User's current location",
  value: userLocation, // L'agent voit ça dans son contexte
});
```

---

## 8 — Activer les fonctionnalités avancées

Toutes ces options se configurent dans `.env.local` :

### Backend coding tools

Donne à l'agent la capacité de lire/écrire des fichiers et exécuter des commandes sur le serveur :

```env
ENABLE_CODING_TOOLS=true
PI_CWD=/chemin/vers/ton/projet   # Répertoire de travail
```

> ⚠️ **Attention** : l'agent peut exécuter des commandes shell. Utilise dans un environnement contrôlé.

### Persistance des sessions

Les conversations survivent aux redémarrages du serveur :

```env
ENABLE_SESSION_PERSISTENCE=true
# PI_SESSION_DIR=.pi-ag-ui-sessions   # (défaut)
```

### Extensions Pi

Charge des extensions Pi (outils supplémentaires, system prompts, etc.) :

```env
ENABLE_EXTENSIONS=true
# PI_AGENT_DIR=~/.pi/agent   # (défaut)
```

### Debug

```env
DEBUG_AGUI_EVENTS=true     # Log tous les événements AG-UI dans la console serveur
DEBUG_AGUI_METRICS=true    # Timing, compteurs, durée des outils
```

---

## 9 — Mettre à jour le core

Le cœur de la logique (bridge Pi → AG-UI, gestion des sessions, middleware) vit dans le package `@samy-clivolt/pi-ag-ui`. Tes composants UI sont dans ton projet et ne sont **pas** écrasés par les mises à jour.

```bash
npm update @samy-clivolt/pi-ag-ui
```

| Ce qui est mis à jour | Ce qui ne bouge pas |
|----------------------|---------------------|
| Bridge Pi → AG-UI events | Tes composants React |
| Gestion des sessions | Tes outils frontend |
| Middleware (logging, metrics) | Tes pages et routes |
| Utilitaires (types, token estimation) | Ton CSS et layout |

---

## 10 — Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Ton projet Next.js                           │
│                                                                     │
│  ┌─────────────────────────┐     ┌────────────────────────────────┐ │
│  │   Frontend (React)      │     │  API Route (/api/copilotkit)   │ │
│  │                         │     │                                │ │
│  │  Tes composants         │     │  @samy-clivolt/pi-ag-ui        │ │
│  │  ├─ ChatUI.tsx          │ SSE │  ├─ PiAgUiAgent               │ │
│  │  ├─ FrontendTools.tsx   │ ──► │  ├─ PiEventBridge             │ │
│  │  ├─ ToolRenderers.tsx   │ ◄── │  ├─ SessionStore              │ │
│  │  └─ AgentStatePanel.tsx │     │  └─ Pi SDK (LLM calls)        │ │
│  └─────────────────────────┘     └────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

**Flux :**
1. Tu tapes dans le chat → CopilotKit envoie la requête à `/api/copilotkit`
2. `PiAgUiAgent` crée/reprend une session Pi SDK et envoie le message au modèle
3. `PiEventBridge` traduit les événements Pi en événements AG-UI (SSE)
4. Le frontend reçoit les événements et met à jour le chat en temps réel
5. Si le modèle appelle un outil frontend → le bridge pause, CopilotKit exécute l'outil côté client, et le résultat est renvoyé au modèle

---

## 11 — Dépannage

### Le chat ne répond pas

```bash
# Vérifie que la clé API est configurée
cat .env.local | grep ANTHROPIC_API_KEY

# Vérifie les logs serveur dans le terminal (là où tourne npm run dev)
```

### `Module not found: @samy-clivolt/pi-ag-ui`

Le registry GitHub Packages n'est pas configuré. Ajoute à `~/.npmrc` :

```
@samy-clivolt:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<TON_GITHUB_TOKEN>
```

Puis relance `npm install`.

### `npm ERR! 401 Unauthorized` lors du install

Ton GitHub token n'a pas le scope `read:packages`. Recrée-le sur [github.com/settings/tokens/new](https://github.com/settings/tokens/new) avec ✅ `read:packages`.

### Le build échoue avec `Module not found: Can't resolve 'fs'`

Tu importes probablement `@samy-clivolt/pi-ag-ui` dans un composant client (`"use client"`). Utilise le sous-export pour les types :

```tsx
// ❌ Dans un composant client
import { AgentSharedState } from "@samy-clivolt/pi-ag-ui";

// ✅ Correct
import type { AgentSharedState } from "@samy-clivolt/pi-ag-ui/types";
import { EMPTY_RUN_METRICS } from "@samy-clivolt/pi-ag-ui/types";
```

La règle : `@samy-clivolt/pi-ag-ui` = server only, `@samy-clivolt/pi-ag-ui/types` = safe partout.

### L'agent ne voit pas mes outils frontend

Vérifie que le composant `<FrontendTools />` est rendu dans la page (il est inclus dans `page.tsx` par défaut). Les `useCopilotAction` doivent être appelés à l'intérieur de `<CopilotKit>`.

### Comment changer le system prompt de l'agent ?

Le system prompt est géré par le Pi SDK. Tu peux l'enrichir via :
- **Extensions** (`ENABLE_EXTENSIONS=true`) → ajoute des instructions dans `~/.pi/agent/extensions/`
- **`useCopilotReadable`** → expose du contexte que l'agent voit dans chaque requête

---

## Commandes utiles

```bash
npm run dev          # Serveur de dev (Turbopack, port 3000)
npm run build        # Build production
npm run typecheck    # Vérification TypeScript
npm run ci           # Pipeline complète (lint + typecheck + build)
```

Si [just](https://github.com/casey/just) est installé :

```bash
just dev             # = npm run dev
just build           # = npm run build
just verify          # = npm run ci
```

---

## Liens

- [AG-UI Protocol](https://github.com/ag-ui-protocol/ag-ui) — Le protocole de communication agent ↔ frontend
- [CopilotKit](https://docs.copilotkit.ai/) — Le framework React pour agents IA
- [Pi Coding Agent](https://github.com/badlogic/pi-mono) — Le SDK d'agent qui tourne côté serveur
- [Repo source](https://github.com/samy-clivolt/pi-ag-ui) — Code source et roadmap
