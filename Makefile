dev: ## Start the rinha in Dev
	@docker-compose down -v && docker compose build && docker compose up -d && docker compose logs -f

docker.stats: ## Show docker stats
	@docker stats --format "table {{.Name}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.CPUPerc}}"
