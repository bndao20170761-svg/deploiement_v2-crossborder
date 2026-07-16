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
        
        // Autoriser tous les fronts pour le développement
        List<String> allowedOrigins = Arrays.asList(
            // Développement local
            "https://localhost:3000",
            "https://localhost:3001", 
            "https://localhost:3002",
            "https://localhost:3003",
            "https://localhost:3004",
            "https://localhost:4000",
            "https://localhost:8080",
            "https://127.0.0.1:3000",
            "https://127.0.0.1:3001",
            "https://127.0.0.1:3002",
            "https://127.0.0.1:3003",
            "https://127.0.0.1:3004",
            "https://127.0.0.1:4000",
            "https://127.0.0.1:8080",
            // Production GCP
            "https://13.53.134.15:3000",
            "https://13.53.134.15:3001",
            "https://13.53.134.15:3002",
            "https://13.53.134.15:3003",
            "https://13.53.134.15:4000",
            "https://13.53.134.15:8080"
        );
        
        configuration.setAllowedOrigins(allowedOrigins);
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
