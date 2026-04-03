#!/bin/zsh
set -e
cd /Users/abeer/dev/chrome_extension_utils
if ! lsof -iTCP:4017 -sTCP:LISTEN -n -P >/dev/null 2>&1; then
  nohup npm run server >/tmp/html-inspect-server.log 2>&1 &
  sleep 2
fi
npm run open:extension -- "$1"
