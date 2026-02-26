package sn.uasz.Patient_PVVIH.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import sn.uasz.Patient_PVVIH.security.JwtUtils;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

public class JwtAuthTokenFilter extends OncePerRequestFilter {

    public static final ThreadLocal<String> CURRENT_TOKEN = new ThreadLocal<>();

    private final JwtUtils jwtUtils;

    public JwtAuthTokenFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws IOException, ServletException {
        try {
            String jwt = parseJwt(request);
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                CURRENT_TOKEN.set(jwt); // ✅ stocke le token pour Feign
                
                // ✅ Extraire les informations du JWT et créer l'authentification
                String username = jwtUtils.getUsernameFromJwtToken(jwt);
                List<String> authorities = jwtUtils.getAuthoritiesFromJwtToken(jwt);
                
                // 🔍 DEBUG: Afficher les authorities extraites
                System.out.println("🔍 JWT DEBUG - Username: " + username);
                System.out.println("🔍 JWT DEBUG - Authorities: " + authorities);
                
                // Convertir les authorities en SimpleGrantedAuthority
                List<SimpleGrantedAuthority> grantedAuthorities = authorities.stream()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());
                
                System.out.println("🔍 JWT DEBUG - GrantedAuthorities: " + grantedAuthorities);
                
                // Créer l'objet Authentication
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(username, null, grantedAuthorities);
                
                // Définir l'authentification dans le contexte de sécurité
                SecurityContextHolder.getContext().setAuthentication(authentication);
                System.out.println("🔍 JWT DEBUG - Authentication set in SecurityContext");
            }
            filterChain.doFilter(request, response);
        } finally {
            CURRENT_TOKEN.remove(); // ✅ nettoyage pour éviter fuites mémoire
            SecurityContextHolder.clearContext(); // ✅ nettoyer le contexte de sécurité
        }
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
}
