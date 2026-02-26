package sn.uasz.User_API_PVVIH.dtos;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    /** Alias pour le frontend qui envoie "email" au lieu de "username" */
    private String email;
    private String password;
}
