// Carica le variabili d'ambiente dal file .env.
import "dotenv/config";

// Importa il client generato da Prisma.
import { PrismaClient } from "@prisma/client";

// Importa l'adapter che collega Prisma Client al driver MariaDB/MySQL.
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// Crea l'adapter usando i parametri di connessione definiti nel file .env.
const adapter = new PrismaMariaDb({
    // Indirizzo del server MySQL.
    host: process.env.DATABASE_HOST,

    // Converte la porta da stringa di ambiente a numero JavaScript.
    port: Number(process.env.DATABASE_PORT),

    // Utente MySQL dell'applicazione.
    user: process.env.DATABASE_USER,

    // Password dell'utente MySQL dell'applicazione.
    password: process.env.DATABASE_PASSWORD,

    // Nome del database a cui collegarsi.
    database: process.env.DATABASE_NAME,

    // Numero massimo di connessioni che il pool può mantenere aperte.
    connectionLimit: 5
});

// Crea Prisma Client configurandolo con l'adapter MySQL/MariaDB.
export const client = new PrismaClient({ adapter });