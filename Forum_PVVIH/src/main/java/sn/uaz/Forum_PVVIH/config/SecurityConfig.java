package sn.uaz.Forum_PVVIH.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import sn.uaz.Forum_PVVIH.services.UserDetailsServiceImpl;
import sn.uaz.Forum_PVVIH.security.JwtAuthTokenFilter;

import java.util.Arrays;

@Configuration
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
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // CORS activé ici
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/test/**").permitAll() // Routes de test
                        .requestMatchers("/api/auth/**").permitAll()
                        // Endpoints publics pour les sujets (doivent être avant /api/sujets/**)
                        .requestMatchers("/api/sujets").permitAll() // Lecture publique des sujets pour la HomePage
                        .requestMatchers("/api/sujets/recents").permitAll() // Sujets récents publics
                        .requestMatchers("/api/sujets/section/**").permitAll() // Sujets par section publics
                        .requestMatchers("/api/sujets/sections").permitAll() // Sections publiques pour autocomplétion
                        .requestMatchers("/api/sujets/actifs").permitAll() // Sujets actifs publics
                        .requestMatchers("/api/sujets/inactifs").permitAll() // Sujets inactifs publics
                        .requestMatchers("/api/sujets/*/lire").permitAll() // Lecture publique d'un sujet spécifique
                        // Endpoints publics pour les commentaires
                        .requestMatchers("/api/commentaires/sujet/*").permitAll() // Lecture publique des commentaires
                        .requestMatchers("/api/commentaires/sujet/*/all").permitAll() // Lecture publique de tous les commentaires
                        .requestMatchers("/api/commentaires/notifications/*").permitAll() // Notifications publiques
                        .requestMatchers("/api/commentaires/notifications/*/count").permitAll() // Compteur de notifications public
                        // Endpoints publics pour les traductions
                        .requestMatchers("/api/translations/translate").permitAll() // Traduction publique
                        .requestMatchers("/api/translations/sujet/*").permitAll() // Traductions des sujets publiques
                        .requestMatchers("/api/translations/commentaire/*").permitAll() // Traductions des commentaires publiques
                        .requestMatchers("/api/translations/health").permitAll() // Santé des services de traduction
                        // Endpoints authentifiés
                        .requestMatchers("/api/sujets/user/**").authenticated() // Modification par ID utilisateur nécessite une auth
                        .requestMatchers("/api/sujets/*/activer").authenticated() // Activation nécessite une auth
                        .requestMatchers("/api/sujets/*/desactiver").authenticated() // Désactivation nécessite une auth
                        .requestMatchers("/api/sujets/**").authenticated() // Autres opérations sur les sujets nécessitent une auth
                        .requestMatchers("/api/user/**").authenticated()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/api/references/**").authenticated()
                        .requestMatchers("/api/proxy/user/**").authenticated()
                        .requestMatchers("/api/commentaires").authenticated() // Création et suppression de commentaires nécessitent une auth
                        .requestMatchers("/api/translations/*/approve").authenticated() // Approbation des traductions nécessite une auth
                        .requestMatchers("/api/translations").authenticated() // Autres opérations sur les traductions nécessitent une auth
                        .requestMatchers("/api/auteur/**").authenticated()
                        .requestMatchers("/api/translation/**").authenticated()
                        .requestMatchers("/api/patients/**").authenticated()
                        .requestMatchers("/api/doctors/**").authenticated()
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
