FROM node:20-alpine3.20 AS build

WORKDIR /app
COPY package*.json ./

RUN npm ci
COPY . .
RUN npx ng build --configuration=production --base-href /

FROM nginx:alpine
ADD infrastructure/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/project-manager-admin /var/www/app/
EXPOSE 80
WORKDIR /var/www/app
CMD ["nginx","-g","daemon off;"]
