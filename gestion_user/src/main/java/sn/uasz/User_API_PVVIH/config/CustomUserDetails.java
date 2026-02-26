package sn.uasz.User_API_PVVIH.config;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import sn.uasz.User_API_PVVIH.entities.User;

import java.util.Collection;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class CustomUserDetails implements UserDetails {

    private User user;

    // supprime ce constructeur, il est déjà généré par Lombok
    // public CustomUserDetails(User user) {
    //     this.user = user;
    // }

    public String getPrenom() {
        return user.getPrenom();
    }

    public String getNom() {
        return user.getNom();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return null;
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.getActive() != null && user.getActive();
    }
}
