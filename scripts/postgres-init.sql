-- Crear usuario específico para la aplicación
CREATE USER pdf_user WITH PASSWORD 'pdf_password';

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE pdf_auth TO pdf_user;

-- Crear extensión para UUID si es necesaria
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- (Las tablas se crearán desde la aplicación con TypeORM/Prisma)
SELECT '✅ PostgreSQL inicializado correctamente' AS status;