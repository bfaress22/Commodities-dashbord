# Guide de Déploiement Vercel avec Puppeteer

## 🚀 **Solution Implementée**

L'application utilise maintenant les **Vercel Functions** (API routes serverless) avec Puppeteer pour le scraping, compatible avec un déploiement 100% Vercel.

## 📁 **Structure des API Routes**

```
api/
├── health.js                    # Status des fonctions
├── webscraper.js               # Scraper générique 
├── tradingview/
│   ├── [category].js          # Catégories TradingView
│   └── symbol/[symbol].js     # Symboles TradingView
├── shipandbunker.js           # Ship & Bunker général
└── shipandbunker/
    └── emea.js                # Ship & Bunker EMEA
```

## 🛠️ **Configuration Technique**

### Dependencies Ajoutées
- `puppeteer-core`: Version légère de Puppeteer
- `@sparticuz/chromium`: Chromium optimisé pour serverless

### Configuration Vercel (`vercel.json`)
- **Timeout**: 30 secondes pour les fonctions
- **Région**: us-east-1 (optimal pour les performances)
- **Build**: Optimisé pour les fonctions serverless

## 📋 **Instructions de Déploiement**

### 1. **Préparation Locale**

```bash
# Installer Vercel CLI (si pas déjà fait)
npm i -g vercel

# Tester en local avec Vercel
npm run vercel-dev
```

### 2. **Premier Déploiement**

```bash
# Connexion à Vercel
vercel login

# Déploiement initial
vercel

# Répondre aux questions :
# - Set up and deploy? Yes
# - Which scope? [Votre compte]
# - Link to existing project? No
# - Project name? commodities-dashboard (ou autre)
# - Directory? ./
```

### 3. **Déploiements Suivants**

```bash
# Déploiement de production
vercel --prod

# Ou déploiement preview
vercel
```

## ⚡ **Fonctionnement**

### **En Développement**
- Vite dev server: `http://localhost:3000`
- API Functions: `http://localhost:3000/api/*`
- Tests disponibles: `npm run vercel-dev`

### **En Production**
- Application: `https://votre-app.vercel.app`
- API Functions: `https://votre-app.vercel.app/api/*`
- Auto-scaling et cold starts optimisés

## 🔄 **System de Fallback**

L'application utilise un système intelligent :

1. **Premier choix**: Vercel Functions avec Puppeteer
2. **Fallback automatique**: API Ninja si Puppeteer échoue
3. **Transparent**: Aucun changement visible pour l'utilisateur

## 📊 **Routes API Disponibles**

### **Health Check**
```
GET /api/health
```

### **Scraping Générique**
```
GET /api/webscraper?url=<URL>
```

### **TradingView**
```
GET /api/tradingview/metals
GET /api/tradingview/agricultural
GET /api/tradingview/energy
GET /api/tradingview/freight
GET /api/tradingview/bunker
GET /api/tradingview/symbol/CS11!
```

### **Ship & Bunker**
```
GET /api/shipandbunker
GET /api/shipandbunker?type=vlsfo
GET /api/shipandbunker/emea
```

## 🔧 **Optimisations Serverless**

### **Performance**
- Chromium optimisé pour les fonctions serverless
- Timeout adapté (30s) pour le scraping
- Région proche des sources de données

### **Coûts**
- Pay-per-use: Coût uniquement lors des requêtes
- Auto-scaling: Pas de serveur persistant
- Pas de limite de calls API externes

## ✅ **Avantages de cette Solution**

1. **100% Compatible Vercel** - Fonctionne parfaitement sur Vercel
2. **Puppeteer Inclus** - Scraping autonome sans API externe
3. **Fallback Robuste** - API Ninja en backup si nécessaire
4. **Performance** - Functions serverless rapides
5. **Économique** - Pay-per-use, pas de serveur persistant
6. **Scalable** - Auto-scaling selon la demande

## 🚨 **Points d'Attention**

### **Cold Starts**
- Première requête peut être plus lente (1-3s)
- Les suivantes sont rapides grâce au cache Vercel

### **Timeouts**
- Maximum 30s par fonction (configuré dans vercel.json)
- Suffisant pour la plupart des scrapings

### **Mémoire**
- Chromium utilise ~150MB par instance
- Vercel alloue automatiquement les ressources

## 🎯 **Résultat Final**

✅ **Application déployée sur Vercel**  
✅ **Puppeteer intégré et fonctionnel**  
✅ **Scraping sans limites d'API**  
✅ **Système de fallback robuste**  
✅ **Interface utilisateur identique**  
✅ **Performance optimisée**  

L'application fonctionne exactement comme avant, mais est maintenant **100% compatible Vercel** avec **Puppeteer intégré** ! 