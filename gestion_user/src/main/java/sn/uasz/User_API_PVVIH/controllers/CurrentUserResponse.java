package sn.uasz.User_API_PVVIH.controllers;

public class CurrentUserResponse {
    private String prenom;
    private String nom;
    private String username;
    private String profil;

    public CurrentUserResponse(String prenom, String nom,String profil, String username) {
        this.prenom = prenom;
        this.nom = nom;
        this.username = username;
        this.profil=profil;
    }

    // getters et setters
    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getProfil() {
        return profil;
    }

    public void setProfil(String profil) {
        this.profil = profil;
    }
}
