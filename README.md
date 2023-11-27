BDD User V1

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants sur votre machine :

- Node.js
- npm (gestionnaire de paquets pour Node.js)
- MySQL (ou un autre système de gestion de base de données que vous utilisez)

## Installation

1. **Clonez le Référentiel**

    Téléchargez le projet en tant qu'archive ZIP et extrayez-le.

    ou Clonez le référentiel à l'aide de Git en ouvrant une fenêtre de terminal et en exécutant la commande suivante :

    ```bash
    git clone https://github.com/TomaTV/bdd-user-v1.git
    ```


3. **Accédez au Répertoire du Projet**

    ```bash
    cd chemin/vers/votre/projet
    ```

4. **Base de Données :**
   - Assurez-vous que votre serveur MySQL est en cours d'exécution.
   - Connectez-vous à votre serveur MySQL à l'aide d'un client SQL.
   - Exécutez le contenu du fichier SQL `bdd.sql` dans votre client SQL pour créer la base de données.

5. **Configuration de la Base de Données :**
   - Modifier le fichier `server.js` à la racine du projet.
   - Ajoutez les informations de connexion à votre base de données. Exemple :

    ```js
    host: 'localhost', //NE PAS TOUCHER SAUF SI SERVEUR
    user: 'root', //NE PAS TOUCHER SAUF SI SERVEUR OU USERNAME]
    password: '', //NE PAS TOUCHER SAUF SI SERVEUR OU PASSWORD
    database: 'votre_bdd_mysql',
    ```

    Remplacez `votre_bdd_mysql` par les informations d'identification de votre base de données.

6. **Exécution de l'Application :**
   - Assurez-vous que Node.js est installé sur votre machine.
   - Ouvrez une fenêtre de terminal dans le répertoire de votre projet.
   - Exécutez `npm i` pour installer les dépendances.
   - Ensuite, exécutez `node server.js` pour démarrer votre application.

7. **Accès à l'Application :**
   - Ouvrez votre navigateur et accédez à [http://localhost:3000](http://localhost:3000) pour voir votre application.

## Auteurs
[TOMA](https://github.com/TomaTV)
[MIT](https://choosealicense.com/licenses/mit/)
