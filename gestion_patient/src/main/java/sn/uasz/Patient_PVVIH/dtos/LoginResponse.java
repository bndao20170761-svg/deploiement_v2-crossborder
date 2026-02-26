package sn.uasz.Patient_PVVIH.dtos;

public class LoginResponse {
    private String token;

    // Obligatoire pour Jackson
    public LoginResponse() {}

    public LoginResponse(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
