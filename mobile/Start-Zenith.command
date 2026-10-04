#!/bin/zsh
set -e
cd -- "${0:A:h}"
echo "Zenith — test na iPhonie"
echo "Telefon i Mac powinny być w tej samej sieci Wi-Fi."
if [[ ! -d node_modules ]]; then
  npm ci
fi
zenith_backend_pid=""
zenith_proxy_pid=""
trap '[[ -n "$zenith_proxy_pid" ]] && kill "$zenith_proxy_pid" 2>/dev/null; [[ -n "$zenith_backend_pid" ]] && kill "$zenith_backend_pid" 2>/dev/null' EXIT INT TERM
if node -e 'fetch("http://127.0.0.1:3101/api/mobile/v1/catalog",{signal:AbortSignal.timeout(3000)}).then(async r=>{const d=await r.json();process.exit(r.ok&&d.version===1?0:1)}).catch(()=>process.exit(1))'; then
  echo "Połączenie z biblioteką już działa."
elif [[ -f ../.vercel/mobile-preview-access.json ]]; then
  node scripts/test-api.mjs &
  zenith_proxy_pid=$!
else
  echo "Brak dostępu do podglądu. Uruchamiam lokalną bibliotekę testową."
  (cd .. && npm run dev -- --webpack --hostname 127.0.0.1 --port 3100) &
  zenith_backend_pid=$!
  node scripts/test-api.mjs --local &
  zenith_proxy_pid=$!
fi
zenith_test_ip=$(node -e 'const os=require("node:os"); const all=os.networkInterfaces(); const list=[...(all.en0||[]), ...Object.values(all).flat()]; console.log(list.find(i=>i.family==="IPv4"&&!i.internal)?.address||"127.0.0.1")')
export EXPO_PUBLIC_ZENITH_URL="http://${zenith_test_ip}:3101"
if ! npx expo whoami >/dev/null 2>&1; then
  echo "Zaloguj się na to samo konto Expo, którego używasz w Expo Go."
  echo "Hasło wpisujesz wyłącznie tutaj, w swoim terminalu."
  npx expo login
fi
npx expo start --go --lan --port 8081
