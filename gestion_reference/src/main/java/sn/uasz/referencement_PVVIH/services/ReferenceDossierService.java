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
        List<String> statuses = List.of("EN_ATTENTE", "RECUE");
        List<ReferenceDossier> references = referenceDossierRepository.findByCodeDocteurAndStatutInOrderByDateCreationDesc(currentDoctor.get().getCodeDoctor(), statuses);
        return references.stream()
                .map(referenceDossierMapper::entityToDto)
                .toList();
    }
    
    public List<ReferenceDossierDto> getReferencesEnvoyees() {
        Optional<Doctor> currentDoctor = getAuthenticatedDoctor();
        if (currentDoctor.isEmpty()) {
            return List.of();
        }
        List<ReferenceDossier> references = referenceDossierRepository.findByCodeReferenceurOrderByDateCreationDesc(currentDoctor.get().getCodeDoctor());
        return references.stream()
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
                if (referenceDossierDto.getCodeReferenceur() == null || referenceDossierDto.getCodeReferenceur().isBlank()) {
                    referenceDossierDto.setCodeReferenceur(doctor.getCodeDoctor());
                }
                if (referenceDossierDto.getNomReferenceur() == null || referenceDossierDto.getNomReferenceur().isBlank()) {
                    if (doctor.getUtilisateur() != null) {
                        referenceDossierDto.setNomReferenceur(doctor.getUtilisateur().getNom() + " " + doctor.getUtilisateur().getPrenom());
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
                if ((referenceDossierDto.getNomReferenceur() == null || referenceDossierDto.getNomReferenceur().isBlank()) && user.getNom() != null) {
                    referenceDossierDto.setNomReferenceur(user.getNom() + " " + user.getPrenom());
                }
                if ((referenceDossierDto.getTelephoneReferenceur() == null || referenceDossierDto.getTelephoneReferenceur().isBlank()) && user.getUsername() != null) {
                    referenceDossierDto.setTelephoneReferenceur(user.getUsername());
                }
                if ((referenceDossierDto.getEmailReferenceur() == null || referenceDossierDto.getEmailReferenceur().isBlank()) && user.getUsername() != null) {
                    referenceDossierDto.setEmailReferenceur(user.getUsername());
                }
            });
        }

        if (isBlankOrUndefined(referenceDossierDto.getNomDocteur()) && referenceDossierDto.getCodeDocteur() != null) {
            referenceServiceHelper.findDoctorByCode(referenceDossierDto.getCodeDocteur()).ifPresent(targetDoctor -> {
                if (targetDoctor.getUtilisateur() != null && targetDoctor.getUtilisateur().getNom() != null) {
                    referenceDossierDto.setNomDocteur(targetDoctor.getUtilisateur().getNom() + " " + targetDoctor.getUtilisateur().getPrenom());
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
        
        ReferenceDossier referenceDossier = referenceDossierMapper.dtoToEntity(referenceDossierDto);
        ReferenceDossier savedReference = referenceDossierRepository.save(referenceDossier);
        
        // Convertir en DTO et enrichir avec informations patient non persistées
        ReferenceDossierDto resultDto = referenceDossierMapper.entityToDto(savedReference);
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
        if ("undefined".equalsIgnoreCase(trimmed)) return true;
        if ("null".equalsIgnoreCase(trimmed)) return true;
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
    
    public ReferenceDossierDto accepterReference(String codeReference, String codeDocteur, String nomDocteur) {
        Optional<ReferenceDossier> existingReference = referenceDossierRepository.findByCodeReference(codeReference);
        if (existingReference.isPresent()) {
            ReferenceDossier reference = existingReference.get();
            reference.setStatut("RECUE");
            reference.setDatePriseEnCharge(LocalDateTime.now());
            reference.setCodeDocteur(codeDocteur);
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
}
