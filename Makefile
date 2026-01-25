build: install
	npm --prefix frontend run build

start:
	npm --prefix backend run start

lint:
	npm --prefix frontend run lint

lint-fix:
	npm --prefix frontend run lint -- --fix

install:
	npm --prefix backend ci
	npm --prefix frontend ci
