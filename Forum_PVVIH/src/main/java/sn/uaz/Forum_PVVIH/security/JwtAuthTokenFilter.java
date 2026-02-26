package sn.uaz.Forum_PVVIH.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import sn.uaz.Forum_PVVIH.services.UserDetailsServiceImpl;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;

@Component
@Slf4j
public class JwtAuthTokenFilter extends OncePerRequestFilter {

    public static final ThreadLocal<String> CURRENT_TOKEN = new ThreadLocal<>();

    private final JwtUtils jwtUtils;
    private final UserDetailsServiceImpl userDetailsService;

    public JwtAuthTokenFilter(JwtUtils jwtUtils, UserDetailsServiceImpl userDetailsService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        

        try {
            String jwt = parseJwt(request);

            
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {

                CURRENT_TOKEN.set(jwt); // Stocke le token pour Feign
                String username = jwtUtils.getUserNameFromJwtToken(jwt);


                // Créer une authentification basée sur le token JWT sans charger l'utilisateur localement
                // Le token JWT contient déjà toutes les informations nécessaires
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                username, // Utiliser directement le nom d'utilisateur du token
                                null,
                                java.util.Collections.emptyList() // Pas de rôles pour l'instant
                        );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);

            } else {

            }
               } catch (Exception e) {
                       }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth; // Retourner le token complet avec "Bearer "
        }
        return null;
    }
}
