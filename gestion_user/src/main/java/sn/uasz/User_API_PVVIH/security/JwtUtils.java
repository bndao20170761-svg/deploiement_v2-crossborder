package sn.uasz.User_API_PVVIH.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.stream.Collectors;

@Component
public class JwtUtils {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private long jwtExpirationMs;

    private Key key;

    // Initialisation de la clé après injection du secret
    @PostConstruct
    public void init() {
        byte[] secretBytes = Base64.getDecoder().decode(jwtSecret);
        if (secretBytes.length < 64) {
            throw new IllegalArgumentException("La clé JWT est trop courte pour HS512. Elle doit être au moins de 64 octets (512 bits).");
        }
        this.key = Keys.hmacShaKeyFor(secretBytes);
    }


    public String generateJwtToken(UserDetails userDetails) {
        // Extraire les authorities de l'utilisateur
        java.util.List<String> authorities = userDetails.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .collect(java.util.stream.Collectors.toList());
        
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("authorities", authorities) // ✅ Ajouter les authorities au token
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    public String getUsernameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * Extrait les rôles du token JWT
     */
    public String getRoleFromJwtToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            // Les rôles sont stockés dans les authorities
            @SuppressWarnings("unchecked")
            java.util.List<String> authorities = (java.util.List<String>) claims.get("authorities");
            
            if (authorities != null && !authorities.isEmpty()) {
                String authority = authorities.get(0);
                // Retirer le préfixe ROLE_ si présent
                return authority.startsWith("ROLE_") ? authority.substring(5) : authority;
            }
            
            return "USER"; // Rôle par défaut
        } catch (Exception e) {
            System.err.println("Erreur extraction rôle JWT: " + e.getMessage());
            return "USER";
        }
    }

    /**
     * Extrait toutes les autorités du token JWT
     */
    public java.util.List<String> getAuthoritiesFromJwtToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            @SuppressWarnings("unchecked")
            java.util.List<String> authorities = (java.util.List<String>) claims.get("authorities");
            
            return authorities != null ? authorities : java.util.List.of("ROLE_USER");
        } catch (Exception e) {
            System.err.println("Erreur extraction authorities JWT: " + e.getMessage());
            return java.util.List.of("ROLE_USER");
        }
    }

    public boolean validateJwtToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            System.err.println("JWT Validation Error: " + e.getMessage());
        }
        return false;
    }
}
