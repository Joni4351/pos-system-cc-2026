# Usar un motor ligero
FROM node:18-alpine

# Crear la carpeta de trabajo
WORKDIR /app

# Instalar las herramientas necesarias
COPY package*.json ./
RUN npm install

# Copiar todo el diseño visual
COPY . .

# Abrir la puerta 3000 para que la gente entre
EXPOSE 3000

# Encender la página
CMD ["npm", "run", "dev"]
