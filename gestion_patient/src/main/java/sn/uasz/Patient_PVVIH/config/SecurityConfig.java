package sn.uasz.Patient_PVVIH.config;

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
import sn.uasz.Patient_PVVIH.config.JwtAuthTokenFilter;
import sn.uasz.Patient_PVVIH.security.JwtUtils;
import sn.uasz.Patient_PVVIH.services.JwtOnlyUserDetailsService;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtUtils jwtUtils;
    private final JwtOnlyUserDetailsService jwtOnlyUserDetailsService;

    public SecurityConfig(JwtUtils jwtUtils, JwtOnlyUserDetailsService jwtOnlyUserDetailsService) {
        this.jwtUtils = jwtUtils;
        this.jwtOnlyUserDetailsService = jwtOnlyUserDetailsService;
    }

    @Bean
    public JwtAuthTokenFilter jwtAuthTokenFilter() {
        return new JwtAuthTokenFilter(jwtUtils);
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
                        .requestMatchers("/api/user/**").authenticated()
                        .requestMatchers("/api/references/**").authenticated()
                        .requestMatchers("/api/user-integration/**").authenticated() // ✅ Nouveaux endpoints d'intégration
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/api/patients/**").authenticated()
                        .requestMatchers("/api/doctors/**").authenticated()
                        .requestMatchers("/api/dossiers/**").authenticated() // ✅ Endpoints dossiers médicaux

                        .anyRequest().authenticated()
                )

                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Configuration CORS pour autoriser le frontend React
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000", 
                "http://localhost:3001", 
                "http://localhost:3002",
                "http://localhost:3003",
                "http://127.0.0.1:3000", 
                "http://127.0.0.1:3001",
                "http://127.0.0.1:3002",
                "http://gateway-pvvih:8080",
                "http://gestion-forum-front",
                "http://a-reference-front",
                "http://a-user-front"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true); // utile si tu gères les cookies ou headers d’authentification

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
