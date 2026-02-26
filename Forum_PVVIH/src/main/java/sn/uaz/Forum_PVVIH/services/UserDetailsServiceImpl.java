package sn.uaz.Forum_PVVIH.services;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Implémentation basique - à adapter selon vos besoins
        // Ici, vous pourriez récupérer l'utilisateur via UserProxyService ou une base de données
        if ("user".equals(username)) {
            return org.springframework.security.core.userdetails.User.builder()
                    .username(username)
                    .password("{noop}password") // Mot de passe encodé
                    .roles("USER")
                    .build();
        } else {
            throw new UsernameNotFoundException("User not found: " + username);
        }
    }
}
