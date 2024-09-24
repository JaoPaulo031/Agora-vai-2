
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db'); // Arquivo db.js que gerencia o banco de dados

const app = express();

// Configura o Express para manipular dados de formulário
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Configura sessões de usuário
app.use(session({
    secret: 'chave-secreta',
    resave: false,
    saveUninitialized: false,
}));

// Rota para arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Página de Login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Autenticação de Usuário
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.getUserByUsername(username);

    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.userId = user.id;
        res.redirect('/'); // Redireciona para a página principal após login
    } else {
        res.send('Usuário ou senha incorretos');
    }
});

// Página Principal (após login)
app.get('/', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Salva Nota Fiscal no Banco de Dados
app.post('/save-invoice', (req, res) => {
    const { clientName, product, quantity, price } = req.body;
    const total = quantity * price;

    db.saveInvoice(clientName, product, quantity, price, total)
      .then(() => res.send('Nota fiscal salva com sucesso!'))
      .catch(err => res.status(500).send('Erro ao salvar a nota fiscal'));
});

// Desconectar o usuário
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Ensure server is correctly bound to the port for Vercel (without explicit port binding)
module.exports = app;
