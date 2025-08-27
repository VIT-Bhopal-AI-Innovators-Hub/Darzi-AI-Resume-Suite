FROM node:20-bullseye


# Install TeX Live minimal packages + latexmk
RUN apt-get update && DEBIAN_FRONTEND=noninteractive \
&& apt-get install -y --no-install-recommends \
perl git curl build-essential \
texlive-latex-recommended texlive-latex-extra texlive-fonts-recommended \
latexmk poppler-utils ghostscript \
&& apt-get clean && rm -rf /var/lib/apt/lists/*


WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=prod
COPY . .
EXPOSE ${PORT}
CMD ["node", "ws-server.js"]