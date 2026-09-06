╔══════════════════════════════════════════════════════════════════╗
║                  CORRECTION /user/ - URGENT                      ║
╚══════════════════════════════════════════════════════════════════╝

PROBLÈME:
---------
❌ https://100.48.20.109/user/ → 404 sur /static/...
✅ https://100.48.20.109/      → Fonctionne (a-reference-front)

SOLUTION:
---------
Copier exactement ce qui marche pour a-reference-front !

SUR LE SERVEUR (100.48.20.109):
--------------------------------

1. Connectez-vous:
   $ ssh ec2-user@100.48.20.109

2. Allez dans le dossier:
   $ cd ~/deploiement_v2-crossborder

3. Exécutez le script:
   $ chmod +x FIX_COMPLET_USER_PATH.sh
   $ ./FIX_COMPLET_USER_PATH.sh

⏱️ Temps: 5-10 minutes (rebuild Docker)

RÉSULTAT ATTENDU:
-----------------
✅ https://100.48.20.109/user/   → a-user-front (path)
✅ https://100.48.20.109:3003/   → a-user-front (port)
✅ https://100.48.20.109/        → a-reference-front (racine)

FICHIERS MODIFIÉS:
------------------
1. nginx-https.conf → Ajout location /user avec rewrite
2. a_user_front/Dockerfile → Ajout ENV PUBLIC_URL=/user
3. Container a-user-front → Rebuild complet

VÉRIFICATION:
-------------
$ docker exec a-user-front cat /usr/share/nginx/html/index.html | grep static

Attendu: <script src="/user/static/js/main.xxx.js">
         <link href="/user/static/css/main.xxx.css">

ALTERNATIVE:
------------
Si ça ne marche toujours pas, utilisez:
✅ https://100.48.20.109:3003/ (fonctionne déjà!)

FICHIERS CRÉÉS POUR VOUS:
--------------------------
📄 EXECUTEZ_CECI_SUR_SERVEUR.md → Instructions complètes
📄 FIX_COMPLET_USER_PATH.sh     → Script automatique
📄 SOLUTION_SIMPLE_USER_PATH.md → Explications détaillées

══════════════════════════════════════════════════════════════════
Dernière mise à jour: 6 septembre 2026
══════════════════════════════════════════════════════════════════
