package sn.uasz.User_API_PVVIH.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "assistant_social")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssistantSocial {

    @Id
    @Column(name = "code_assistant")
    private String codeAssistant;



    @Column(nullable = false)
    private String email;

    @Column(name = "lieu_exercice", nullable = false)
    private String lieuExercice;

    @Column(nullable = false)
    private String pseudo;

    @Column(nullable = false)
    private String telephone;

    @ManyToOne
    @JoinColumn(name = "id_hopital")
    private Hopital hopital;

    @ManyToOne
    @JoinColumn(name = "utilisateur")
    private User utilisateur;
}
