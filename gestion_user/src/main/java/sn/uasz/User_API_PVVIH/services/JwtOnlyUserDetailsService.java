package sn.uasz.User_API_PVVIH.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import sn.uasz.User_API_PVVIH.security.JwtUtils;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
public class JwtOnlyUserDetailsService implements UserDetailsService {

    private final JwtUtils jwtUtils;

    public JwtOnlyUserDetailsService(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("🔍 JwtOnlyUserDetailsService: Chargement utilisateur JWT: {}", username);
        
        // Pour les appels inter-services, on crée un utilisateur virtuel
        // avec les autorités qui seront extraites du JWT
        return User.builder()
                .username(username)
                .password("") // Pas de mot de passe nécessaire pour JWT
                .authorities(getDefaultAuthorities())
                .build();
    }

    private Collection<? extends GrantedAuthority> getDefaultAuthorities() {
        // Autorités par défaut pour les appels inter-services
        return List.of(
                new SimpleGrantedAuthority("ROLE_DOCTOR"),
                new SimpleGrantedAuthority("ROLE_ADMIN"),
                new SimpleGrantedAuthority("ROLE_ASSISTANT")
        );
    }
}