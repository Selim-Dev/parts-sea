# Landing Page Dockerfile (Next.js)
FROM node:20-alpine AS builder

WORKDIR /app

# Install git (some packages need it)
RUN apk add --no-cache git

# Accept build argument
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package*.json ./

# Install all dependencies for build (skip prepare scripts)
RUN npm install --legacy-peer-deps --ignore-scripts

COPY . .

# Build the Next.js app with env var
RUN npm run build

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

# Install only production dependencies, skip all scripts (no husky)
RUN npm install --omit=dev --legacy-peer-deps --ignore-scripts && \
    npm cache clean --force

# Copy built files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./

EXPOSE 3000

CMD ["npm", "start"]
