********************************

## Local Development Envilopment:

********************************

### Back-end app:

Use nGINX, PHP and mySQL for back-end application development.

After envilopment setup, it will be available at `http://localhost:80`.

Host of mySQL server will be available at `http://localhost:3306`.

#### Require to install:
* Docker Desktop (or Docker and DockerCompose)

#### Docker configuration placed at `./docker-compose.yaml`. 
* nGinx 1.19.5    -> localhost:80
* mySQL 8.0.15    -> localhost:3306
* PHP 7.4         -> localhost:80

#### For set it up run at `./` one of this commands:
* easy run: `docker-compose up -d`
* rebuild containers and run: `docker-compose up -d --force-recreate --build`

For shut it down, run at `./` command `docker-compose down`

********************************

### Front-end app:

We use node.js and webpack to compile front-end app.

#### Require to install:
* node.js
* yarn

In development mode compilation is perform permanently, when souce files changed.

If dev, application will be available at `http://localhost:3000`.

In prod, application will be compile app and placed to `./www/build/`.

1. *Install packages* : go to the `./www/` and run `yarn`

2. *Compile front-end app and run server `node.js`* : t `./www/` run `yarn start`

3. *Build ready-to-deploy app version* (it will be created at `./www/build/`) : At `./www/` run `yarn build`

If some problems happends during packages downloading, you can reload all modules from source, using command: `yarn install --force`



********************************



Tips:

Look on active Docker containers and it IP addresses:
> for s in `docker-compose ps -q`; do echo ip of `docker inspect -f "{{.Name}}" $s` is `docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $s`; done

<br/><br/><br/>
********************************

## Production building and Deploy:

********************************

On first - install `js` packages from `www` folder using command (if you doesn't install it yet):  

> www % `yarn` 

For create porduction build of application, go to `www` and run in terminal:  

> www % `yarn lumi-prod`  

Wait above 30 secconds and check on errors in output window. Go to the root directory of propject, and open `prod` folder.  

Heare we can see compiled front-and `js` and raw back-end `php` files above. Put content of this folder to server root directory, and it's already in production ;D
















