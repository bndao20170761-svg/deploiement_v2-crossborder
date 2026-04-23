package sn.uasz.Getway_PVVIH.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Ne pas gérer CORS dans le gateway : laisser le backend s'en charger
                .authorizeExchange(exchanges -> exchanges
                        .anyExchange().permitAll()
                )
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // CORS gateway : l’appli authentifie par JWT (header), pas par cookie.
        // Un .env avec CORS_ALLOWED_ORIGINS souvent figé (3000-3003) provoque 403 dès qu’on utilise
        // le port 5173 (Vite), un autre hôte, ou l’https — d’où "Invalid CORS request".
        // Défaut = une seule règle : * + pas de credentials (autorisé par Spring).
        // Mode stricte (opt-in) : CORS_GATEWAY_STRICT=true + CORS_ALLOWED_ORIGINS=...
        String strictEnv = System.getenv("CORS_GATEWAY_STRICT");
        String allowedOriginsEnv = System.getenv("CORS_ALLOWED_ORIGINS");
        String allowCredEnv = System.getenv("CORS_ALLOW_CREDENTIALS");

        if ("true".equalsIgnoreCase(strictEnv) && allowedOriginsEnv != null && !allowedOriginsEnv.trim().isEmpty()) {
            List<String> patterns = new ArrayList<>();
            for (String part : allowedOriginsEnv.split(",")) {
                String p = part.trim();
                if (!p.isEmpty()) {
                    patterns.add(p);
                }
            }
            configuration.setAllowedOriginPatterns(patterns);
            boolean cred = "true".equalsIgnoreCase(allowCredEnv) || "1".equals(allowCredEnv);
            configuration.setAllowCredentials(cred);
        } else {
            configuration.setAllowedOriginPatterns(Collections.singletonList("*"));
            configuration.setAllowCredentials(false);
        }

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "Origin",
                "X-Requested-With", "Access-Control-Request-Method",
                "Access-Control-Request-Headers"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Disposition"));
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
