COMPSCRIPT_DIR := ../../compscript
ENV ?= DEV

.PHONY: help extract pipeline reports serve viewer clean fetch-wcif

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

extract: ## Extract volunteer data from Excel forms → data/volunteers.json
	cd ../.. && uv run scc-scripts/2026-sac/data/extract_volunteers.py
	cd ../.. && uv run scc-scripts/2026-sac/data/generate_import.py

pipeline: ## Run full pipeline (import + groups + staff) and save to WCIF cache
	cd $(COMPSCRIPT_DIR) && ENV=$(ENV) node ../scc-scripts/2026-sac/run_pipeline.js

serve: ## Start compscript dev server on port 3030
	cd $(COMPSCRIPT_DIR) && npm run dev-server

viewer: ## Start Competitor-groups viewer on port 5173
	cd ../../Competitor-groups && npx vite --port 5173

reports: ## Export all reports to output/*.html
	ENV=$(ENV) node export_reports.js

clean: ## Reset WCIF cache to clean state (no groups/assignments)
	cd $(COMPSCRIPT_DIR) && ENV=$(ENV) node -e "\
		require('dotenv').config({path: '.env.$(ENV)'}); \
		const fs = require('fs'); \
		const w = JSON.parse(fs.readFileSync('.wcif_cache/$(ENV)/SAC2026')); \
		w.persons.forEach(p => { p.assignments = []; p.extensions = (p.extensions || []).filter(e => e.id !== 'org.cubingusa.natshelper.v1.Person') }); \
		w.events.forEach(e => e.rounds.forEach(r => { r.results = [] })); \
		for (const v of w.schedule?.venues || []) { for (const r of v.rooms || []) { for (const a of r.activities || []) { a.childActivities = [] } } }; \
		fs.writeFileSync('.wcif_cache/$(ENV)/SAC2026', JSON.stringify(w)); \
		console.log('WCIF reset')"

fetch-wcif: ## Fetch fresh WCIF from WCA API (public endpoint)
	cd $(COMPSCRIPT_DIR) && mkdir -p .wcif_cache/$(ENV) && \
	curl -s "https://api.worldcubeassociation.org/competitions/SAC2026/wcif/public" > .wcif_cache/$(ENV)/SAC2026 && \
	echo "Fetched WCIF for SAC2026"
