env := dev
init-services := mongo

all: dev init up # to run the application in development environment using docker
# to run in production mode with docker use: `make prod init up`

###########################

dev:
	$(eval env := dev)
	$(eval env-var := development)
	$(eval init-services := mongo)
prod:
	$(eval env := prod)
	$(eval env-var := production)
	$(eval init-services := )

init: env-variables-file
	@mkdir -p volumes && [ -n "$(init-services)" ] && docker compose -f compose-$(env).yml up -d $(init-services) || true

env-variables-file:
	@cat .env 2>/dev/null > /dev/null || cp .env.example .env
	@sed -i 's/^ENV=.*/ENV=$(env-var)/' .env

up: build
	@mkdir -p volumes && docker compose -f compose-$(env).yml up -d

build:
	@docker build -t yaralex-api .

down:
	@docker compose -f compose-$(env).yml down

app-logs:
	@docker compose -f compose-$(env).yml logs -f app

app-exec:
	@docker compose -f compose-$(env).yml exec -it app bash


## Run the app in local without docker
run-local:
	uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1