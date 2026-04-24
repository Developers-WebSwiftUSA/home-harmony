# Full-stack image: API + built SPA (Express serves frontend/dist).
# Build from repository root:
#   docker build -f backend/Dockerfile .

FROM node:18-alpine AS frontend-builder
WORKDIR /src
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend/ ./
COPY --from=frontend-builder /src/dist /frontend/dist
RUN mkdir -p uploads
EXPOSE 5000
CMD ["node", "server.js"]
