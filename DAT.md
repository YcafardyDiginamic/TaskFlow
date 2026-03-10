# Dossier d'Architecture Technique (DAT)
**Projet :** Outil centralisé de gestion de tâches
**Version :** 1.0

---

## 1. Introduction et Contexte
Ce document définit l'architecture technique de l'application de gestion de tâches. Il s'adresse aux développeurs et acteurs techniques du projet. 
Le système vise à fournir une interface sécurisée permettant à différents profils (étudiants, développeurs, chefs de projet) d'organiser leurs activités quotidiennes via des catégories et des indicateurs de progression.

## 2. Architecture Système
Le choix a été fait de partir sur une **Architecture Monolithique**. 
L'ensemble du code back-end (API, logique métier, accès aux données) sera contenu et déployé dans une seule et même base de code. Ce choix permet :
- Un déploiement simplifié.
- Des tests de bout en bout plus faciles à mettre en place.
- Des performances optimales (pas de latence réseau entre différents services internes).

## 3. Architecture Logicielle
L'API REST constituant la partie la plus imposante du système, l'application suit une **Architecture en Couches (Layered Architecture)** pour garantir la maintenabilité et la séparation des responsabilités. 

L'API est structurée autour de 3 couches principales :
1. **Couche de Présentation / Routeurs (Controllers) :** Gère la réception des requêtes HTTP REST, la validation des entrées et l'envoi des réponses JSON.
2. **Couche Métier (Services) :** Contient toute la logique applicative (ex: calculs des statistiques du tableau de bord, règles de gestion des statuts).
3. **Couche d'Accès aux Données (Models) :** Gère les requêtes directes vers la base de données.

## 4. Choix Techniques (Stack)
*(Note : Cette section sera enrichie de manière itérative au fur et à mesure de l'avancement et de l'implémentation du projet).*

### 4.1. Back-end
- **Technologie :** Node.js + Express
- **Justification :** Permet la création d'une API REST légère et performante, avec un écosystème JavaScript riche.

### 4.2. Base de données
- **Technologie :** [MySQL / MongoDB - À définir]
- **Justification :** [À compléter ultérieurement selon les besoins de flexibilité (documents) ou de rigidité relationnelle (SQL)].

### 4.3. Sécurité et Authentification
- **Mécanisme :** JWT (JSON Web Token)
- **Justification :** Permet une authentification stateless (sans état), idéale pour une API REST.
- **Hachage des mots de passe :** bcrypt
- **Justification :** Algorithme de hachage sécurisé intégrant un sel (salt) pour contrer les attaques par force brute ou tables arc-en-ciel.

## 5. Modélisation des Données
*(Cette section accueillera les schémas de base de données (MLD ou structure des collections JSON) une fois le choix de la base arrêté).*

## 6. Infrastructure et Déploiement
*(À compléter lors des phases de mise en production).*