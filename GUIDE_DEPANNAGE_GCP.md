# Guide de Dépannage - Déploiement GCP

## Problème: Les endpoints ne répondent pas via Postman

### Symptômes
- Les conteneurs tournent (docker ps montre "healthy")
- Pas de messages d'erreur visibles
- Les requêtes Postman timeout ou ne retournent rien

### Causes possibles et solutions

## 1. Vérifier que la Gateway reçoit bien la configuration

```bash
# Sur votre VM GCP
cd ~/deploiement_v2-crossborder

# Vérifier les logs de la Gateway au démarrage
docker logs gateway-pvvih 2>&1 | grep -i "config"

# Chercher cette ligne:
# "Located property source: [BootstrapPropertySource {name='bootstrapProperties-configClient'}]"
```

**Si la Gateway ne trouve pas la config:**
- Vérifier que api-configuration est bien démarré
- Vérifier les variables d'environnement: `docker exec gateway-pvvih env | grep CONFIG`

## 2. Vérifier l'enregistrement Eureka

```bash
# Vérifier quels services sont enregistrés
docker logs api-register 2>&1 | grep "registered with"

# Vous devriez voir:
# - GETWAY_PVVIH
# - USER_API_PVVIH
# - REFERENCEMENT_PVVIH
# - PATIENT_PVVIH
# - FORUM_PVVIH
```

**Si les services ne s'enregistrent pas:**
```bash
# Vérifier les logs de chaque service
docker logs gestion-user 2>&1 | grep -i "eureka"
docker logs gestion-reference 2>&1 | grep -i "eureka"
```

## 3. Vérifier les routes de la Gateway

```bash
# Depuis votre machine locale (remplacez l'IP)
curl http://34.32.116.206:8080/actuator/gateway/routes

# Ou depuis la VM
curl http://localhost:8080/actuator/gateway/routes
```

**Si aucune route n'apparaît:**
- La Gateway n'a pas chargé sa configuration
- Vérifier que le fichier GETWAY_PVVIH-prod.yml existe dans votre repo GitHub

## 4. Tester la connectivité interne

```bash
# Depuis le conteneur Gateway, tester les autres services
docker exec gateway-pvvih wget -q -O- http://api-register:8761/actuator/health
docker exec gateway-pvvih wget -q -O- http://gestion-user:8080/actuator/health
docker exec gateway-pvvih wget -q -O- http://api-configuration:8888/actuator/health
```

**Si ça ne fonctionne pas:**
- Problème de réseau Docker
- Vérifier: `docker network inspect deploiement_v2-crossborder_pvvih-network`

## 5. Vérifier les variables d'environnement

```bash
# Gateway
docker exec gateway-pvvih env | grep -E "EUREKA|CONFIG|JWT|CORS"

# Gestion User
docker exec gestion-user env | grep -E "EUREKA|CONFIG|JWT|DATASOURCE"
```

**Variables importantes:**
- `EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://api-register:8761/eureka/`
- `SPRING_CLOUD_CONFIG_URI=http://api-configuration:8888`
- `JWT_SECRET` (doit être défini)

## 6. Problème spécifique: Config Server

Si l'api-configuration ne démarre pas correctement:

```bash
# Vérifier les logs complets
docker logs api-configuration

# Chercher ces erreurs courantes:
# - "Could not resolve placeholder" -> Variable d'environnement manquante
# - "Connection refused" -> Eureka non accessible
# - "Git repository not found" -> Problème avec le repo GitHub
```

**Solution:**
Vérifier le fichier `api_configuration/demo/src/main/resources/application.properties`

## 7. Test manuel des endpoints

```bash
# Test direct du service (bypass Gateway)
curl -X POST http://34.32.116.206:9089/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test@test.com","password":"test123"}'

# Test via la Gateway
curl -X POST http://34.32.116.206:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test@test.com","password":"test123"}'
```

**Si le service direct fonctionne mais pas via Gateway:**
- Problème de routing dans la Gateway
- Vérifier la configuration des routes

## 8. Vérifier les règles de pare-feu GCP

```bash
# Depuis votre machine locale
gcloud compute firewall-rules list --filter="name~pvvih"

# Ports qui doivent être ouverts:
# - 8080 (Gateway)
# - 8761 (Eureka)
# - 8888 (Config Server)
# - 3001, 3002, 3003 (Frontends)
```

## 9. Redémarrer les services dans le bon ordre

```bash
cd ~/deploiement_v2-crossborder

# 1. Arrêter tout
docker-compose down

# 2. Nettoyer
docker system prune -f

# 3. Redémarrer dans l'ordre
docker-compose up -d mongodb mysql-user mysql-reference mysql-patient
sleep 30

docker-compose up -d api-register
sleep 30

docker-compose up -d api-configuration
sleep 30

docker-compose up -d gateway-pvvih
sleep 30

docker-compose up -d gestion-user gestion-reference gestion-patient forum-pvvih
sleep 30

docker-compose up -d gestion-forum-front a-reference-front a-user-front
```

## 10. Vérifier les logs en temps réel

```bash
# Suivre les logs de la Gateway
docker logs -f gateway-pvvih

# Dans un autre terminal, faire votre requête Postman
# Vous verrez les logs en temps réel
```

## Scripts de diagnostic

### Depuis votre machine Windows:
```powershell
.\diagnostic-gcp.ps1
```

### Depuis la VM GCP:
```bash
chmod +x check-logs-gcp.sh
./check-logs-gcp.sh
```

## Checklist rapide

- [ ] Tous les conteneurs sont "healthy": `docker ps`
- [ ] API Register accessible: `curl http://localhost:8761`
- [ ] API Configuration accessible: `curl http://localhost:8888/actuator/health`
- [ ] Gateway accessible: `curl http://localhost:8080/actuator/health`
- [ ] Services enregistrés dans Eureka: `docker logs api-register | grep registered`
- [ ] Routes chargées dans Gateway: `curl http://localhost:8080/actuator/gateway/routes`
- [ ] Variables d'environnement correctes: `docker exec gateway-pvvih env`
- [ ] Connectivité réseau OK: `docker network inspect deploiement_v2-crossborder_pvvih-network`

## Commandes utiles

```bash
# Voir tous les logs d'un service
docker logs <service-name>

# Suivre les logs en temps réel
docker logs -f <service-name>

# Voir les 100 dernières lignes
docker logs --tail 100 <service-name>

# Chercher des erreurs
docker logs <service-name> 2>&1 | grep -i error

# Redémarrer un service spécifique
docker-compose restart <service-name>

# Reconstruire et redémarrer un service
docker-compose up -d --build <service-name>
```

## Contact et support

Si le problème persiste après avoir suivi ce guide:
1. Exécutez `./check-logs-gcp.sh` sur la VM
2. Sauvegardez la sortie complète
3. Partagez les logs pour analyse
