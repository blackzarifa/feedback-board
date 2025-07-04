FROM node:20-alpine
WORKDIR /app

# Install pnpm once
RUN npm install -g pnpm

# Copy and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]