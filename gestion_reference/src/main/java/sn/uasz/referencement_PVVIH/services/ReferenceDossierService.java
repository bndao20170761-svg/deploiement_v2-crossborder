package sn.uasz.referencement_PVVIH.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.uasz.referencement_PVVIH.dtos.ReferenceDossierDto;
import sn.uasz.referencement_PVVIH.dtos.DossierViewDto;
import sn.uasz.referencement_PVVIH.entities.Doctor;
import sn.uasz.referencement_PVVIH.entities.ReferenceDossier;
import sn.uasz.referencement_PVVIH.entities.User;
import sn.uasz.referencement_PVVIH.mappers.ReferenceDossierMapper;
import sn.uasz.referencement_PVVIH.repositories.ReferenceDossierRepository;
import sn.uasz.referencement_PVVIH.services.ReferenceServiceHelper;
import sn.uasz.referencement_PVVIH.feign.DossierClient;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ReferenceDossierService {
    
    private final ReferenceDossierRepository referenceDossierRepository;
    private final ReferenceDossierMapper referenceDossierMapper;
    private final DossierClient dossierClient;
    private final ReferenceServiceHelper referenceServiceHelper;
    private final ReferenceDossierClinicalService clinicalService;

    private String getAuthenticatedUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        return authentication.getName();
    }

    private Optional<Doctor> getAuthenticatedDoctor() {
        String username = getAuthenticatedUsername();
        if (username == null) {
            return Optional.empty();
        }
        return referenceServiceHelper.findDoctorByUsername(username);
    }
    
    public List<ReferenceDossierDto> getAllReferences() {
        List<ReferenceDossier> references = referenceDossierRepository.findAll();
        return references.stream()
                .map(referenceDossierMapper::entityToDto)
                .toList();
    }
    
    public Optional<ReferenceDossierDto> getReferenceByCode(String codeReference) {
        return referenceDossierRepository.findByCodeReference(codeReference)
                .map(referenceDossierMapper::entityToDto);
    }
    
    public List<ReferenceDossierDto> getReferencesByPatient(String codePatient) {
        List<ReferenceDossier> references = referenceDossierRepository.findByCodePatientOrderByDateCreationDesc(codePatient);
        return references.stream()
                .map(referenceDossierMapper::entityToDto)
                .toList();
    }
    
    public List<ReferenceDossierDto> getReferencesByHopital(String codeHopital) {
        List<ReferenceDossier> references = referenceDossierRepository.findByCodeHopital(codeHopital);
        return references.stream()
                .map(referenceDossierMapper::entityToDto)
                .toList();
    }
    
    public List<ReferenceDossierDto> getReferencesByDoctor(String codeDocteur) {
        List<ReferenceDossier> references = referenceDossierRepository.findByCodeDocteur(codeDocteur);
        return references.stream()
                .map(referenceDossierMapper::entityToDto)
                .toList();
    }
    
    public List<ReferenceDossierDto> getReferencesByStatut(String statut) {
        List<ReferenceDossier> references = referenceDossierRepository.findByStatutOrderByDateCreationDesc(statut);
        return references.stream()
                .map(referenceDossierMapper::entityToDto)
                .toList();
    }
    
    public List<ReferenceDossierDto> getReferencesRecues() {
        Optional<Doctor> currentDoctor = getAuthenticatedDoctor();
        if (currentDoctor.isEmpty()) {
            return List.of();
        }
        Doctor doctor = currentDoctor.get();
        
        // Références reçues : celles où le médecin est le destinataire (code_docteur)
        List<ReferenceDossier> references = referenceDossierRepository.findByCodeDocteur(doctor.getCodeDoctor());
        
        // Filtrer seulement celles validées
        return references.stream()
                .filter(ref -> Boolean.TRUE.equals(ref.getValidation()))
                .map(referenceDossierMapper::entityToDto)
                .toList();
    }
    
    public List<ReferenceDossierDto> getReferencesEnvoyees() {
        Optional<Doctor> currentDoctor = getAuthenticatedDoctor();
        if (currentDoctor.isEmpty()) {
            return List.of();
        }
        Doctor doctor = currentDoctor.get();
        
        // Références envoyées : celles où le médecin est l'auteur (code_referenceur)
        List<ReferenceDossier> references = referenceDossierRepository.findByCodeReferenceur(doctor.getCodeDoctor());
        
        // Filtrer seulement celles validées
        return references.stream()
                .filter(ref -> Boolean.TRUE.equals(ref.getValidation()))
                .filter(ref -> Boolean.FALSE.equals(ref.getEtat()))
                .map(referenceDossierMapper::entityToDto)
                .toList();
    }
    
    public List<ReferenceDossierDto> getReferencesEnAttente() {
        return getReferencesByStatut("EN_ATTENTE");
    }
    
    public ReferenceDossierDto createReference(ReferenceDossierDto referenceDossierDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            referenceServiceHelper.findDoctorByUsername(username).ifPresent(doctor -> {
                // Code de référenceur
                if (referenceDossierDto.getCodeReferenceur() == null || referenceDossierDto.getCodeReferenceur().isBlank()) {
                    referenceDossierDto.setCodeReferenceur(doctor.getCodeDoctor());
                }
                // Nom du référenceur : construire proprement sans concaténer des null/undefined
                if (isBlankOrUndefined(referenceDossierDto.getNomReferenceur())) {
                    String nomUtil = null;
                    if (doctor.getUtilisateur() != null) {
                        String nom = doctor.getUtilisateur().getNom() != null ? doctor.getUtilisateur().getNom().trim() : "";
                        String prenom = doctor.getUtilisateur().getPrenom() != null ? doctor.getUtilisateur().getPrenom().trim() : "";
                        String full = (nom + " " + prenom).trim();
                        if (!isBlankOrUndefined(full)) {
                            nomUtil = full;
                        }
                    }
                    if (nomUtil != null) {
                        referenceDossierDto.setNomReferenceur(nomUtil);
                    } else if (doctor.getPseudo() != null && !doctor.getPseudo().isBlank()) {
                        referenceDossierDto.setNomReferenceur(doctor.getPseudo());
                    } else {
                        referenceDossierDto.setNomReferenceur(doctor.getCodeDoctor());
                    }
                }
                if ((referenceDossierDto.getTelephoneReferenceur() == null || referenceDossierDto.getTelephoneReferenceur().isBlank()) && doctor.getTelephone() != null) {
                    referenceDossierDto.setTelephoneReferenceur(doctor.getTelephone());
                }
                if ((referenceDossierDto.getEmailReferenceur() == null || referenceDossierDto.getEmailReferenceur().isBlank()) && doctor.getEmail() != null) {
                    referenceDossierDto.setEmailReferenceur(doctor.getEmail());
                }
                // Remplir l'hôpital d'origine (référenceur) si disponible
                if ((referenceDossierDto.getCodeHopitalReferenceur() == null || referenceDossierDto.getCodeHopitalReferenceur().isBlank())
                        && doctor.getHopital() != null && doctor.getHopital().getId() != null) {
                    referenceDossierDto.setCodeHopitalReferenceur(String.valueOf(doctor.getHopital().getId()));
                }
                if ((referenceDossierDto.getNomHopitalReferenceur() == null || referenceDossierDto.getNomHopitalReferenceur().isBlank())
                        && doctor.getHopital() != null && doctor.getHopital().getNom() != null) {
                    referenceDossierDto.setNomHopitalReferenceur(doctor.getHopital().getNom());
                }
            });
            referenceServiceHelper.findUserByUsername(username).ifPresent(user -> {
                if ((referenceDossierDto.getCodeReferenceur() == null || referenceDossierDto.getCodeReferenceur().isBlank()) && user.getUsername() != null) {
                    referenceDossierDto.setCodeReferenceur(user.getUsername());
                }
                if (isBlankOrUndefined(referenceDossierDto.getNomReferenceur())) {
                    String nom = user.getNom() != null ? user.getNom().trim() : "";
                    String prenom = user.getPrenom() != null ? user.getPrenom().trim() : "";
                    String full = (nom + " " + prenom).trim();
                    if (!isBlankOrUndefined(full)) {
                        referenceDossierDto.setNomReferenceur(full);
                    }
                }
                if ((referenceDossierDto.getTelephoneReferenceur() == null || referenceDossierDto.getTelephoneReferenceur().isBlank()) && user.getTelephone() != null) {
                    referenceDossierDto.setTelephoneReferenceur(user.getTelephone());
                }
                if ((referenceDossierDto.getEmailReferenceur() == null || referenceDossierDto.getEmailReferenceur().isBlank()) && user.getEmail() != null) {
                    referenceDossierDto.setEmailReferenceur(user.getEmail());
                }
            });
        }

        if (isBlankOrUndefined(referenceDossierDto.getNomDocteur()) && referenceDossierDto.getCodeDocteur() != null) {
            referenceServiceHelper.findDoctorByCode(referenceDossierDto.getCodeDocteur()).ifPresent(targetDoctor -> {
                String built = null;
                if (targetDoctor.getUtilisateur() != null) {
                    String nom = targetDoctor.getUtilisateur().getNom() != null ? targetDoctor.getUtilisateur().getNom().trim() : "";
                    String prenom = targetDoctor.getUtilisateur().getPrenom() != null ? targetDoctor.getUtilisateur().getPrenom().trim() : "";
                    String full = (nom + " " + prenom).trim();
                    if (!isBlankOrUndefined(full)) {
                        built = full;
                    }
                }
                if (built != null) {
                    referenceDossierDto.setNomDocteur(built);
                } else if (targetDoctor.getPseudo() != null && !targetDoctor.getPseudo().isBlank()) {
                    referenceDossierDto.setNomDocteur(targetDoctor.getPseudo());
                } else {
                    referenceDossierDto.setNomDocteur(targetDoctor.getCodeDoctor());
                }
            });
        }

        // Générer un code de référence unique
        String codeReference = generateCodeReference();
        referenceDossierDto.setCodeReference(codeReference);
        referenceDossierDto.setStatut("EN_ATTENTE");
        referenceDossierDto.setDateCreation(LocalDateTime.now());
        referenceDossierDto.setEtat(false);
        referenceDossierDto.setValidation(true);
        
        // Créer l'entité principale
        ReferenceDossier referenceDossier = referenceDossierMapper.dtoToEntity(referenceDossierDto);
        ReferenceDossier savedReference = referenceDossierRepository.save(referenceDossier);
        
        // Sauvegarder les données cliniques avec le service spécialisé
        clinicalService.saveClinicalData(savedReference, referenceDossierDto);
        
        // Convertir en DTO et enrichir avec informations patient non persistées
        ReferenceDossierDto resultDto = referenceDossierMapper.entityToDto(savedReference);
        
        // Ajouter les données cliniques
        ReferenceDossierDto clinicalData = clinicalService.getClinicalData(savedReference.getId());
        resultDto.setMotifs(clinicalData.getMotifs());
        resultDto.setProtocoles1s(clinicalData.getProtocoles1s());
        resultDto.setProtocoles2s(clinicalData.getProtocoles2s());
        resultDto.setProtocolesTheraps(clinicalData.getProtocolesTheraps());
        resultDto.setProfils(clinicalData.getProfils());
        resultDto.setStades(clinicalData.getStades());
        try {
            referenceServiceHelper.findPatientByCode(savedReference.getCodePatient()).ifPresent(patient -> {
                if (patient.getDateNaissance() != null) {
                    resultDto.setDateNaissance(patient.getDateNaissance().toInstant().toString());
                }
                resultDto.setAge(patient.getAge());
                resultDto.setSexe(patient.getSexe());
                resultDto.setProfession(patient.getProfession());
                resultDto.setTelephone(patient.getTelephone());
                // nationalite not available in Patient entity; leave null if unknown
            });
        } catch (Exception e) {
            // Ne pas bloquer la création si l'enrichissement échoue
            System.err.println("Erreur enrichment patient pour référence: " + e.getMessage());
        }

        return resultDto;
    }

    private boolean isBlankOrUndefined(String s) {
        if (s == null) return true;
        String trimmed = s.trim();
        if (trimmed.isBlank()) return true;
        // Consider any occurrence of the tokens "undefined" or "null" as invalid input
        String lower = trimmed.toLowerCase();
        if (lower.equals("undefined") || lower.equals("null")) return true;
        if (lower.contains("undefined") || lower.contains("null")) return true;
        return false;
    }
    public ReferenceDossierDto updateReference(String codeReference, ReferenceDossierDto referenceDossierDto) {
        Optional<ReferenceDossier> existingReference = referenceDossierRepository.findByCodeReference(codeReference);
        if (existingReference.isPresent()) {
            ReferenceDossier reference = existingReference.get();
            referenceDossierDto.setDateModification(LocalDateTime.now());
            
            // Mettre à jour les champs modifiables
            reference.setMotifReference(referenceDossierDto.getMotifReference());
            reference.setTypeReference(referenceDossierDto.getTypeReference());
            reference.setDateReference(referenceDossierDto.getDateReference());
            reference.setDatePriseEnCharge(referenceDossierDto.getDatePriseEnCharge());
            reference.setStatut(referenceDossierDto.getStatut());
            reference.setObservations(referenceDossierDto.getObservations());
            reference.setCodeReferenceur(referenceDossierDto.getCodeReferenceur());
            reference.setNomReferenceur(referenceDossierDto.getNomReferenceur());
            reference.setTelephoneReferenceur(referenceDossierDto.getTelephoneReferenceur());
            reference.setEmailReferenceur(referenceDossierDto.getEmailReferenceur());
            reference.setDateModification(LocalDateTime.now());
            
            ReferenceDossier updatedReference = referenceDossierRepository.save(reference);
            return referenceDossierMapper.entityToDto(updatedReference);
        }
        throw new RuntimeException("Référence non trouvée avec le code: " + codeReference);
    }
    
    public void deleteReference(String codeReference) {
        referenceDossierRepository.deleteByCodeReference(codeReference);
    }
    
    /**
     * Vérifie si le médecin connecté peut accepter cette référence
     * Le médecin doit être celui à qui la référence a été adressée (code_docteur)
     */
    public boolean canAcceptReference(String codeReference) {
        Optional<Doctor> currentDoctor = getAuthenticatedDoctor();
        if (currentDoctor.isEmpty()) {
            return false;
        }
        
        Optional<ReferenceDossier> reference = referenceDossierRepository.findByCodeReference(codeReference);
        if (reference.isEmpty()) {
            return false;
        }
        
        String currentDoctorCode = currentDoctor.get().getCodeDoctor();
        String targetDoctorCode = reference.get().getCodeDocteur();
        
        return currentDoctorCode.equals(targetDoctorCode);
    }
    
    /**
     * Vérifie si le médecin connecté peut modifier cette référence
     * Le médecin doit être celui qui a créé la référence (code_referenceur)
     */
    public boolean canEditReference(String codeReference) {
        Optional<Doctor> currentDoctor = getAuthenticatedDoctor();
        if (currentDoctor.isEmpty()) {
            return false;
        }
        
        Optional<ReferenceDossier> reference = referenceDossierRepository.findByCodeReference(codeReference);
        if (reference.isEmpty()) {
            return false;
        }
        
        String currentDoctorCode = currentDoctor.get().getCodeDoctor();
        String authorDoctorCode = reference.get().getCodeReferenceur();
        
        return currentDoctorCode.equals(authorDoctorCode);
    }
    
    /**
     * Accepte une référence de dossier
     * Seul le médecin destinataire peut accepter
     */
    public ReferenceDossierDto accepterReference(String codeReference) {
        Optional<Doctor> currentDoctor = getAuthenticatedDoctor();
        if (currentDoctor.isEmpty()) {
            throw new RuntimeException("Médecin non authentifié");
        }
        
        Optional<ReferenceDossier> existingReference = referenceDossierRepository.findByCodeReference(codeReference);
        if (existingReference.isEmpty()) {
            throw new RuntimeException("Référence non trouvée avec le code: " + codeReference);
        }
        
        ReferenceDossier reference = existingReference.get();
        Doctor doctor = currentDoctor.get();
        
        // Vérifier que le médecin connecté est bien le destinataire
        if (!doctor.getCodeDoctor().equals(reference.getCodeDocteur())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à accepter cette référence");
        }
        
        reference.setStatut("RECUE");
        reference.setDatePriseEnCharge(LocalDateTime.now());
        reference.setEtat(true);
        // Construire le nom du médecin à partir de l'utilisateur associé
        String nomComplet = "Médecin";
        if (doctor.getUtilisateur() != null) {
            User user = doctor.getUtilisateur();
            nomComplet = (user.getNom() != null ? user.getNom() : "") + 
                        (user.getPrenom() != null ? " " + user.getPrenom() : "");
        }
        reference.setNomDocteur(nomComplet.trim());
        reference.setDateModification(LocalDateTime.now());
        
        ReferenceDossier updatedReference = referenceDossierRepository.save(reference);
        return referenceDossierMapper.entityToDto(updatedReference);
    }
    
    /**
     * Ancienne méthode conservée pour compatibilité
     */
    public ReferenceDossierDto accepterReference(String codeReference, String codeDocteur, String nomDocteur) {
        Optional<ReferenceDossier> existingReference = referenceDossierRepository.findByCodeReference(codeReference);
        if (existingReference.isPresent()) {
            ReferenceDossier reference = existingReference.get();
            reference.setStatut("RECUE");
            reference.setDatePriseEnCharge(LocalDateTime.now());
            reference.setCodeDocteur(codeDocteur);
            reference.setEtat(true);
            reference.setNomDocteur(nomDocteur);
            reference.setDateModification(LocalDateTime.now());
            
            ReferenceDossier updatedReference = referenceDossierRepository.save(reference);
            return referenceDossierMapper.entityToDto(updatedReference);
        }
        throw new RuntimeException("Référence non trouvée avec le code: " + codeReference);
    }
    
    private String generateCodeReference() {
        return "REF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    // Méthodes pour importer les informations du dossier depuis gestion-patient
    public DossierViewDto getDossierFromGestionPatient(String codeDossier) {
        try {
            return dossierClient.getDossierByCode(codeDossier);
        } catch (Exception e) {
            System.err.println("Erreur lors de l'import du dossier depuis gestion-patient: " + e.getMessage());
            throw new RuntimeException("Impossible d'importer le dossier depuis gestion-patient");
        }
    }
    
    public List<DossierViewDto> getDossiersByPatientFromGestionPatient(String codePatient) {
        try {
            return dossierClient.getDossiersByPatient(codePatient);
        } catch (Exception e) {
            System.err.println("Erreur lors de l'import des dossiers du patient depuis gestion-patient: " + e.getMessage());
            throw new RuntimeException("Impossible d'importer les dossiers du patient depuis gestion-patient");
        }
    }

        public long countReferencesDossierEnvoyees() {
        Optional<Doctor> currentDoctor = getAuthenticatedDoctor();
        if (currentDoctor.isEmpty()) {
            return 0;
        }
        Doctor doctor = currentDoctor.get();
        
        // Références envoyées : celles où le médecin est l'auteur (code_referenceur)
        List<ReferenceDossier> references = referenceDossierRepository.findByCodeReferenceur(doctor.getCodeDoctor());
        
        return references.stream()
                .filter(ref -> Boolean.TRUE.equals(ref.getValidation()))
                .filter(ref -> Boolean.FALSE.equals(ref.getEtat()))
                .count();
    }

   public long countReferencesDossierRecuesNonLues() {
        Optional<Doctor> currentDoctor = getAuthenticatedDoctor();
        if (currentDoctor.isEmpty()) {
            return 0;
        }
        Doctor doctor = currentDoctor.get();
        
        return referenceDossierRepository.findByCodeDocteur(doctor.getCodeDoctor())
                .stream()
                .filter(ref -> Boolean.TRUE.equals(ref.getValidation()))
                .filter(ref -> ref.getEtat() != null && !ref.getEtat()) // etat = false => non lue
                .count();
    }
}
