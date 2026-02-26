package sn.uasz.referencement_PVVIH.services;

import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import sn.uasz.referencement_PVVIH.security.JwtUtils;

import jakarta.servlet.http.HttpServletRequest;
import java.util.stream.Collectors;

/**
 * Service qui valide uniquement le JWT sans chercher l'utilisateur en base
 * Utilisé pour les endpoints FeignClient qui reçoivent des tokens d'autres services
 */
public class JwtOnlyUserDetailsService implements UserDetailsService {

    private final JwtUtils jwtUtils;

    public JwtOnlyUserDetailsService(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        java.util.List<String> authorities = java.util.List.of("ROLE_USER"); // Autorités par défaut
        
        try {
            // Récupérer le token JWT de la requête courante
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String authHeader = request.getHeader("Authorization");
                
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    String token = authHeader.substring(7);
                    // Extraire toutes les authorities du token
                    authorities = jwtUtils.getAuthoritiesFromJwtToken(token);
                    System.out.println("🔍 Authorities extraites du JWT: " + authorities);
                }
            }
        } catch (Exception e) {
            System.err.println("Erreur extraction authorities: " + e.getMessage());
            e.printStackTrace();
        }
        
        // Convertir les authorities en GrantedAuthority pour Spring Security
        java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> grantedAuthorities = 
            authorities.stream()
                .map(auth -> {
                    // S'assurer que l'authority a le préfixe ROLE_
                    String role = auth.startsWith("ROLE_") ? auth : "ROLE_" + auth;
                    System.out.println("🔍 Authority mappée: " + role);
                    return new org.springframework.security.core.authority.SimpleGrantedAuthority(role);
                })
                .collect(java.util.stream.Collectors.toList());
        
        System.out.println("🔍 Authorities finales pour " + username + ": " + grantedAuthorities);
        
        // Créer un utilisateur temporaire avec les informations du JWT
        return org.springframework.security.core.userdetails.User.builder()
                .username(username)
                .password("") // Pas de mot de passe nécessaire pour JWT
                .authorities(grantedAuthorities) // Utiliser toutes les authorities extraites
                .build();
    }
}