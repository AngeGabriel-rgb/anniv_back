FROM node:22.16.0-alpine

# Installer PNPM
RUN npm install -g pnpm

# Répertoire de travail
WORKDIR /anniv_back

# Copier les fichiers nécessaires pour les dépendances
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/  # Important : Copier le dossier prisma/

# Installer toutes les dépendances (même devDependencies)
RUN pnpm install

# Générer le client Prisma
RUN pnpm prisma generate

# Supprimer les dépendances de développement (optionnel)
RUN pnpm prune --prod

# Copier le reste de l'application
COPY . .

# Exposer le port
EXPOSE 8000

# Démarrer l'application
CMD ["pnpm", "start"]
