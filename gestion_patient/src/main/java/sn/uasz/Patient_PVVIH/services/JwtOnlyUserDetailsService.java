package sn.uasz.Patient_PVVIH.services;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service UserDetails qui ne fait que créer un utilisateur basé sur le JWT
 * sans chercher dans la base de données locale.
 * Utilisé pour les microservices qui n'ont pas leurs propres utilisateurs.
 */
@Service("jwtOnlyUserDetailsService")
public class JwtOnlyUserDetailsService implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Pour les microservices, on crée un utilisateur générique
        // Les vraies informations viennent du JWT
        return User.builder()
                .username(username)
                .password("") // Pas de mot de passe car on utilise JWT
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_USER")))
                .build();
    }
}