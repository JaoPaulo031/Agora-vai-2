const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./database.db');

// Cria as tabelas de usuários e notas fiscais
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        clientName TEXT,
        product TEXT,
        quantity INTEGER,
        price REAL,
        total REAL
    )`);
});

// Função para cadastrar um novo usuário com senha criptografada
const createUser = (username, password) => {
    const hashedPassword = bcrypt.hashSync(password, 10);
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
            if (err) return reject(err);
            resolve();
        });
    });
};

// Função para buscar usuário pelo nome de usuário
const getUserByUsername = (username) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
};

// Função para salvar a nota fiscal
const saveInvoice = (clientName, product, quantity, price, total) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO invoices (clientName, product, quantity, price, total) VALUES (?, ?, ?, ?, ?)', 
            [clientName, product, quantity, price, total], function(err) {
            if (err) return reject(err);
            resolve();
        });
    });
};

module.exports = {
    createUser,
    getUserByUsername,
    saveInvoice
};