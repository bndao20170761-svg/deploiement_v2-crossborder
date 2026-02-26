package sn.uasz.referencement_PVVIH.controllers;

public class CurrentUserResponse {
    private String prenom;
    private String nom;
    private String username;

    public CurrentUserResponse(String prenom, String nom, String username) {
        this.prenom = prenom;
        this.nom = nom;
        this.username = username;
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
}
