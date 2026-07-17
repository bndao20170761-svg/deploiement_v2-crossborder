package sn.uasz.referencement_PVVIH.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import sn.uasz.referencement_PVVIH.security.JwtAuthTokenFilter;
import sn.uasz.referencement_PVVIH.services.UserDetailsServiceImpl;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    /**
     * ⚠️ NOTE IMPORTANTE : Ce service NE DOIT PAS être utilisé pour l'authentification
     * Il est conservé uniquement pour la compatibilité, mais l'authentification
     * doit être gérée par gestion_user
     */
    private final UserDetailsServiceImpl userDetailsService;

    public SecurityConfig(UserDetailsServiceImpl userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    /**
     * ⚠️ AuthenticationManager désactivé - l'authentification est gérée par gestion_user
     * Ce bean est commenté pour éviter les tentatives d'authentification locale
     */
    // @Bean
    // public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
    //     return config.getAuthenticationManager();
    // }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean("jwtOnlyUserDetailsService")
    public sn.uasz.referencement_PVVIH.services.JwtOnlyUserDetailsService jwtOnlyUserDetailsService(sn.uasz.referencement_PVVIH.security.JwtUtils jwtUtils) {
        return new sn.uasz.referencement_PVVIH.services.JwtOnlyUserDetailsService(jwtUtils);
    }

    @Bean
    public JwtAuthTokenFilter jwtAuthTokenFilter(sn.uasz.referencement_PVVIH.security.JwtUtils jwtUtils, 
                                                 UserDetailsServiceImpl userDetailsService,
                                                 @Qualifier("jwtOnlyUserDetailsService") UserDetailsService jwtOnlyUserDetailsService) {
        return new JwtAuthTokenFilter(jwtUtils, userDetailsService, jwtOnlyUserDetailsService);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthTokenFilter jwtAuthTokenFilter) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // CORS activé ici
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/user/**").authenticated()
                        .requestMatchers("/api/references/**").authenticated()
                        .requestMatchers("/api/integration/**").authenticated() // ✅ Endpoints FeignClient
                        .requestMatchers("/api/hopitaux-proxy/**").authenticated() // ✅ Endpoints HopitalProxy
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/api/proxy/user/**").authenticated()
                        .requestMatchers("/api/commentaires/**").authenticated()
                        .requestMatchers("/api/sujets/**").authenticated()
                        .requestMatchers("/api/patients/**").authenticated()
                        .requestMatchers("/api/patients/**").authenticated()// protéger les routes patients
                        .requestMatchers("/api/doctors/**").authenticated() // protéger les routes patients

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
