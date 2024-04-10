## Node version

```18.x or better```

Use nvm to manage node versions

## Server software setup

Amazon Linux 2023:

   ```
   1. Update linux
      sudo yum update -y

   2. Install nginx
      sudo yum install nginx
      
      Setup it as reverse proxy:

      sudo nano /etc/nginx/nginx.conf

      Add following code:

      server {
        listen       80;
        listen       [::]:80;
        server_name  ec2-your-server.compute-1.amazonaws.com;

        location / {
         proxy_pass http://localhost:3000;
         proxy_http_version 1.1;
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection 'upgrade';
         proxy_set_header Host $host;
         proxy_cache_bypass $http_upgrade;
        }
      }
   
   3. Install nodejs and nvm
      sudo yum install nodejs

      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
      nvm install --lts
      nvm use --lts

      npm install pm2 -g

   4. Install git
      sudo yum install git

   5. Install mongodb
      https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-amazon/

      If you want to connect to mongodb from your local pc, do this:

      a. sudo nano /etc/mongodb.conf
      b. Change bindIp under net to 0.0.0.0 from 127.0.0.1

   6. Setup aws cli
      https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

      Add your credentials in following file:
      ~/.aws/credentials

   6. Verify installations
      node -v
      npm -v
      pm2 -v
      git --version
      aws --version
   ```

## Setting up environment

1. Make a copy of `.env.example` and name it `.env`
2. Update CORS, Database, AWS etc.:

## Run these first time

```
   npm install
   node dist/migration/initial-setup.js
```

## Run server

```
   pm2 start dist/server.js
   pm2 restart 0 && pm2 flush && pm2 logs
```
