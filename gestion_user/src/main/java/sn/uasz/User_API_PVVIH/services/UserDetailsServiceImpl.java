package sn.uasz.User_API_PVVIH.services;

import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import sn.uasz.User_API_PVVIH.entities.User;
import sn.uasz.User_API_PVVIH.repositories.UserRepository;

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

        String role = (user.getProfil() != null && !user.getProfil().isBlank())
                ? user.getProfil() : "USER";
        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getUsername())
            .password(user.getPassword())
            .roles(role)
            .disabled(!Boolean.TRUE.equals(user.getActive()))
            .build();
    }
}
