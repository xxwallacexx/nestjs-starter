# dev build
FROM node:22-alpine AS dev

# ENV TINI_VERSION v0.19.0
# ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
# RUN chmod +x /tini

RUN apk add --no-cache tini

WORKDIR /usr/src/app
COPY server/package.json server/package-lock.json ./
RUN npm ci 
ENV PATH="${PATH}:/usr/src/app/bin" \
  ENV=development \
  NVIDIA_DRIVER_CAPABILITIES=all \
  NVIDIA_VISIBLE_DEVICES=all
ENTRYPOINT ["/sbin/tini", "--", "/bin/sh"]
