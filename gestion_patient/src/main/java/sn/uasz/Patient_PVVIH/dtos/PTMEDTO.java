package sn.uasz.Patient_PVVIH.dtos;

import lombok.Data;

@Data
public class PTMEDTO {

    private Long id;

    // --- Champs grossesses ---
    private String dateDiagnostic;

    private String rangCpn; // Rang CPN

    private String dateProbableAcc; // Date probable d’accouchement

    private String issue; // Issue de la grossesse

    private String dateReelle; // Date réelle d’accouchement

    private String modeAcc; // Mode d’accouchement

    private String allaitement; // Oui/Non

    private String prophylaxie; // Type de prophylaxie donnée

    private String protocole; // Protocole ARV

    private String dateDebutProtocole;

    private String pcr1; // PCR1 (Oui/Non)

    private String datePrelPcr; // Date prélèvement PCR

    private String resultatPcr; // Résultat PCR

    private String serologie; // Oui/Non

    private String datePrelSero; // Date prélèvement sérologie

    private String resultatSero; // Résultat sérologie

    // --- Relation simplifiée ---
    private Long pageId;
}
