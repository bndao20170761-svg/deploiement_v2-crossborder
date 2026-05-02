package sn.uasz.referencement_PVVIH.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.uasz.referencement_PVVIH.dtos.ReferenceDossierDto;
import sn.uasz.referencement_PVVIH.dtos.DossierViewDto;
import sn.uasz.referencement_PVVIH.entities.Doctor;
import sn.uasz.referencement_PVVIH.entities.ReferenceDossier;
import sn.uasz.referencement_PVVIH.entities.User;
import sn.uasz.referencement_PVVIH.entities.Patient;
import sn.uasz.referencement_PVVIH.mappers.ReferenceDossierMapper;
import sn.uasz.referencement_PVVIH.repositories.ReferenceDossierRepository;
import sn.uasz.referencement_PVVIH.services.ReferenceServiceHelper;
import sn.uasz.referencement_PVVIH.feign.DossierClient;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
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
        try {
            return referenceServiceHelper.findDoctorByUsername(username);
        } catch (Exception e) {
            // Si l'utilisateur n'est pas un médecin (ex: ASSISTANT), retourner empty
            return Optional.empty();
        }
    }

    private Optional<sn.uasz.referencement_PVVIH.dtos.AssistantSocialDto> getAuthenticatedAssistant() {
        String username = getAuthenticatedUsername();
        if (username == null) {
            return Optional.empty();
        }
        try {
            sn.uasz.referencement_PVVIH.dtos.AssistantSocialDto assistant = referenceServiceHelper.userIntegrationService.getAssistantByUsername(username);
            return Optional.ofNullable(assistant);
        } catch (Exception e) {
            // Si l'utilisateur n'est pas un assistant, retourner empty
            return Optional.empty();
        }
    }
    
    public List<ReferenceDossierDto> getAllReferences() {
        List<ReferenceDossier> references = referenceDossierRepository.findAll();
        return references.stream()
                .map(referenceDossierMapper::entityToDto)
                .toList();
    }
    
    public Optional<ReferenceDossierDto> getReferenceByCode(String codeReference) {
        return referenceDossierRepository.findByCodeReference(codeReference)
                .map(entity -> {
                    ReferenceDossierDto dto = referenceDossierMapper.entityToDto(entity);
                    // Enrichir avec les infos patient
                    try {
                        referenceServiceHelper.findPatientByCode(entity.getCodePatient()).ifPresent(patient -> {
                            if (patient.getDateNaissance() != null) {
                                dto.setDateNaissance(patient.getDateNaissance().toInstant().toString());
                            }
                            dto.setAge(patient.getAge());
                            dto.setSexe(patient.getSexe());
                            dto.setProfession(patient.getProfession());
                            dto.setTelephone(patient.getTelephone());
                            dto.setStatutMatrimoniale(patient.getStatutMatrimoniale());
                            // Nationalité depuis l'utilisateur associé
                            if (patient.getUtilisateur() != null) {
                                dto.setNationalite(patient.getUtilisateur().getNationalite());
                            }
                        });
                    } catch (Exception e) {
                        log.warn("Enrichissement patient échoué pour {}: {}", entity.getCodePatient(), e.getMessage());
                    }
                    // Enrichir avec les infos du référenceur (fonction, nationalité)
                    if (entity.getCodeReferenceur() != null && !entity.getCodeReferenceur().isBlank()) {
                        try {
                            referenceServiceHelper.findDoctorByCode(entity.getCodeReferenceur()).ifPresent(doctor -> {
                                if (dto.getFonctionReferenceur() == null || dto.getFonctionReferenceur().isBlank()) {
                                    dto.setFonctionReferenceur(doctor.getFonction());
                                }
                                if (dto.getNationaliteReferenceur() == null || dto.getNationaliteReferenceur().isBlank()) {
                                    if (doctor.getUtilisateur() != null) {
                                        dto.setNationaliteReferenceur(doctor.getUtilisateur().getNationalite());
                                    }
                                }
                            });
                        } catch (Exception e) {
                            log.warn("Enrichissement référenceur échoué pour {}: {}", entity.getCodeReferenceur(), e.getMessage());
                        }
                    }
                    return dto;
                });
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
    
    @Transactional(readOnly = true, noRollbackFor = Exception.class)
    public List<ReferenceDossierDto> getReferencesRecues() {
        // Cas 1: L'utilisateur est un médecin
        Optional<Doctor> currentDoctor = getAuthenticatedDoctor();
        if (currentDoctor.isPresent()) {
            Doctor doctor = currentDoctor.get();
            
            // Références reçues : celles où le médecin est le destinataire (code_docteur)
            List<ReferenceDossier> references = referenceDossierRepository.findByCodeDocteur(doctor.getCodeDoctor());
            
            // Filtrer seulement celles validées
            return references.stream()
                    .filter(ref -> Boolean.TRUE.equals(ref.getValidation()))
                    .map(referenceDossierMapper::entityToDto)
                    .toList();
        }
        
        // Cas 2: L'utilisateur est un assistant
        Optional<sn.uasz.referencement_PVVIH.dtos.AssistantSocialDto> currentAssistant = getAuthenticatedAssistant();
        if (currentAssistant.isPresent()) {
            sn.uasz.referencement_PVVIH.dtos.AssistantSocialDto assistant = currentAssistant.get();
            
            // Récupérer toutes les références validées
            List<ReferenceDossier> allReferences = referenceDossierRepository.findAll();
            
            return allReferences.stream()
                    .filter(ref -> Boolean.TRUE.equals(ref.getValidation()))
                    .filter(ref -> {
                        try {
                            // Récupérer le patient de la référence
                            Optional<sn.uasz.referencement_PVVIH.entities.Patient> patientOpt = referenceServiceHelper.findPatientByCode(ref.getCodePatient());
                            if (patientOpt.isEmpty()) {
                                return false;
                            }
                            
                            sn.uasz.referencement_PVVIH.entities.Patient patient = patientOpt.get();
                            Doctor patientDoctor = patient.getDoctorCreate();
                            
                            if (patientDoctor == null) {
                                return false;
                            }
                            
                            // Vérifier si le médecin et l'assistant sont dans le même hôpital
                            return patientDoctor.getHopital() != null && 
                                   assistant.getHopitalId() != null && 
                                   patientDoctor.getHopital().getId().equals(assistant.getHopitalId());
                        } catch (Exception e) {
                            log.warn("Erreur lors de la vérification de la référence {} pour l'assistant: {}", ref.getCodeReference(), e.getMessage());
                            return false;
                        }
                    })
                    .map(referenceDossierMapper::entityToDto)
                    .toList();
        }
        
        // Cas 3: L'utilisateur n'est ni médecin ni assistant
        return List.of();
    }
    
    @Transactional(readOnly = true, noRollbackFor = Exception.class)
    public List<ReferenceDossierDto> getReferencesEnvoyees() {
        // Cas 1: L'utilisateur est un médecin
        Optional<Doctor> currentDoctor = getAuthenticatedDoctor();
        if (currentDoctor.isPresent()) {
            Doctor doctor = currentDoctor.get();

            // 1. Références envoyées directement par le médecin (validées, non encore reçues)
            List<ReferenceDossier> envoyees = referenceDossierRepository.findByCodeReferenceur(doctor.getCodeDoctor())
                    .stream()
                    .filter(ref -> Boolean.TRUE.equals(ref.getValidation()))
                    .filter(ref -> Boolean.FALSE.equals(ref.getEtat()))
                    .collect(java.util.stream.Collectors.toList());

            // 2. Références initiées par un assistant pour les patients du médecin (validation=false)
            //    Le médecin doit les voir pour pouvoir les valider
            List<ReferenceDossier> aValider = referenceDossierRepository
                    .findByValidationFalseAndCodePatientIn(
                            getPatientCodesForDoctor(doctor.getCodeDoctor()));

            // Fusionner les deux listes sans doublons
            List<ReferenceDossier> all = new ArrayList<>(envoyees);
            for (ReferenceDossier ref : aValider) {
                if (all.stream().noneMatch(r -> r.getCodeReference().equals(ref.getCodeReference()))) {
                    all.add(ref);
                }
            }

            return all.stream()
                    .map(referenceDossierMapper::entityToDto)
                    .toList();
        }
        
        // Cas 2: L'utilisateur est un assistant
        Optional<sn.uasz.referencement_PVVIH.dtos.AssistantSocialDto> currentAssistant = getAuthenticatedAssistant();
        if (currentAssistant.isPresent()) {
            sn.uasz.referencement_PVVIH.dtos.AssistantSocialDto assistant = currentAssistant.get();
            
            // Récupérer toutes les références validées
            List<ReferenceDossier> allReferences = referenceDossierRepository.findAll();
            
            return allReferences.stream()
                    .filter(ref -> Boolean.TRUE.equals(ref.getValidation()))
                    .filter(ref -> Boolean.FALSE.equals(ref.getEtat()))
                    .filter(ref -> {
                        try {
                            // Récupérer le patient de la référence
                            Optional<sn.uasz.referencement_PVVIH.entities.Patient> patientOpt = referenceServiceHelper.findPatientByCode(ref.getCodePatient());
                            if (patientOpt.isEmpty()) {
                                return false;
                            }
                            
                            sn.uasz.referencement_PVVIH.entities.Patient patient = patientOpt.get();
                            Doctor patientDoctor = patient.getDoctorCreate();
                            
                            if (patientDoctor == null) {
                                return false;
                            }
                            
                            // Vérifier si le médecin et l'assistant sont dans le même hôpital
                            return patientDoctor.getHopital() != null && 
                                   assistant.getHopitalId() != null && 
                                   patientDoctor.getHopital().getId().equals(assistant.getHopitalId());
                        } catch (Exception e) {
                            log.warn("Erreur lors de la vérification de la référence {} pour l'assistant: {}", ref.getCodeReference(), e.getMessage());
                            return false;
                        }
                    })
                    .map(referenceDossierMapper::entityToDto)
                    .toList();
        }
        
        // Cas 3: L'utilisateur n'est ni médecin ni assistant
        return List.of();
    }

    /**
     * Récupère les codes patients associés au médecin connecté
     */
    private List<String> getPatientCodesForDoctor(String codeDoctor) {
        try {
            return referenceDossierRepository.findDistinctCodePatientByCodeReferenceur(codeDoctor);
        } catch (Exception e) {
            log.warn("Impossible de récupérer les codes patients du médecin {}: {}", codeDoctor, e.getMessage());
            return List.of();
        }
    }
    
    public List<ReferenceDossierDto> getReferencesEnAttente() {
        return getReferencesByStatut("EN_ATTENTE");
    }
    
    @Transactional(noRollbackFor = Exception.class)
    public ReferenceDossierDto createReference(ReferenceDossierDto referenceDossierDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            
            // Cas 1: L'utilisateur est un médecin
            try {
                Doctor doctorWithHopital = referenceServiceHelper.findDoctorByUsername(username)
                        .orElse(null);
                
                if (doctorWithHopital != null) {
                    // C'est un médecin, utiliser sa logique normale
                    sn.uasz.referencement_PVVIH.dtos.HopitalDto hopitalDto = referenceServiceHelper.getCurrentDoctorHopital();
                
                // Code de référenceur
                if (referenceDossierDto.getCodeReferenceur() == null || referenceDossierDto.getCodeReferenceur().isBlank()) {
                    referenceDossierDto.setCodeReferenceur(doctorWithHopital.getCodeDoctor());
                }
                // Nom du référenceur : construire proprement sans concaténer des null/undefined
                if (isBlankOrUndefined(referenceDossierDto.getNomReferenceur())) {
                    String nomUtil = null;
                    if (doctorWithHopital.getUtilisateur() != null) {
                        String nom = doctorWithHopital.getUtilisateur().getNom() != null ? doctorWithHopital.getUtilisateur().getNom().trim() : "";
                        String prenom = doctorWithHopital.getUtilisateur().getPrenom() != null ? doctorWithHopital.getUtilisateur().getPrenom().trim() : "";
                        String full = (nom + " " + prenom).trim();
                        if (!isBlankOrUndefined(full)) {
                            nomUtil = full;
                        }
                    }
                    if (nomUtil != null) {
                        referenceDossierDto.setNomReferenceur(nomUtil);
                    } else if (doctorWithHopital.getPseudo() != null && !doctorWithHopital.getPseudo().isBlank()) {
                        referenceDossierDto.setNomReferenceur(doctorWithHopital.getPseudo());
                    } else {
                        referenceDossierDto.setNomReferenceur(doctorWithHopital.getCodeDoctor());
                    }
                }
                if ((referenceDossierDto.getTelephoneReferenceur() == null || referenceDossierDto.getTelephoneReferenceur().isBlank()) && doctorWithHopital.getTelephone() != null) {
                    referenceDossierDto.setTelephoneReferenceur(doctorWithHopital.getTelephone());
                }
                if ((referenceDossierDto.getEmailReferenceur() == null || referenceDossierDto.getEmailReferenceur().isBlank()) && doctorWithHopital.getEmail() != null) {
                    referenceDossierDto.setEmailReferenceur(doctorWithHopital.getEmail());
                }
                // Remplir la fonction et nationalité du référenceur
                if ((referenceDossierDto.getFonctionReferenceur() == null || referenceDossierDto.getFonctionReferenceur().isBlank()) && doctorWithHopital.getFonction() != null) {
                    referenceDossierDto.setFonctionReferenceur(doctorWithHopital.getFonction());
                }
                if ((referenceDossierDto.getNationaliteReferenceur() == null || referenceDossierDto.getNationaliteReferenceur().isBlank())
                        && doctorWithHopital.getUtilisateur() != null
                        && doctorWithHopital.getUtilisateur().getNationalite() != null) {
                    referenceDossierDto.setNationaliteReferenceur(doctorWithHopital.getUtilisateur().getNationalite());
                }
                // Remplir l'hôpital d'origine (référenceur) si disponible
                if (hopitalDto != null) {
                    if ((referenceDossierDto.getCodeHopitalReferenceur() == null || referenceDossierDto.getCodeHopitalReferenceur().isBlank())
                            && hopitalDto.getId() != null) {
                        referenceDossierDto.setCodeHopitalReferenceur(String.valueOf(hopitalDto.getId()));
                    }
                    if ((referenceDossierDto.getNomHopitalReferenceur() == null || referenceDossierDto.getNomHopitalReferenceur().isBlank())
                            && hopitalDto.getNom() != null) {
                        referenceDossierDto.setNomHopitalReferenceur(hopitalDto.getNom());
                    }
                }
                } else {
                    // Cas 2: L'utilisateur est un assistant, utiliser sa logique
                    log.info("🔍 Création de référence par l'assistant: {}", username);
                    
                    // Pour un assistant, on utilise le User directement
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
                        // La classe User n'a pas les champs telephone et email, on utilise username comme fallback
                        if ((referenceDossierDto.getTelephoneReferenceur() == null || referenceDossierDto.getTelephoneReferenceur().isBlank()) && user.getUsername() != null) {
                            referenceDossierDto.setTelephoneReferenceur(user.getUsername());
                        }
                        if ((referenceDossierDto.getEmailReferenceur() == null || referenceDossierDto.getEmailReferenceur().isBlank()) && user.getUsername() != null) {
                            referenceDossierDto.setEmailReferenceur(user.getUsername());
                        }
                    });
                }
            } catch (Exception e) {
                log.error("❌ Erreur lors de la synchronisation du doctor référenceur {}: {}", username, e.getMessage());
                // Continuer avec le user local même si la synchronisation échoue
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
                    // La classe User n'a pas les champs telephone et email, on utilise username comme fallback
                    if ((referenceDossierDto.getTelephoneReferenceur() == null || referenceDossierDto.getTelephoneReferenceur().isBlank()) && user.getUsername() != null) {
                        referenceDossierDto.setTelephoneReferenceur(user.getUsername());
                    }
                    if ((referenceDossierDto.getEmailReferenceur() == null || referenceDossierDto.getEmailReferenceur().isBlank()) && user.getUsername() != null) {
                        referenceDossierDto.setEmailReferenceur(user.getUsername());
                    }
                });
            }
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

        // Si l'initiateur est un ASSISTANT, la référence n'est pas encore validée
        // Elle sera validée par le médecin référenceur
        boolean isAssistant = false;
        try {
            String username = getAuthenticatedUsername();
            if (username != null) {
                Optional<sn.uasz.referencement_PVVIH.entities.User> userOpt =
                        referenceServiceHelper.findUserByUsername(username);
                if (userOpt.isPresent()) {
                    String profil = userOpt.get().getProfil();
                    isAssistant = "ASSISTANT".equalsIgnoreCase(profil);
                }
            }
        } catch (Exception e) {
            log.warn("Impossible de déterminer le profil de l'utilisateur: {}", e.getMessage());
        }
        referenceDossierDto.setValidation(!isAssistant);
        
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
                resultDto.setStatutMatrimoniale(patient.getStatutMatrimoniale());
                if (patient.getUtilisateur() != null) {
                    resultDto.setNationalite(patient.getUtilisateur().getNationalite());
                }
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

    /**
     * Vérifie si le médecin connecté peut valider une référence initiée par un assistant.
     * Condition : la référence a validation=false ET le codePatient figure parmi les patients du médecin.
     */
    public boolean canValidateReference(String codeReference) {
        Optional<Doctor> currentDoctor = getAuthenticatedDoctor();
        if (currentDoctor.isEmpty()) return false;

        Optional<ReferenceDossier> refOpt = referenceDossierRepository.findByCodeReference(codeReference);
        if (refOpt.isEmpty()) return false;

        ReferenceDossier ref = refOpt.get();
        if (Boolean.TRUE.equals(ref.getValidation())) return false;

        String codeDoctor = currentDoctor.get().getCodeDoctor();
        List<String> patientCodes = referenceDossierRepository.findDistinctCodePatientByCodeReferenceur(codeDoctor);
        return patientCodes.contains(ref.getCodePatient());
    }

    /**
     * Valide une référence initiée par un assistant.
     * Le médecin connecté devient le référenceur officiel et son hôpital est inséré.
     */
    public ReferenceDossierDto validerReference(String codeReference) {
        Optional<Doctor> currentDoctor = getAuthenticatedDoctor();
        if (currentDoctor.isEmpty()) {
            throw new RuntimeException("Médecin non authentifié");
        }

        Optional<ReferenceDossier> refOpt = referenceDossierRepository.findByCodeReference(codeReference);
        if (refOpt.isEmpty()) {
            throw new RuntimeException("Référence non trouvée: " + codeReference);
        }

        ReferenceDossier reference = refOpt.get();
        if (Boolean.TRUE.equals(reference.getValidation())) {
            throw new RuntimeException("Cette référence est déjà validée");
        }

        Doctor doctor = currentDoctor.get();

        List<String> patientCodes = referenceDossierRepository.findDistinctCodePatientByCodeReferenceur(doctor.getCodeDoctor());
        if (!patientCodes.contains(reference.getCodePatient())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à valider cette référence");
        }

        // Insérer les infos du médecin comme référenceur
        reference.setCodeReferenceur(doctor.getCodeDoctor());
        if (doctor.getUtilisateur() != null) {
            String nom = doctor.getUtilisateur().getNom() != null ? doctor.getUtilisateur().getNom().trim() : "";
            String prenom = doctor.getUtilisateur().getPrenom() != null ? doctor.getUtilisateur().getPrenom().trim() : "";
            reference.setNomReferenceur((nom + " " + prenom).trim());
            reference.setNationaliteReferenceur(doctor.getUtilisateur().getNationalite());
        }
        reference.setTelephoneReferenceur(doctor.getTelephone());
        reference.setEmailReferenceur(doctor.getEmail());
        reference.setFonctionReferenceur(doctor.getFonction());

        // Insérer l'hôpital d'origine du médecin
        try {
            sn.uasz.referencement_PVVIH.dtos.HopitalDto hopitalDto = referenceServiceHelper.getCurrentDoctorHopital();
            if (hopitalDto != null) {
                reference.setCodeHopitalReferenceur(String.valueOf(hopitalDto.getId()));
                reference.setNomHopitalReferenceur(hopitalDto.getNom());
            }
        } catch (Exception e) {
            log.warn("Impossible de récupérer l'hôpital du médecin lors de la validation: {}", e.getMessage());
        }

        reference.setValidation(true);
        reference.setDateModification(LocalDateTime.now());

        ReferenceDossier saved = referenceDossierRepository.save(reference);
        return referenceDossierMapper.entityToDto(saved);
    }

    /**
     * Compte les références initiées par un assistant pour les patients du médecin connecté
     * (validation=false) — badge jaune dans l'onglet "Envoyées"
     */
    public long countReferencesDossierAssistant() {
        Optional<Doctor> currentDoctor = getAuthenticatedDoctor();
        if (currentDoctor.isEmpty()) return 0;

        List<String> patientCodes = referenceDossierRepository
                .findDistinctCodePatientByCodeReferenceur(currentDoctor.get().getCodeDoctor());
        if (patientCodes.isEmpty()) return 0;

        return referenceDossierRepository.findByValidationFalseAndCodePatientIn(patientCodes).size();
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

    @Transactional(readOnly = true, noRollbackFor = Exception.class)
    public long countReferencesDossierEnvoyees() {
        // Cas 1: L'utilisateur est un médecin
        Optional<Doctor> currentDoctor = getAuthenticatedDoctor();
        if (currentDoctor.isPresent()) {
            Doctor doctor = currentDoctor.get();
            
            // Références envoyées : celles où le médecin est l'auteur (code_referenceur)
            List<ReferenceDossier> references = referenceDossierRepository.findByCodeReferenceur(doctor.getCodeDoctor());
            
            return references.stream()
                    .filter(ref -> Boolean.TRUE.equals(ref.getValidation()))
                    .filter(ref -> Boolean.FALSE.equals(ref.getEtat()))
                    .count();
        }
        
        // Cas 2: L'utilisateur est un assistant
        Optional<sn.uasz.referencement_PVVIH.dtos.AssistantSocialDto> currentAssistant = getAuthenticatedAssistant();
        if (currentAssistant.isPresent()) {
            sn.uasz.referencement_PVVIH.dtos.AssistantSocialDto assistant = currentAssistant.get();
            
            // Récupérer toutes les références validées
            List<ReferenceDossier> allReferences = referenceDossierRepository.findAll();
            
            return allReferences.stream()
                    .filter(ref -> Boolean.TRUE.equals(ref.getValidation()))
                    .filter(ref -> Boolean.FALSE.equals(ref.getEtat()))
                    .filter(ref -> {
                        try {
                            // Récupérer le patient de la référence
                            Optional<sn.uasz.referencement_PVVIH.entities.Patient> patientOpt = referenceServiceHelper.findPatientByCode(ref.getCodePatient());
                            if (patientOpt.isEmpty()) {
                                return false;
                            }
                            
                            sn.uasz.referencement_PVVIH.entities.Patient patient = patientOpt.get();
                            Doctor patientDoctor = patient.getDoctorCreate();
                            
                            if (patientDoctor == null) {
                                return false;
                            }
                            
                            // Vérifier si le médecin et l'assistant sont dans le même hôpital
                            return patientDoctor.getHopital() != null && 
                                   assistant.getHopitalId() != null && 
                                   patientDoctor.getHopital().getId().equals(assistant.getHopitalId());
                        } catch (Exception e) {
                            log.warn("Erreur lors de la vérification de la référence {} pour l'assistant: {}", ref.getCodeReference(), e.getMessage());
                            return false;
                        }
                    })
                    .count();
        }
        
        // Cas 3: L'utilisateur n'est ni médecin ni assistant
        return 0;
    }

   @Transactional(readOnly = true, noRollbackFor = Exception.class)
   public long countReferencesDossierRecuesNonLues() {
        // Cas 1: médecin
        Optional<Doctor> currentDoctor = getAuthenticatedDoctor();
        if (currentDoctor.isPresent()) {
            Doctor doctor = currentDoctor.get();
            return referenceDossierRepository.findByCodeDocteur(doctor.getCodeDoctor())
                    .stream()
                    .filter(ref -> Boolean.TRUE.equals(ref.getValidation()))
                    .filter(ref -> ref.getEtat() != null && !ref.getEtat())
                    .count();
        }

        // Cas 2: assistant — même logique de filtrage par hôpital que getReferencesRecues()
        Optional<sn.uasz.referencement_PVVIH.dtos.AssistantSocialDto> currentAssistant = getAuthenticatedAssistant();
        if (currentAssistant.isPresent()) {
            sn.uasz.referencement_PVVIH.dtos.AssistantSocialDto assistant = currentAssistant.get();
            return referenceDossierRepository.findAll().stream()
                    .filter(ref -> Boolean.TRUE.equals(ref.getValidation()))
                    .filter(ref -> ref.getEtat() != null && !ref.getEtat())
                    .filter(ref -> {
                        try {
                            Optional<Patient> patientOpt = referenceServiceHelper.findPatientByCode(ref.getCodePatient());
                            if (patientOpt.isEmpty()) return false;
                            Doctor patientDoctor = patientOpt.get().getDoctorCreate();
                            if (patientDoctor == null) return false;
                            return patientDoctor.getHopital() != null &&
                                   assistant.getHopitalId() != null &&
                                   patientDoctor.getHopital().getId().equals(assistant.getHopitalId());
                        } catch (Exception e) {
                            log.warn("Erreur filtrage référence {} pour assistant: {}", ref.getCodeReference(), e.getMessage());
                            return false;
                        }
                    })
                    .count();
        }

        return 0;
    }
}
