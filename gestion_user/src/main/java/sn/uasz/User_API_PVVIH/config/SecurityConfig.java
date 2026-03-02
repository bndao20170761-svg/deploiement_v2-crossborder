package sn.uasz.User_API_PVVIH.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import sn.uasz.User_API_PVVIH.security.JwtAuthTokenFilter;
import sn.uasz.User_API_PVVIH.services.UserDetailsServiceImpl;

import java.util.Arrays;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthTokenFilter jwtAuthTokenFilter;
    private final UserDetailsServiceImpl userDetailsService;

    public SecurityConfig(JwtAuthTokenFilter jwtAuthTokenFilter, UserDetailsServiceImpl userDetailsService) {
        this.jwtAuthTokenFilter = jwtAuthTokenFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // OPTIONS doit être en premier pour les requêtes preflight CORS
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Auth endpoints publics (login, register, reset password)
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        // Routes protégées
                        .requestMatchers("/api/user/**").authenticated()
                        .requestMatchers("/api/references/**").authenticated()
                        .requestMatchers("/api/patients/**").authenticated()
                        .requestMatchers("/api/doctors/**").authenticated()
                        .requestMatchers("/api/membres/**").authenticated()
                        .requestMatchers("/api/hospitaux/**").authenticated()
                        .requestMatchers("/api/associations/**").authenticated()
                        .requestMatchers("/api/assistants/**").authenticated()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Configuration CORS pour autoriser le frontend React
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Récupérer les origines autorisées depuis les variables d'environnement
        String allowedOriginsEnv = System.getenv("CORS_ALLOWED_ORIGINS");
        
        List<String> allowedOrigins;
        if (allowedOriginsEnv != null && !allowedOriginsEnv.isEmpty()) {
            // Utiliser les origines depuis l'environnement (production)
            allowedOrigins = Arrays.asList(allowedOriginsEnv.split(","));
        } else {
            // Origines par défaut pour le développement local
            allowedOrigins = Arrays.asList(
                    // Accès depuis le navigateur (externe à Docker)
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
                    "http://localhost:3001",
                    "http://127.0.0.1:3001",
                    "http://localhost:3002",
                    "http://127.0.0.1:3002",
                    "http://localhost:3003",
                    "http://localhost:3004",
                    "http://localhost:4000",
                    "http://127.0.0.1:4000",
                    "http://localhost:8080",
                    "http://localhost:8081",
                    // Communication interne Docker
                    "http://gateway-pvvih:8080",
                    "http://gestion-forum-front",
                    "http://a-reference-front",
                    "http://a-user-front"
            );
        }

        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "Origin",
                "X-Requested-With", "Access-Control-Request-Method",
                "Access-Control-Request-Headers"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Disposition"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // Cache preflight requests for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
