const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function initDB() {
    await sql`
        CREATE TABLE IF NOT EXISTS contacts (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            email VARCHAR(254) NOT NULL,
            message TEXT NOT NULL,
            ip_address VARCHAR(45) NOT NULL,
            is_read BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS project_views (
            id SERIAL PRIMARY KEY,
            project_id VARCHAR(20) UNIQUE NOT NULL,
            views INTEGER DEFAULT 0,
            last_viewed TIMESTAMPTZ DEFAULT NOW()
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS project_likes (
            id SERIAL PRIMARY KEY,
            project_id VARCHAR(20) UNIQUE NOT NULL,
            likes INTEGER DEFAULT 0,
            last_liked TIMESTAMPTZ DEFAULT NOW()
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            email VARCHAR(254) UNIQUE NOT NULL,
            password VARCHAR(128) NOT NULL,
            role VARCHAR(10) DEFAULT 'user',
            is_active BOOLEAN DEFAULT true,
            last_login TIMESTAMPTZ,
            login_attempts INTEGER DEFAULT 0,
            lock_until TIMESTAMPTZ,
            daily_streak INTEGER DEFAULT 0,
            last_visit_date TIMESTAMPTZ,
            bonus_discount INTEGER DEFAULT 0,
            streak_expiry TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS calculations (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(100) NOT NULL,
            name VARCHAR(100) NOT NULL,
            package JSONB NOT NULL,
            services JSONB NOT NULL,
            total NUMERIC NOT NULL,
            date VARCHAR(50) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(100) NOT NULL,
            order_number VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(254) NOT NULL,
            phone VARCHAR(50),
            message TEXT,
            calculation JSONB,
            status VARCHAR(20) DEFAULT 'new',
            total NUMERIC NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;

    console.log('✅ Neon Postgres: таблицы инициализированы');
}

module.exports = { sql, initDB };
