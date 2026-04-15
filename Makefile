.PHONY: build site dev-site deploy clean

# Build the polyfill bundles (ESM, CJS, IIFE, .d.ts)
build:
	npx tsup

# Assemble the static site into public/
# Layout: public/index.html, public/dist/*, public/assets/*
site: build
	rm -rf public
	mkdir -p public/dist public/assets
	cp playground.html public/index.html
	cp dist/index.global.js dist/index.global.js.map public/dist/
	cp assets/logo-light.svg assets/logo-dark.svg public/assets/

# Cloudflare Workers preview server (local dev)
dev-site: site
	npx wrangler dev

# Deploy the static site to Cloudflare Workers
deploy: site
	npx wrangler deploy

# Remove build artifacts
clean:
	rm -rf dist public
