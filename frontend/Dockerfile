# Debian/glibc base (not Alpine/musl): Next.js ships its SWC compiler as a
# prebuilt native binary, and npm resolves the glibc (@next/swc-linux-x64-gnu)
# variant. On Alpine that binary can't load (musl has no ld-linux-x86-64.so.2),
# which breaks `next build`. A glibc base avoids that class of failure.
FROM node:20-slim

WORKDIR /app

ARG NEXT_PUBLIC_API_BASE_URL=/api/v1
ARG INTERNAL_API_BASE_URL=http://backend:8000
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV INTERNAL_API_BASE_URL=$INTERNAL_API_BASE_URL

COPY package.json package-lock.json /app/
RUN npm ci

COPY . /app
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0"]
