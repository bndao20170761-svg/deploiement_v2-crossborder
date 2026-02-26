package sn.uasz.referencement_PVVIH.dtos;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RenseignementCliniqueDto {
    private Long id;
    private String aghbs;
    private String allergie;
    private Boolean autreAnalyse;
    private Boolean autreTraitement;
    private String cd4DebutTraitement;
    private String cd4Dernier;
    private String cd4Inclusion;
    private String chargeViraleNiveau;
    private String cracheBaar;
    private String creatinemie;
    private Date date;
    private Date dateAutreAnalyse;
    private Date dateCd4DebutTraitement;


    private Date dateCd4Dernier;
    private Date dateCd4Inclusion;
    private Date dateDebutChargeVirale;
    private Date dateCracheBaar;
    private Date dateCreatinemie;
    private Date dateHb;
    private Date dateDebutARV;
    private String hbNiveau;
    private String poidsKg;
    private String resultatTrans;
    private Boolean traitementARV;
    private Boolean traitementtb;
    private String transaminase;
    private Date dateTransaminase;
    private String transaminaseAlat;
    private String transaminaseAsat;
    private Date dateAghbs;


    private List<Protocole1Dto> protocoles1s;
    private List<Protocole2Dto> protocoles2s;
    private List<ProtocoleTherapDto> protocolesTheraps;
    private List<RenseignementProfilDto> profils;
    private List<RenseignementStadeDto> stades;
}
