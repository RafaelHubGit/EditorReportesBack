FROM node:18-alpine

WORKDIR /app

# Copiar package.json primero para cache de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de la aplicación
COPY . .

# Exponer puerto
EXPOSE 4000

# Comando por defecto
CMD ["npm", "run", "dev"]