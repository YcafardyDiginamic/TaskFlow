# Document d'Architecture Technique (DAT) - TaskFlow

TaskFlow est une application complète de gestion de tâches inspirée des tableaux Kanban, disposant d'un backend robuste en **Node.js/Express** et d'une interface moderne en **React/Vite** sur le thème de la jungle.

---

## 1. Choix techniques

L'application repose sur une stack **MERN** modernisée :
- **Backend :** Node.js avec le framework Express.js.
- **Frontend :** React.js propulsé par Vite pour une compilation ultra-rapide. Axios est utilisé pour les requêtes HTTP.
- **Base de données :** MongoDB (utilisable en local ou via Atlas), avec l'ODM Mongoose pour la modélisation.
- **Outils de test (TDD) :** Jest pour l'exécution des tests et le mocking, Supertest pour tester les API HTTP.
- **Documentation :** Swagger (OpenAPI) via `swagger-ui-express` et `swagger-jsdoc`.
- **Utilitaires :** `morgan` pour le logging des requêtes, `dotenv` pour les variables d'environnement.

---

## 2. Architecture système

L'architecture système repose sur un modèle Client-Serveur standard avec une séparation stricte :

1. **Client (Navigateur) :** Application SPA (Single Page Application) tournant sur le port `5173`.
2. **Serveur API (Node.js) :** Expose une API RESTful sur le port `3000`. Il gère la logique métier, l'authentification et les échanges avec la base de données.
3. **Base de données (MongoDB) :** Stocke les collections de manière persistante (port `27017` par défaut).

**Communication :** 
Les échanges se font en JSON via le protocole HTTP/REST. Le partage de ressources cross-origin (CORS) est strictement configuré sur le backend pour n'accepter que les requêtes provenant de `http://localhost:5173` avec le support des _credentials_ (indispensable pour les cookies).

---

## 3. Architecture logicielle

Le backend suit le pattern d'architecture en couches **MVC / N-Tiers** pour garantir une séparation claire des responsabilités :

- **Routes (`/routes`) :** Définissent les points d'entrée de l'API (ex: `categoryRoutes.js`, `taskRoutes.js`) et intègrent la documentation Swagger.
- **Middlewares (`/middlewares`) :** Interceptent les requêtes pour l'authentification (`authMiddleware`), le logging, ou le parsing.
- **Validateurs (`/validators`) :** Couche de validation des données entrantes (ex: `validateCreateCategory`) basée sur `express-validator`.
- **Contrôleurs (`/controllers`) :** Gèrent les requêtes HTTP, extraient les paramètres et formatent les réponses (ex: `TaskController`).
- **Services (`/services`) :** Contiennent la logique métier complexe et interagissent avec les modèles de la base de données (ex: `TaskService`).
- **Modèles (Mongoose) :** Définissent les schémas de données MongoDB.

Le frontend centralise les appels API via un client HTTP configuré (`api/client.js`) appliquant le pattern d'**Intercepteur**.

---

## 4. Pratiques Techniques TDD (Test Driven Development)

Le projet adopte une approche de développement dirigé par les tests, garantissant la fiabilité de l'API :

- **Isolation des tests de base de données :** Utilisation du script `db.setup.js` qui crée une base de données MongoDB isolée par _worker_ Jest (via la variable `JEST_WORKER_ID`). Cela permet d'exécuter les tests en parallèle sans collision de données. Des hooks permettent de vider (`clearDatabase`) et fermer (`closeDatabase`) les connexions.
- **Tests unitaires des contrôleurs :** Le fichier `task.controller.test.js` démontre l'isolation du contrôleur en simulant (mocking) totalement le `TaskService`. Les objets `req` et `res` d'Express sont également mockés pour vérifier les bons appels aux méthodes `status()`, `json()`, et `send()`.
- **Couverture des cas :** Les tests vérifient à la fois les "Happy Paths" (201 Created, 200 OK, 204 No Content) et les cas d'erreur (400 Bad Request, 404 Not Found, 500 Internal Error).

---

## 5. Conception modélisation (Schéma MongoDB)

D'après la documentation OpenAPI et les tests, la base de données s'articule autour des collections suivantes :

- **Users :** (Déduit) Stocke les informations d'authentification (`_id`, identifiants, hash du mot de passe).
- **Tasks :** 
  - `_id` : ObjectId
  - `title` : String (Obligatoire)
  - `status` : String (ex: 'todo', 'done')
  - `userId` : ObjectId (Référence à l'utilisateur propriétaire)
- **Categories :**
  - `_id` : ObjectId
  - `name` : String (Obligatoire, ex: "Projet de Fin d'Étude")
  - `color` : String (ex: "#FF5733")
  - `userId` : ObjectId (Référence à l'utilisateur)

---

## 6. Développement Back-end (API REST - Routes - Middlewares)

Le serveur Express (`app.js`) est configuré avec plusieurs middlewares globaux :
- `express.json()` pour parser le corps des requêtes en JSON.
- `cookieParser()` pour lire les cookies sécurisés.
- `cors()` pour sécuriser les origines.
- `morgan('dev')` pour le monitoring HTTP dans la console.

**Routage :**
- **Routes Publiques :** `/api/auth` (connexion, refresh) et `/api/users` (inscription).
- **Routes Protégées :** `/api/tasks` et `/api/categories`. Ces routes nécessitent de passer par le middleware `authMiddleware`.

L'API suit scrupuleusement les conventions REST (POST pour la création, GET pour la lecture, PUT pour la modification complète, DELETE pour la suppression).

---

## 7. Sécurité (Authentification JWT - Validation des données - Mots de passe)

La sécurité est implémentée sur plusieurs niveaux de l'application :

- **Authentification JWT à deux niveaux :** 
  - Un **Access Token** (durée de vie courte, ex: 15m) est envoyé par le client via le header HTTP `Authorization: Bearer <token>`.
  - Un **Refresh Token** (durée de vie longue, ex: 7j) est stocké et transmis via un **Cookie sécurisé (`httpOnly`)**. Cela empêche le vol du Refresh Token via des failles XSS côté client.
- **Mots de passe :** Hachage robuste des mots de passe en base de données à l'aide de la librairie `bcryptjs` (présente dans les dépendances).
- **Validation des données :** Avant d'atteindre le contrôleur, les requêtes traversent des middlewares de validation (`express-validator`) comme `validateCreateCategory` pour éviter l'injection de données malveillantes ou incomplètes.
- **Protection globale :** Utilisation de `helmet` (selon les dépendances) pour sécuriser les en-têtes HTTP renvoyés par Express.

---

## 8. Interface Front-end

L'interface développée en **React / Vite** propose une expérience utilisateur fluide (SPA) respectant un thème visuel "jungle".

**Intégration API & Axios Interceptors :**
La communication avec le backend est centralisée dans `src/api/client.js`. 
- **Injection du Token :** Un intercepteur de requêtes ajoute automatiquement l'Access Token (stocké en `localStorage`) dans le header `Authorization` de chaque requête.
- **Gestion du Refresh Token (Transparente) :** Un intercepteur de réponses écoute les erreurs `401 Unauthorized`. Si l'Access Token est expiré, le client React met en pause la requête initiale, appelle silencieusement `/api/auth/refresh` (le cookie contenant le Refresh Token est envoyé automatiquement grâce à `withCredentials: true`), sauvegarde le nouveau token, puis rejoue la requête initiale.

**Pages et Dashboard :**
- **Pages Publiques :** Login et Inscription. Redirection automatique si le Refresh Token est définitivement expiré.
- **Dashboard (Tableau Kanban) :** Vue principale de l'application protégée, permettant de visualiser les tâches par statut (`todo`, `done`, etc.) et de les associer à des catégories de couleur.

---

## 9. Difficultés rencontrées et solutions apportées

### Difficulté 1 : L'expérience utilisateur face à l'expiration du Token JWT
**Problème :** Avec un `Access Token` expirant très vite (15 minutes) pour des raisons de sécurité, l'utilisateur était fréquemment déconnecté en plein milieu de son utilisation.
**Solution :** Mise en place d'une architecture à double token (Access + Refresh). L'intercepteur Axios côté Front-end a été configuré pour attraper l'erreur HTTP 401, déclencher la route `/auth/refresh` via les cookies `httpOnly`, et rejouer la requête ayant échoué. Cela rend le renouvellement totalement transparent pour l'utilisateur.

### Difficulté 2 : Isolations des données lors des tests parallèles
**Problème :** Lors du lancement de la suite de tests en TDD avec Jest, les workers exécutant les tests en parallèle altéraient mutuellement la base de données, causant des "false negatives" aléatoires.
**Solution :** Dans `db.setup.js`, l'URI de connexion à MongoDB a été dynamisée en utilisant la variable d'environnement `process.env.JEST_WORKER_ID`. Ainsi, chaque processus de test dispose de sa propre base de données isolée (ex: `taskflow_test_1`, `taskflow_test_2`).

### Difficulté 3 : Échange de Cookies avec les requêtes CORS
**Problème :** Le Refresh Token stocké dans un cookie sécurisé n'était pas envoyé par Axios lors de l'appel depuis le domaine du frontend (`localhost:5173`) vers l'API (`localhost:3000`).
**Solution :** Configuration stricte de la politique CORS sur Express pour autoriser spécifiquement l'origine du Front-end en ajoutant l'option `credentials: true`. Côté client, l'instance Axios a été configurée avec `withCredentials: true`.