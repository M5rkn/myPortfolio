
FROM node:18-alpine


WORKDIR /app


COPY package*.json ./


RUN npm ci --omit=dev


COPY . .


RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001


RUN chown -R nextjs:nodejs /app
USER nextjs


EXPOSE 8080


ENV NODE_ENV=production
ENV PORT=8080


CMD ["npm", "start"] 