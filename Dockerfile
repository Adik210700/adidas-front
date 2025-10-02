# ====== build stage ======
FROM node:20-alpine AS build
WORKDIR /app

# Установим зависимости
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* .npmrc* ./
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i --frozen-lockfile; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    else npm i; fi

# Копируем исходники
COPY . .

# Передаём API URL на этапе сборки (встраивается в бандл)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Сборка
RUN npm run build

# ====== runtime stage ======
FROM nginx:1.27-alpine AS runtime

# Конфиг nginx для SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Статика
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx","-g","daemon off;"]