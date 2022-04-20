# Include the latest node image
FROM node:lts
# Aliases setup for container folders
ARG SERVER="/slek-server"
ARG SERVER_src="."
ARG BUILD="/slek-server/build"
ENV PORTS="3333"
ENV APP_KEY="fksjdlkafjgasjhoiwoerowtlsljkfsiyvregjlkfldkjsaie"
ENV NODE_ENV="development"
ENV DRIVE_DISK="local"
ENV DB_CONNECTION="sqlite"
# Set the working directory inside the container to server module
WORKDIR ${SERVER}
# Expose port outside container
EXPOSE ${PORTS}
# Copy server module
COPY ${SERVER_src} ${SERVER}
#Install dependencies
RUN npm install
# Build TS files
RUN node ace build --production
# Update workdir
WORKDIR ${BUILD}
# Install production dependencies
RUN npm ci --production
# Initialize Sqlite
RUN mkdir tmp && touch tmp/db.sqlite3
# Start server module inside the container
CMD ["node", "server.js"]