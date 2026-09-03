FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
COPY frontend/package*.json ./frontend/

RUN npm install --workspace=frontend

COPY frontend ./frontend

RUN npm run build --workspace=frontend


FROM nginx:alpine

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]