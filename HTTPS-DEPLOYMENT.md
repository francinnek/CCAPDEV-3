# HTTPS Deployment Conceptual for the project

This document describes how we would enable HTTPS for the app. using a NGINX reverse proxy + Let's Encrypt setup , with minimal Node changes and cloud-hosting.

# Recommendation (short)

- Use a reverse proxy (NGINX or Traefik) to terminate TLS. Let the proxy handle Let's Encrypt certificates and renewal. Proxy traffic to your Node app running on `localhost:3000`.
- Make two small, optional code changes in `server.js` to: (1) trust the proxy (`app.set('trust proxy', 1)`) and (2) make session cookies `secure` in production.

These code changes are recommended but not required to get HTTPS working for users.

# Assumptions and requirements

- we are deploying to a managed host that supports custom domains or using UBUNTU
- Create a domain name pointed to the server's public IP (e.g., `DLSUAirlines.com`).


# 1) First install pm2 and start the app

pm2 (process manager 2) is a process manager for nodejs app that keeps apps running by restarting it on crashes and allows for running of multiple processes.

reason for choosing:
Easy background management
Auto-restarts on crashes allowing for no supervision needed
simple to use

sample start code from stack overflow 
```bash
sudo npm i -g pm2
cd /path/to/your/project
pm2 start server.js --name project
pm2 save
pm2 startup systemd
```
Confirm app is reachable locally at `http://127.0.0.1:3000`

## 2) Next we Install NGINX and Certbot

On Ubuntu: 

```bash
sudo apt update //updates our ubuntu system to allow for latest version
sudo apt install -y nginx certbot python3-certbot-nginx //downloads the nginx and certbot
```

```bash
sudo ufw allow 'Nginx Full'  //makes firewall allow traffic from port 80 and 443
sudo ufw enable //makes sure firewall is active
```

# 3) Obtain TLS certificates with Certbot and nginx plugin

//runs certbot are our domain using nginx plugin 

```bash
sudo certbot --nginx -d DLSUAirlines.com -d DLSUAirlines.com
```

//test the auto renewal process 
```bash
sudo certbot renew --dry-run
```

## 4) Confirm it redirects

- The NGINX config should now be redirecting HTTP to HTTPS. 
- check by going to browser and searching domain (http://DLSUAirlines.com)
- it should now be https://DLSUAirlines.com









