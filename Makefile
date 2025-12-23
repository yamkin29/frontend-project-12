build:
	npm --prefix frontend ci
	npm --prefix frontend run build

start:
	./frontend/node_modules/.bin/start-server -s ./frontend/dist

lint:
	npm --prefix frontend run lint

lint-fix:
	npm --prefix frontend run lint -- --fix
