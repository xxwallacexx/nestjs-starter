dev:
	docker compose -f ./docker/docker-compose.dev.yml up --remove-orphans || make dev-down
dev-down:
	docker compose -f ./docker/docker-compose.dev.yml down --remove-orphans
prod:
	docker compose -f ./docker/docker-compose.prod.yml up --build -V --remove-orphans
