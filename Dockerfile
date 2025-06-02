FROM node:22.16.0-alpine

# 1. Installer PNPM et configurer le cache
RUN npm install -g pnpm && \
    mkdir -p /home/node/.pnpm-store && \
    chown -R node:node /home/node

# 2. Basculer vers l'utilisateur non-root
USER node
WORKDIR /anniv_back

# 3. Copier les fichiers de dépendances (avec les bonnes permissions)
COPY --chown=node:node package.json pnpm-lock.yaml ./
COPY --chown=node:node prisma ./prisma/

# 4. Installer les dépendances avec cache optimisé
RUN pnpm install --frozen-lockfile

# 5. Générer le client Prisma
RUN pnpm exec prisma generate

# 6. Copier le reste de l'application
COPY --chown=node:node . .

# 7. Nettoyer (optionnel pour production)
RUN pnpm prune --prod && \
    rm -rf /home/node/.pnpm-store

# 8. Configuration du port et santé
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost:8000/health || exit 1

# 9. Commande de démarrage
CMD ["pnpm", "start"]