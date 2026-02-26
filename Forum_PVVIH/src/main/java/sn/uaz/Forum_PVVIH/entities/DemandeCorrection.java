package sn.uaz.Forum_PVVIH.entities;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "demandes_correction")
public class DemandeCorrection {
    
    @Id
    private String id;
    
    @DBRef
    private Sujet sujet;
    
    private String langueCible;
    
    @DBRef
    private User utilisateur; // Celui qui signale
    
    @NotBlank(message = "La raison est obligatoire")
    private String raison; // IMPRECIS, INCOMPREHENSIBLE, TERME_MEDICAL
    
    private String commentaire;
    
    @Builder.Default
    private String statut = "OUVERTE"; // OUVERTE, EN_COURS, CORRIGEE
    
    @DBRef
    private User traducteur; // Celui qui corrige
    
    @Builder.Default
    private LocalDateTime dateDemande = LocalDateTime.now();
    
    private LocalDateTime dateCorrection;
}