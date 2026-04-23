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
        
        // Motifs d'origine : avec allowCredentials(true), une liste fixe de ports casse vite (3000 vs 5173, etc.)
        String allowedOriginsEnv = System.getenv("CORS_ALLOWED_ORIGINS");

        List<String> patterns = new ArrayList<>(Arrays.asList(
                "http://localhost:*",
                "http://127.0.0.1:*",
                // Serveur de démo / LAN (tout port sur cette IP, ex. React 3000 ou Vite 5173)
                "http://16.171.10.0:*",
                // Communication interne Docker (origines exactes, sans joker port)
                "http://gateway-pvvih:8080",
                "http://gestion-forum-front",
                "http://a-reference-front",
                "http://a-user-front"
        ));

        if (allowedOriginsEnv != null && !allowedOriginsEnv.trim().isEmpty()) {
            for (String part : allowedOriginsEnv.split(",")) {
                String p = part.trim();
                if (!p.isEmpty()) {
                    patterns.add(p);
                }
            }
        }

        configuration.setAllowedOriginPatterns(patterns);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "Origin",
                "X-Requested-With", "Access-Control-Request-Method",
                "Access-Control-Request-Headers"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Disposition"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
