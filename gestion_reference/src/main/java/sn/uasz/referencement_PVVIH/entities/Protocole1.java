package sn.uasz.referencement_PVVIH.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")

@Entity
@Table(name = "protocole1")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Protocole1 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String protocole1ereLigne;
    private Date dateProtocole1;

    @ManyToOne
    @JoinColumn(name = "renseignementClinique_id")
    @JsonBackReference
    private RenseignementClinique renseignementClinique;

}
