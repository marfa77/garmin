#!/bin/bash
# Deploy Garmin wellness sync worker to Hetzner (same VPS as PixID / UAE bot)
set -euo pipefail

SERVER_USER="${SERVER_USER:-root}"
SERVER_HOST="${SERVER_HOST:-37.27.0.210}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_github}"
REMOTE_PATH="${REMOTE_PATH:-/opt/garmin-wellness-sync}"
SERVICE_NAME="garmin-wellness-sync"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

ssh_cmd() {
  ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_HOST}" "$@"
}

rsync_cmd() {
  rsync -avz -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" "$@"
}

echo "==> Deploy Garmin sync worker to ${SERVER_USER}@${SERVER_HOST}:${REMOTE_PATH}"

ssh_cmd "mkdir -p ${REMOTE_PATH}/scripts ${REMOTE_PATH}/deploy ${REMOTE_PATH}/log"

rsync_cmd \
  "${ROOT}/scripts/run-sync.mjs" \
  "${ROOT}/scripts/sync-user.mjs" \
  "${ROOT}/scripts/sync-server.mjs" \
  "${ROOT}/scripts/sync_garmin.py" \
  "${ROOT}/scripts/generate-coach.mjs" \
  "${ROOT}/scripts/requirements.txt" \
  "${SERVER_USER}@${SERVER_HOST}:${REMOTE_PATH}/scripts/"

rsync_cmd \
  "${ROOT}/package.json" \
  "${ROOT}/package-lock.json" \
  "${SERVER_USER}@${SERVER_HOST}:${REMOTE_PATH}/"

rsync_cmd \
  "${ROOT}/deploy/garmin-wellness-sync.service" \
  "${SERVER_USER}@${SERVER_HOST}:${REMOTE_PATH}/deploy/"

if [ -f "${ROOT}/.env" ]; then
  echo "==> Copy .env"
  rsync_cmd "${ROOT}/.env" "${SERVER_USER}@${SERVER_HOST}:${REMOTE_PATH}/.env"
  ssh_cmd "chmod 600 ${REMOTE_PATH}/.env"
else
  echo "WARN: no local .env — ensure ${REMOTE_PATH}/.env exists on server"
fi

ssh_cmd bash -s <<EOF
set -euo pipefail
cd ${REMOTE_PATH}

if [ ! -d venv ]; then
  python3 -m venv venv
fi
source venv/bin/activate
pip install -q --upgrade pip
pip install -q -r scripts/requirements.txt

if [ ! -d node_modules ]; then
  npm ci --omit=dev
else
  npm ci --omit=dev
fi

# Worker secrets (append if missing)
grep -q '^SYNC_WORKER_PORT=' .env 2>/dev/null || echo 'SYNC_WORKER_PORT=3015' >> .env
if ! grep -q '^SYNC_WORKER_SECRET=' .env 2>/dev/null; then
  echo "SYNC_WORKER_SECRET=\$(openssl rand -hex 32)" >> .env
fi

cp deploy/garmin-wellness-sync.service /etc/systemd/system/${SERVICE_NAME}.service
systemctl daemon-reload
systemctl enable ${SERVICE_NAME}
systemctl restart ${SERVICE_NAME}
sleep 1
systemctl is-active ${SERVICE_NAME}
curl -sf http://127.0.0.1:3015/health || (journalctl -u ${SERVICE_NAME} -n 30 --no-pager; exit 1)
EOF

echo ""
echo "==> Worker URL: http://${SERVER_HOST}:3015"
echo "==> Get secret: ssh -i ${SSH_KEY} ${SERVER_USER}@${SERVER_HOST} grep SYNC_WORKER_SECRET ${REMOTE_PATH}/.env"
echo "==> Set on Vercel: GARMIN_SYNC_WORKER_URL=http://${SERVER_HOST}:3015"
