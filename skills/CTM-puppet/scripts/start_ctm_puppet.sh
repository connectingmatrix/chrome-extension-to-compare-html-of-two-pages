#!/bin/zsh
set -e
cd /Users/abeer/dev/chrome_extension_utils
PORT_VALUE="${2:-${CTM_PUPPET_PORT:-4017}}"
SERVER_URL="http://127.0.0.1:${PORT_VALUE}"
if ! lsof -iTCP:${PORT_VALUE} -sTCP:LISTEN -n -P >/dev/null 2>&1; then
  nohup env PORT="${PORT_VALUE}" npm run server >/tmp/ctm-puppet-server-${PORT_VALUE}.log 2>&1 &
  sleep 2
fi
CTM_PUPPET_SERVER_URL="${SERVER_URL}" npm run open:extension -- "$1"
