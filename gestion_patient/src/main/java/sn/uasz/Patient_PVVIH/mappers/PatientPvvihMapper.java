package sn.uasz.Patient_PVVIH.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import sn.uasz.Patient_PVVIH.entities.*;
import sn.uasz.Patient_PVVIH.dtos.*;
@Mapper(componentModel = "spring")
public interface PatientPvvihMapper {

    // Bilan
    BilanDTO toBilanDTO(Bilan bilan);
    Bilan toBilan(BilanDTO dto);

    // Dépistage familiale
    DepistageFamilialeDTO toDepistageFamilialeDTO(DepistageFamiliale depistage);
    DepistageFamiliale toDepistageFamiliale(DepistageFamilialeDTO dto);

    // Index Test
    IndexTestDTO toIndexTestDTO(IndexTest indexTest);
    IndexTest toIndexTest(IndexTestDTO dto);

    // Page
    @Mapping(source = "dossier.codeDossier", target = "dossierCode")
    PageDTO toPageDTO(Page page);
    @Mapping(source = "dossierCode", target = "dossier.codeDossier")
    Page toPage(PageDTO dto);

    // Prise en charge TB
    PriseEnChargeTbDTO toPriseEnChargeTbDTO(PriseEnChargeTb tb);
    PriseEnChargeTb toPriseEnChargeTb(PriseEnChargeTbDTO dto);

    // Suivi immunovirologique
    SuiviImmunovirologiqueDTO toSuiviImmunovirologiqueDTO(Suivi_Immunovirologique suivi);
    Suivi_Immunovirologique toSuiviImmunovirologique(SuiviImmunovirologiqueDTO dto);

    // Suivi ARV
    SuiviARVDTO toSuiviARVDTO(SuiviARV suiviArv);
    SuiviARV toSuiviARV(SuiviARVDTO dto);

    // Suivi pathologique
    SuiviPathologiqueDTO toSuiviPathologiqueDTO(SuiviPathologique suivi);
    SuiviPathologique toSuiviPathologique(SuiviPathologiqueDTO dto);

    // PTME
    PTMEDTO toPtmeDTO(PTME ptme);
    PTME toPtme(PTMEDTO dto);

    // Dossier
    DossierDTO toDossierDTO(Dossier dossier);
    Dossier toDossier(DossierDTO dto);
    // --- À AJOUTER ---

    // DossierView (pour la réponse frontend)
    @Mapping(source = "patientCode", target = "codePatient")
    @Mapping(target = "nomComplet", expression = "java(dossier.getPatient() != null && dossier.getPatient().getUtilisateur() != null ? dossier.getPatient().getUtilisateur().getNom() + \" \" + dossier.getPatient().getUtilisateur().getPrenom() : dossier.getPatient() != null ? dossier.getPatient().getPseudo() : \"\")")
    @Mapping(target = "doctorCreateNom", expression = "java(dossier.getDoctorCreate() != null && dossier.getDoctorCreate().getUtilisateur() != null ? dossier.getDoctorCreate().getUtilisateur().getNom() + \" \" + dossier.getDoctorCreate().getUtilisateur().getPrenom() : \"\")")
    DossierViewDto toDossierViewDto(Dossier dossier);



}
