package sn.uasz.User_API_PVVIH.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;


import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j
public class JwtAuthTokenFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    public JwtAuthTokenFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        // Ne pas filtrer les endpoints publics
        return path.startsWith("/api/auth/") || 
               path.startsWith("/actuator/") ||
               path.equals("/api/auth/login") ||
               path.equals("/api/auth/register");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                String username = jwtUtils.getUsernameFromJwtToken(jwt);
                log.debug("🔍 JWT valide pour utilisateur: {}", username);

                // Extraire les autorités directement du JWT pour éviter les problèmes de récursion
                Collection<? extends GrantedAuthority> authorities = extractAuthoritiesFromJwt(jwt);
                
                // Créer directement l'authentication sans UserDetails pour éviter la récursion
                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                        username,
                        null,
                        authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("✅ Authentification définie pour: {} avec autorités: {}", username, authorities);
            }
        } catch (Exception e) {
            log.error("❌ Erreur lors du traitement JWT: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private Collection<? extends GrantedAuthority> extractAuthoritiesFromJwt(String jwt) {
        try {
            // Utiliser JwtUtils pour extraire les autorités du token
            List<String> authorities = jwtUtils.getAuthoritiesFromJwtToken(jwt);
            return authorities.stream()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("⚠️ Impossible d'extraire les autorités du JWT, utilisation des autorités par défaut");
            return List.of(new SimpleGrantedAuthority("ROLE_USER"));
        }
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
}
