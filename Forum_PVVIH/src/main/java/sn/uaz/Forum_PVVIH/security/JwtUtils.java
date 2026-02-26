package sn.uaz.Forum_PVVIH.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import jakarta.annotation.PostConstruct;
import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;

@Service
@Slf4j
public class JwtUtils {

    @Value("${app.jwt.secret:mySecretKey}")
    private String jwtSecret;

    @Value("${app.jwt.expiration:3600000}")
    private int jwtExpirationMs;

    private SecretKey key;

    // Initialisation de la clé après injection du secret
    @PostConstruct
    public void init() {
        byte[] secretBytes = Base64.getDecoder().decode(jwtSecret);
        if (secretBytes.length < 64) {
            throw new IllegalArgumentException("La clé JWT est trop courte pour HS512. Elle doit être au moins de 64 octets (512 bits).");
        }
        this.key = Keys.hmacShaKeyFor(secretBytes);
    }

    public String getUserNameFromJwtToken(String token) {
        try {
            // Nettoyer le token (supprimer les espaces et le préfixe Bearer)
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7).trim();
            }
            
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    public boolean validateJwtToken(String authToken) {
        try {
            if (authToken == null || authToken.trim().isEmpty()) {
                return false;
            }

            // Supprimer le préfixe "Bearer " s'il existe
            if (authToken.startsWith("Bearer ")) {
                authToken = authToken.substring(7);
            }

            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(authToken);
            
            return true;
        } catch (SignatureException e) {
            log.error("Signature JWT invalide: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("Token JWT malformé: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("Token JWT expiré: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("Token JWT non supporté: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("Claims JWT vides: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Erreur de validation JWT: {}", e.getMessage());
        }
        
        log.warn("❌ Token JWT invalide");
        return false;
    }
}
