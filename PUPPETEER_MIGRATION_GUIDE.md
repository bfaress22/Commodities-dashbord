# Migration de l'API Ninja vers Puppeteer

## 🎯 Objectif

Cette migration remplace l'utilisation de l'API Ninja par Puppeteer pour éviter la consommation excessive de calls API et les limitations de quotas.

## 🔄 Changements Effectués

### 1. Nouveau Serveur de Scraping (`server.js`)
- **Serveur Express** qui utilise Puppeteer pour scraper les sites web
- **Port par défaut** : 3001
- **Routes API** compatibles avec l'ancienne interface

### 2. Service Puppeteer Mis à Jour (`src/services/puppeteerApi.ts`)
- Remplace les appels directs Puppeteer par des appels HTTP au serveur local
- Garde la même interface que l'ancien service

### 3. Service API Principal (`src/services/api.ts`)
- **Aucun changement** dans l'interface publique
- Utilise maintenant le serveur Puppeteer au lieu de l'API Ninja
- Garde toute la logique de parsing et de cache

## 🚀 Comment Utiliser

### Option 1 : Démarrage Manuel (Recommandé pour le développement)

1. **Démarrer le serveur de scraping** :
```bash
npm run server
```

2. **Dans un autre terminal, démarrer l'application React** :
```bash
npm run dev
```

### Option 2 : Démarrage Simultané

```bash
npm run dev:full
```

## 📋 Routes API Disponibles

Le serveur local expose les routes suivantes :

### Routes Génériques
- `GET /api/webscraper?url=<URL>` - Compatible avec l'ancienne API Ninja
- `GET /api/health` - Status du serveur

### Routes TradingView
- `GET /api/tradingview/category/:category` - Catégories de commodités
- `GET /api/tradingview/symbol/:symbol` - Symbole spécifique

### Routes Ship & Bunker
- `GET /api/shipandbunker?type=<TYPE>` - Prix des bunkers
- `GET /api/shipandbunker/emea` - Données Gibraltar

## ⚡ Avantages

1. **Pas de limite de calls API** - Plus de restrictions de quotas
2. **Performance améliorée** - Cache des instances de navigateur
3. **Interface identique** - Aucun changement dans l'application
4. **Ressources optimisées** - Bloque les images/CSS inutiles

## 🛠️ Configuration Puppeteer

Le serveur utilise une configuration optimisée :
- Mode headless activé
- Ressources non-essentielles bloquées
- Timeouts configurés
- Gestion automatique des instances de navigateur

## 🔧 Dépannage

### Le serveur ne démarre pas
```bash
# Installer les dépendances manquantes
npm install concurrently

# Vérifier si le port 3001 est libre
netstat -an | grep 3001
```

### Erreurs de connexion
- Vérifier que le serveur tourne sur `http://localhost:3001`
- Tester la route health : `GET http://localhost:3001/api/health`

### Performance lente
- Le premier scraping peut être lent (lancement du navigateur)
- Les suivants sont plus rapides grâce au cache d'instance

## 📝 Notes Techniques

1. **Cache de navigateur** : Une seule instance Puppeteer est réutilisée
2. **Nettoyage automatique** : Le navigateur se ferme proprement à l'arrêt
3. **Gestion d'erreurs** : Timeout et retry automatiques
4. **CORS activé** : Le serveur accepte les requêtes du frontend

## 🎯 Résultat

L'application fonctionne exactement comme avant, mais sans consommer de calls API Ninja. Le scraping est maintenant totalement autonome et gratuit. 