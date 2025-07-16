FROM node:16-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps --include=dev

COPY . .
RUN GENERATE_SOURCEMAP=false npx react-scripts build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]