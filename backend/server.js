import Fastify from 'fastify';
import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

const DB_DIR = './data';
const DB_FILE = path.join(DB_DIR, 'transcendence.db');

const HASH_SALT_ROUNDS = 10;

const fastify = Fastify({ logger: true });

let db;

const startServer = async () => {
    try {
        if (!fs.existsSync(DB_DIR)) {
            fs.mkdirSync(DB_DIR, { recursive: true });
            fastify.log.info(`Created database directory: ${DB_DIR}`);
        }
        db = new Database(DB_FILE);
        fastify.log.info(`Database connected to ${DB_FILE}`);
        db.exec(`
            CREATE TABLE IF NOT EXISTS players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT UNIQUE,
                hashed_password TEXT NOT NULL,
                score INTEGER DEFAULT 0,
                last_login DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        fastify.log.info('Table "players" checked/created with auth fields.');
        fastify.decorate('db', db);

        fastify.post('/auth/signup', async (request, reply) => {
            const { username, email, password } = request.body;

            if (!username || !email || !password) {
                return reply.code(400).send({ message: 'Missing username, email, or password.' });
            }

            try {
                const hashedPassword = await bcrypt.hash(password, HASH_SALT_ROUNDS);

                const stmt = fastify.db.prepare(
                    'INSERT INTO players (username, email, hashed_password) VALUES (?, ?, ?)'
                );
                const result = stmt.run(username, email, hashedPassword);
                
                return reply.code(201).send({ 
                    id: result.lastInsertRowid, 
                    username: username, 
                    message: 'Player registered successfully.' 
                });

            } catch (e) {
                if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                    return reply.code(409).send({ message: 'Username or email already in use.' });
                }
                fastify.log.error('Signup error:', e);
                return reply.code(500).send({ message: 'Internal server error during registration.' });
            }
        });

        //(à implémenter ajout de la route de connexion plus tard)
        fastify.post('/auth/login', async (request, reply) => {
            return reply.code(501).send({ message: 'Login route is not yet implemented.' });
        });

        fastify.get('/', async (request, reply) => {
            return { status: 'OK', framework: 'Fastify', message: 'Backend is running!' };
        });
        fastify.get('/player/:username', async (request, reply) => {
            const { username } = request.params;
            
            const topPlayers = fastify.db.prepare('SELECT id, username, score FROM players ORDER BY score DESC LIMIT 5').all();
            
            const player = fastify.db.prepare('SELECT id, username, score FROM players WHERE username = ?').get(username);


            return {
                message: "Test route (CRUD) updated. Use /auth/signup for registration.",
                player_data: player || { message: "Player not found. Use /auth/signup." },
                top_5_leaderboard: topPlayers
            };
        });


        // START SERVER
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        fastify.log.info(`Server listening on port ${fastify.server.address().port} (internal). Accessible on http://localhost:3001/`);

    } catch (err) {
        fastify.log.error('FATAL ERROR DURING STARTUP: ' + (err.stack || err.message));
        if (db) db.close();
        process.exit(1);
    }
};

//STOP SERVER PROPRE control-c
process.on('SIGINT', () => {
    fastify.log.info('Received SIGINT. Closing DB connection...');
    if (db) db.close();
    process.exit(0);
});

startServer();

