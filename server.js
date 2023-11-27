const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public'), { 'X-Content-Type-Options': false }));

// Configuration de la connexion à la base de données
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'wsftoma',
});

// Fonction de redirection vers la page de login
const redirectToLogin = (res, error) => res.redirect(error ? `/login?error=${error}` : '/login');

// Définir EJS comme moteur de vue
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));

// Middleware de session
app.use(session({ secret: 'wsftoma', resave: true, saveUninitialized: true, cookie: { secure: process.env.NODE_ENV === 'production', sameSite: 'None', }, }));

// Middleware d'authentification
const authenticate = (req, res, next) => {
  if (req.session.authenticated) {
    return next();
  } else {
    redirectToLogin(res);
  }
};

// Page de back-office
app.get('/back', authenticate, async (req, res) => {
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const projects = await pool.execute('SELECT * FROM projet');
  res.render('back', { projects: projects[0], requireAuthentication: req.session.authenticated });
});

// Page de Settings
app.get('/settings', authenticate, (req, res) => {
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.render('settings', { requireAuthentication: req.session.authenticated });
});

// Ajoutez cette route après vos autres routes
app.get('/projet/:title', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM projet WHERE title = ?', [req.params.title]);

    if (rows.length > 0) {
      const project = rows[0];
      res.render('projet', { project });
    } else {
      res.status(404).send('Projet non trouvé');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du projet depuis la base de données :', error);
    res.status(500).send('Erreur serveur');
  }
});

// Ajouter une route pour gérer la soumission du formulaire de projet
app.post('/submitProject', async (req, res) => {
  const { title, description, image } = req.body;

  if (!title || !description || !image) {
      return res.status(400).send('Invalid project details');
  }

  try {
      // Insérez les détails du projet dans la table 'projet'
      await pool.execute('INSERT INTO projet (title, description, image) VALUES (?, ?, ?)', [title, description, image]);
      res.redirect('/back?authenticated=true');
  } catch (error) {
      console.error('Error during project submission:', error);
      res.status(500).send('Server error');
  }
});

app.post('/editProject', async (req, res) => {
    const { editTitle, newTitle, newDescription, newImage } = req.body;

    if (!editTitle || !newTitle || !newDescription || !newImage) {
        return res.status(400).send('Invalid project details');
    }

    try {
        // Mettez à jour les détails du projet dans la table 'projet'
        await pool.execute('UPDATE projet SET title = ?, description = ?, image = ? WHERE title = ?', [newTitle, newDescription, newImage, editTitle]);
        res.redirect('/back?authenticated=true');
    } catch (error) {
        console.error('Erreur lors de la modification du projet:', error);
        res.status(500).send('Erreur serveur');
    }
});

app.post('/deleteProject', async (req, res) => {
    const deleteTitle = req.body.deleteTitle;

    if (!deleteTitle) {
        return res.status(400).send('Invalid project title');
    }

    try {
        // Supprimer le projet de la table 'projet'
        await pool.execute('DELETE FROM projet WHERE title = ?', [deleteTitle]);
        res.redirect('/back?authenticated=true');
    } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error);
        res.status(500).send('Erreur serveur');
    }
});

app.post('/updateUsername', authenticate, async (req, res) => {
  const newUsername = req.body.newUsername;

  if (!newUsername) {
      return res.status(400).send('Invalid username');
  }

  try {
      // Mettez à jour le nom d'utilisateur dans la base de données
      await pool.execute('UPDATE users SET username = ? WHERE id = ?', [newUsername, req.session.userId]);
      res.redirect('/settings?authenticated=true');
  } catch (error) {
      console.error('Erreur lors de la modification du nom d\'utilisateur:', error);
      res.status(500).send('Erreur serveur');
  }
});

// Route pour mettre à jour le mot de passe
app.post('/updatePassword', authenticate, async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword !== confirmNewPassword) {
      return res.status(400).send('Invalid password details');
  }

  try {
      // Vérifiez le mot de passe actuel
      const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.session.userId]);

      if (rows.length > 0 && (await bcrypt.compare(currentPassword, rows[0].password))) {
          // Mettez à jour le mot de passe dans la base de données
          const hashedNewPassword = await bcrypt.hash(newPassword, 10);
          await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, req.session.userId]);
          res.redirect('/settings?authenticated=true');
      } else {
          return res.status(401).send('Invalid current password');
      }
  } catch (error) {
      console.error('Erreur lors de la modification du mot de passe:', error);
      res.status(500).send('Erreur serveur');
  }
});

// Déconnexion
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Authentification
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.execute('SELECT id, password FROM users WHERE LOWER(username) = LOWER(?)', [username]);

    if (rows.length > 0 && (await bcrypt.compare(password, rows[0].password))) {
      req.session.authenticated = true;
      req.session.userId = rows[0].id; // Stocke l'ID de l'utilisateur dans la session
      res.redirect('/back?authenticated=true');
    } else {
      redirectToLogin(res, 'invalid');
    }
  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).send('Server error');
  }
});

// Redirection vers la page d'accueil
app.get('/', (_, res) => res.redirect('/home'));

// Page de login
app.get('/login', (_, res) => 
  res.sendFile(path.join(__dirname, 'public', 'login.html')
));

// Page de paramètres
app.get('/settings', (_, res) => 
  res.sendFile(path.join(__dirname, 'public', 'settings.ejs')
));

// Page d'accueil
app.get('/home', async (req, res) => {
  try {
      const [rows] = await pool.execute('SELECT * FROM projet');
      const projects = rows.map(row => ({
          title: row.title,
          description: row.description,
          image: row.image,
      }));

      res.render('home', { projects });
  } catch (error) {
      console.error('[ERREUR] Impossible de charger les projets');
      res.status(500).send('Server error');
  }
});

// Page d'inscription
app.get('/register', (_, res) => 
  res.sendFile(path.join(__dirname, 'public', 'register.html')
));

// Traitement de l'inscription
app.post('/register', async (req, res) => {
  const { username, email, password, confirm_password } = req.body;

  if (!username || !email || !password || password !== confirm_password) {
    return res.status(400).send('[INSCRIPTION] Erreur');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
    res.redirect('/login');
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send('Server error');
  }
});

// Ouverture du serveur sur le port 3000
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));