#!/bin/zsh
set -e
cd -- "${0:A:h}"
echo "Zenith — test na iPhonie"
echo "Telefon i Mac powinny być w tej samej sieci Wi-Fi."
if [[ ! -d node_modules ]]; then
  npm ci
fi
if ! npx expo whoami >/dev/null 2>&1; then
  echo "Zaloguj się na to samo konto Expo, którego używasz w Expo Go."
  echo "Hasło wpisujesz wyłącznie tutaj, w swoim terminalu."
  npx expo login
fi
exec npx expo start --go --lan --port 8081
