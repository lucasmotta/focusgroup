.PHONY: build site dev-site deploy clean lint format format-check typecheck test test-e2e ci

# Build the polyfill bundles (ESM, CJS, IIFE, .d.ts)
build:
	npx tsup

# Lint
lint:
	npx oxlint

# Format
format:
	npx oxfmt

# Format check (CI)
format-check:
	npx oxfmt --check

# Type check
typecheck:
	npx tsc --noEmit

# Unit tests
test:
	npx vitest run

# E2E tests
test-e2e:
	npx playwright test

# Full CI pipeline: format check, lint, typecheck, unit tests, build, e2e tests
ci: format-check lint typecheck test build test-e2e

# Assemble the static site into public/
# Layout: public/index.html, public/dist/*, public/assets/*
site: build
	rm -rf public
	mkdir -p public/dist public/assets
	cp playground.html public/index.html
	cp dist/index.global.js dist/index.global.js.map public/dist/
	cp -R assets/. public/assets/

# Cloudflare Workers preview server (local dev)
dev-site: site
	npx wrangler dev

# Deploy the static site to Cloudflare Workers
deploy: site
	npx wrangler deploy

# Remove build artifacts
clean:
	rm -rf dist public
