#!/bin/bash
# ============================================
# Deploiement sigma-tunnel sur O2Switch
# Sous-domaine : ads.sigmafactory.fr
# ============================================
#
# PRE-REQUIS (a faire une seule fois dans cPanel) :
#   1. Creer le sous-domaine ads.sigmafactory.fr
#      cPanel > Sous-domaines > ads / sigmafactory.fr
#      Racine : /home/tqmx3080/ads.sigmafactory.fr
#
#   2. Creer l'app Node.js
#      cPanel > Setup Node.js App > Create Application
#      - Node version : 20
#      - Application mode : Production
#      - Application root : ads.sigmafactory.fr
#      - Application URL : ads.sigmafactory.fr
#      - Startup file : server.js
#
#   3. SSL Let's Encrypt
#      cPanel > SSL/TLS Status > Run AutoSSL (ads.sigmafactory.fr sera pris en charge)
#
#   4. Configurer les variables d'environnement
#      cPanel > Setup Node.js App > ads.sigmafactory.fr > Environment variables
#      Ou bien creer un fichier .env dans /home/tqmx3080/ads.sigmafactory.fr/
#
# UTILISATION :
#   Sur O2Switch, apres git pull :
#   source /home/tqmx3080/nodevenv/ads.sigmafactory.fr/20/bin/activate
#   cd ~/ads.sigmafactory.fr
#   bash deploy.sh
# ============================================

set -e

echo "=== Sigma Tunnel - Deploiement ==="

# 1. Install dependencies
echo "[1/5] Installation des dependances..."
npm install

# 2. Build Next.js (standalone mode)
echo "[2/5] Build Next.js (standalone)..."
npm run build

# 3. Copy static files into standalone
echo "[3/5] Copie des fichiers statiques..."
cp -r .next/static .next/standalone/.next/static
if [ -d "public" ]; then
  cp -r public .next/standalone/public
fi

# 4. Verify server.js exists
echo "[4/5] Verification du fichier de demarrage..."
if [ -f "server.js" ]; then
  echo "  server.js OK"
else
  echo "  ERREUR : server.js manquant !"
  exit 1
fi

# 5. Restart via Passenger
echo "[5/5] Redemarrage de l'application..."
if [ -d "tmp" ]; then
  touch tmp/restart.txt
else
  mkdir -p tmp
  touch tmp/restart.txt
fi

echo ""
echo "=== Deploiement termine ==="
echo "URL : https://ads.sigmafactory.fr"
echo ""
echo "Si premier deploiement, redemarrer aussi via :"
echo "  cPanel > Setup Node.js App > ads.sigmafactory.fr > Redemarrer"
