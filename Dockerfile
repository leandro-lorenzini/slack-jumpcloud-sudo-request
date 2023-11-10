# First stage: Node.js image with dependencies and build tools
FROM node:14 as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Second stage: Distroless image
FROM gcr.io/distroless/nodejs:14
COPY --from=build-stage /app /app
WORKDIR /app
EXPOSE 3000
CMD ["server.js"]
