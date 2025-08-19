// app.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('./database/db');

const app = express();
const PORT = 3000;

// Konfigurasi EJS dan direktori views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // Untuk parsing JSON

// Middleware untuk menangani metode PUT dan DELETE dari form
app.use((req, res, next) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        const method = req.body._method;
        delete req.body._method;
        req.method = method.toUpperCase();
    }
    next();
});

// GET / (Halaman Utama - Daftar Buku)
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM books ORDER BY created_at DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Terjadi kesalahan pada server.');
        }
        res.render('index', { books: results });
    });
});

// GET /add (Formulir Tambah Buku)
app.get('/add', (req, res) => {
    res.render('form', { book: null, pageTitle: 'Tambah Buku' });
});

// GET /edit/:id (Formulir Edit Buku)
app.get('/edit/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM books WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).send('Buku tidak ditemukan.');
        }
        res.render('form', { book: results[0], pageTitle: 'Edit Buku' });
    });
});

// POST /books (Tambah Buku)
app.post('/books', (req, res) => {
    const { title, author, year, isbn, category, status } = req.body;
    const book = {
        uuid: uuidv4(),
        title,
        author,
        year,
        isbn,
        category,
        status,
        created_at: new Date(),
        updated_at: new Date()
    };
    const sql = 'INSERT INTO books SET ?';
    db.query(sql, book, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Gagal menambahkan buku.');
        }
        res.redirect('/');
    });
});

// PUT /books/:id (Edit/Update Buku)
app.put('/books/:id', (req, res) => {
    const { id } = req.params;
    const { title, author, year, isbn, category, status } = req.body;
    const updatedBook = {
        title,
        author,
        year,
        isbn,
        category,
        status,
        updated_at: new Date()
    };
    const sql = 'UPDATE books SET ? WHERE id = ?';
    db.query(sql, [updatedBook, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Gagal mengupdate buku.');
        }
        res.redirect('/');
    });
});

// DELETE /books/:id (Hapus Buku)
app.delete('/books/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM books WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Gagal menghapus buku.');
        }
        res.redirect('/');
    });
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});