COMPSCRIPT_DIR := ../../compscript
ENV ?= DEV

.PHONY: help extract pipeline deploy deploy-restore serve serve-prod viewer reports backup verify clean fetch-wcif

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# --- Development ---

pipeline: ## Run full pipeline locally (import → groups → staff)
	cd $(COMPSCRIPT_DIR) && ENV=$(ENV) node ../scc-scripts/2026-sac/run_pipeline.js

serve: ## Start compscript dev server (port 3030, no auth)
	cd $(COMPSCRIPT_DIR) && npm run dev-server

viewer: ## Start Competitor-groups viewer (port 5173)
	cd ../../Competitor-groups && npx vite --port 5173

reports: ## Generate HTML reports → reports/html/
	ENV=$(ENV) node export_reports.js

fetch-wcif: ## Fetch fresh WCIF from WCA public API
	cd $(COMPSCRIPT_DIR) && mkdir -p .wcif_cache/$(ENV) && \
	curl -s "https://api.worldcubeassociation.org/competitions/SAC2026/wcif/public" > .wcif_cache/$(ENV)/SAC2026 && \
	echo "Fetched WCIF for SAC2026"

clean: ## Reset local WCIF cache (clear groups/assignments/extensions)
	cd $(COMPSCRIPT_DIR) && ENV=$(ENV) node -e "\
		require('dotenv').config({path: '.env.$(ENV)'}); \
		const fs = require('fs'); \
		const w = JSON.parse(fs.readFileSync('.wcif_cache/$(ENV)/SAC2026')); \
		w.persons.forEach(p => { p.assignments = []; p.extensions = [] }); \
		w.events.forEach(e => e.rounds.forEach(r => { r.results = [] })); \
		for (const v of w.schedule?.venues || []) { for (const r of v.rooms || []) { for (const a of r.activities || []) { a.childActivities = [] } } }; \
		fs.writeFileSync('.wcif_cache/$(ENV)/SAC2026', JSON.stringify(w)); \
		console.log('WCIF reset')"

extract: ## Re-extract volunteer data from Excel → data/outputs/
	cd .. && uv run 2026-sac/data/extract_volunteers.py && uv run 2026-sac/data/generate_import.py

# --- Production ---

deploy: ## Deploy to WCA production (pipeline + OAuth PATCH). Opens browser for auth.
	node run_pipeline_prod.js

deploy-restore: ## Restore backup then deploy to WCA (full reset + pipeline + PATCH)
	node run_pipeline_prod.js --restore-first

serve-prod: ## Start compscript server in PROD mode (port 3030, OAuth required)
	cd $(COMPSCRIPT_DIR) && ENV=PROD node main.js

backup: ## Download current live WCIF from WCA as backup
	@mkdir -p backups
	@node -e "\
		const path=require('path'),fs=require('fs'),http=require('http'); \
		require(path.resolve('../../compscript/node_modules/dotenv')).config({path:path.resolve('../../compscript/.env.PROD')}); \
		const C=process.env.API_KEY,S=process.env.API_SECRET,R='http://localhost:3030/auth/oauth_response',W=process.env.WCA_HOST; \
		http.createServer(async(req,res)=>{ \
			const u=new URL(req.url,'http://localhost:3030'); \
			if(u.pathname==='/auth/oauth_response'&&u.searchParams.get('code')){ \
				const t=await(await fetch(W+'/oauth/token',{method:'POST',body:new URLSearchParams({grant_type:'authorization_code',code:u.searchParams.get('code'),client_id:C,client_secret:S,redirect_uri:R}).toString(),headers:{'Content-Type':'application/x-www-form-urlencoded'}})).json(); \
				const wcif=await(await fetch(W+'/api/v0/competitions/SAC2026/wcif',{headers:{'Authorization':'Bearer '+t.access_token}})).json(); \
				const fname='backups/WCIF_backup_'+new Date().toISOString().replace(/[:.]/g,'-').substring(0,19)+'.json'; \
				fs.writeFileSync(fname,JSON.stringify(wcif)); \
				console.log('Saved: '+fname+' ('+wcif.persons.length+' persons)'); \
				res.writeHead(200,{'Content-Type':'text/html'});res.end('<h1>Backup saved: '+fname+'</h1>'); \
				setTimeout(()=>process.exit(0),2000); \
			}else{res.writeHead(302,{Location:W+'/oauth/authorize?client_id='+C+'&scope=public%20manage_competitions&response_type=code&redirect_uri='+encodeURIComponent(R)});res.end();} \
		}).listen(3030,()=>console.log('Open http://localhost:3030 to backup'));"

verify: ## Verify deployed WCIF (zone compliance, TLs, score takers). Opens browser for auth.
	node verify_deploy.js
