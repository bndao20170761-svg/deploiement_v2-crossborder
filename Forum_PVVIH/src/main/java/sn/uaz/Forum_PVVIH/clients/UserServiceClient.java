package sn.uaz.Forum_PVVIH.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "gestion-user", url = "${gestion.user.url}")
public interface UserServiceClient {

    @GetMapping("/api/users/username/{username}")
    UserInfoResponse getUserByUsername(@PathVariable("username") String username, 
                                     @RequestHeader("Authorization") String token);
    
    @GetMapping("/api/users/id/{id}")
    UserInfoResponse getUserById(@PathVariable("id") Long id, 
                                @RequestHeader("Authorization") String token);
    
    // Classe interne pour représenter les données utilisateur
    class UserInfoResponse {
        private Long id;
        private String username;
        private String email;
        private String nom;
        private String prenom;
        
        // Constructeurs
        public UserInfoResponse() {}
        
        public UserInfoResponse(Long id, String username, String email, String nom, String prenom) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.nom = nom;
            this.prenom = prenom;
        }
        
        // Getters et Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }
        
        public String getPrenom() { return prenom; }
        public void setPrenom(String prenom) { this.prenom = prenom; }
    }
}
