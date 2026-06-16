# 1. Usar una versión oficial y ligera de Node.js
FROM node:18-alpine

# 2. Crear la carpeta de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiar los archivos de los paquetes e instalarlos
COPY package*.json ./
RUN npm install

# 4. Copiar todo el resto de tu código
COPY . .

# 5. Exponer el puerto donde corre el backend
EXPOSE 3001

# 6. Comando para encender el servidor
CMD ["npm", "run", "dev"]
