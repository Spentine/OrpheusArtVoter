FROM denoland/deno:latest

# Create working directory
WORKDIR /app

# Copy source
COPY . .

# Compile the main app
RUN deno cache backend/host.js

# Run the app
CMD ["deno", "run", "-A", "backend/host.js"]