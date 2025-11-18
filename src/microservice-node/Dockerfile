# Usar la imagen oficial de Node
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /usr/src/app

# Copiar solo package.json y package-lock.json para aprovechar cache
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar el resto del código
COPY . .

# Exponer puerto del microservicio
EXPOSE 8002

# Comando para correr la app
CMD ["node", "server.js"]
