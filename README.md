# 🎯 TaskFlow

TaskFlow est une application complète de gestion de tâches inspirée des tableaux Kanban. 
Elle dispose d'un backend robuste en **Node.js/Express** et d'une interface moderne en **React/Vite** sur le thème de la jungle.

## 🛠 Prérequis

Prérequis logiciels requis :
- **Node.js** (v18 ou supérieur recommandé)
- **MongoDB** (en local ou via un cluster MongoDB Atlas)
- **Git**

---

## 🚀 Installation et Démarrage

### 1. Cloner le dépôt
```bash
git clone https://github.com/YcafardyDiginamic/TaskFlow.git
cd TaskFlow
```

### 2. Configuration du Backend (API)

Le backend est situé à la racine du projet pour ses dépendances (ou dans le dossier `back/src`).

**Installation des dépendances :**
```bash
# Depuis la racine du projet TaskFlow
npm install express mongoose dotenv cors helmet morgan bcryptjs jsonwebtoken cookie-parser express-validator swagger-ui-express swagger-jsdoc

# Dépendances de développement (tests et serveur local) :
npm install --save-dev jest supertest @jest/globals nodemon
```

**Variables d'environnement :**
Créez un fichier `.env` à la racine du projet (au même niveau que le `package.json`) et ajoutez-y la configuration suivante :

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/taskflow  # Remplacez par votre URI Atlas si besoin
JWT_ACCESS_SECRET=mon_super_secret_d_access
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=mon_super_secret_de_refresh
JWT_REFRESH_EXPIRES_IN=7d
```

**Démarrer le serveur de développement :**
```bash
npm run dev
```
Le serveur backend sera lancé sur `http://localhost:3000`.

### 3. Configuration du Frontend (React)

L'interface utilisateur se trouve dans le sous-dossier `front`.

**Installation des dépendances :**
```bash
cd front
npm install
```

**Démarrer l'application React :**
```bash
npm run dev
```
L'application web sera accessible sur `http://localhost:5173`.

---

## 📚 Documentation de l'API (Swagger)

Une fois le backend lancé, vous pouvez consulter et tester toutes les routes de l'API via l'interface interactive Swagger disponible ici :
👉 **http://localhost:3000/api-docs**

---

## 🧪 Tests Unitaires et d'Intégration

Le backend a été conçu en TDD (Test Driven Development) et possède une couverture de test complète via **Jest** et **Supertest**.

Pour lancer la suite de tests :
```bash
# Depuis la racine du projet
npm test
```