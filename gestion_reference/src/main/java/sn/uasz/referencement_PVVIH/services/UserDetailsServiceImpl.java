package sn.uasz.referencement_PVVIH.services;

import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import sn.uasz.referencement_PVVIH.entities.User;
import sn.uasz.referencement_PVVIH.repositories.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository repo) {
        this.userRepository = repo;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getUsername())
            .password(user.getPassword())
            .roles(user.getProfil())  // rôle sans ROLE_ prefix si tu veux ajouter
            .build();
    }
}
