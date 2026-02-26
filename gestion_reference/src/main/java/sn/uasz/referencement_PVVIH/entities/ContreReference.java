package sn.uasz.referencement_PVVIH.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(name = "contre_reference")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContreReference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Date date;
    private Boolean etat;

    @ManyToOne
    @JoinColumn(name = "reference")
    private Reference reference;
}
