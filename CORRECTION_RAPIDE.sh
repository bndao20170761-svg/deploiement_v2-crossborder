#!/bin/bash
# Correction rapide port 3003 SSL

echo "🔧 Correction nginx-https.conf pour port 3003..."

# Copier le fichier corrigé
scp nginx-https.conf ec2-user@100.48.20.109:~/deploiement_v2-crossborder/

# Redémarrer nginx-https
ssh ec2-user@100.48.20.109 << 'EOF'
cd ~/deploiement_v2-crossborder
docker compose restart nginx-https
sleep 3
docker compose logs nginx-https --tail 20
echo ""
echo "✅ Test port 3003:"
curl -k -I https://localhost:3003 2>&1 | head -5
EOF

echo ""
echo "✅ FAIT ! Testez: https://100.48.20.109:3003"
