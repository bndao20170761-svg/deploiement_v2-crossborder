package sn.uaz.Forum_PVVIH.entities;

import lombok.*;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserInfo {
    
    @Field("id")
    private String id;
    
    @Field("username")
    private String username;
    
    @Field("email")
    private String email;
    
    @Field("nom")
    private String nom;
    
    @Field("prenom")
    private String prenom;
    
    @Field("profil")
    private String profil;
}












