package sn.uasz.referencement_PVVIH.services;
import java.time.LocalDateTime;
import java.util.ArrayList;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import sn.uasz.referencement_PVVIH.dtos.*;
import sn.uasz.referencement_PVVIH.entities.*;
import sn.uasz.referencement_PVVIH.mappers.ReferenceMapper;
import sn.uasz.referencement_PVVIH.repositories.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReferenceService {
    private final ReferenceRepository repository;
    private final ReferenceMapper mapper;
    private final DataSyncService dataSyncService;
    private final ReferenceServiceHelper helper;
    private final MotifRepository motifRepository;
    private final UserIntegrationService userIntegrationService;
    
    @PersistenceContext
    private EntityManager entityManager;
    @Transactional
    public Reference createReference(ReferenceDto dto) {
        Reference ref = mapper.toReference(dto);

        // --- Utilisateur connectÃƒÂ© ---
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String role = auth.getAuthorities().toString();
        String username = auth.getName();

        User user = helper.findUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur connectÃƒÂ© introuvable"));

        // --- MÃƒÂ©decin destinataire ---
        if (dto.getCodeMedecin() != null && !dto.getCodeMedecin().isEmpty()) {
            Doctor medecinDest = helper.findDoctorByCode(dto.getCodeMedecin())
                    .orElseThrow(() -> new RuntimeException("MÃƒÂ©decin destinataire introuvable"));
            ref.setMedecin(medecinDest);
        }

        // --- Patient ---
        Patient patient = helper.findPatientByCode(dto.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient introuvable"));
        ref.setPatient(patient);
        ref.setSite("");
        ref.setType("reference");

        // --- Gestion rÃƒÂ´le ---
        if (role.contains("DOCTOR")) {
            // Utiliser findDoctorByUsername pour la synchronisation automatique
            Doctor medecinAuteur = helper.findDoctorByUsername(user.getUsername())
                    .orElseThrow(() -> new RuntimeException("MÃƒÂ©decin connectÃƒÂ© introuvable"));
            if (ref.getDate() == null) {
                ref.setDate(LocalDateTime.now());
            }

            ref.setMedecinAuteur(medecinAuteur);
            ref.setAssistantSocial(null);
            ref.setEtat(false);
            ref.setValidation(true); // mÃƒÂ©decin valide direct

        } else if (role.contains("ASSISTANT")) {
            AssistantSocial assistant = helper.findAssistantByUser(user)
                    .orElseThrow(() -> new RuntimeException("Assistant social introuvable"));

            Doctor doctorCreatePatient = patient.getDoctorCreate();
            if (doctorCreatePatient == null) {
                throw new RuntimeException("Le patient n'a pas de médecin créateur associé");
            }
            
            // Vérification null-safe pour l'hôpital
            if (assistant.getHopital() == null) {
                throw new RuntimeException("L'assistant social n'est pas associé à un hôpital. Veuillez contacter l'administrateur.");
            }
            
            if (doctorCreatePatient.getHopital() == null) {
                throw new RuntimeException("Le médecin créateur du patient n'est pas associé à un hôpital");
            }
            
            if (!assistant.getHopital().getId().equals(doctorCreatePatient.getHopital().getId())) {
                throw new RuntimeException("L'assistant ne peut pas référencer un patient d'un autre hôpital");
            }

            ref.setValidation(false);
            ref.setEtat(false);
            ref.setMedecinAuteur(null);

            // Ã°Å¸â€â€˜ rÃƒÂ©cupÃƒÂ©rer un proxy managÃƒÂ© au lieu de passer directement lÃ¢â‚¬â„¢assistant
            AssistantSocial managedAssistant = entityManager.getReference(
                    AssistantSocial.class, assistant.getCodeAssistant()
            );
            ref.setAssistantSocial(managedAssistant);
        }
        // --- Renseignements cliniques ---
        if (dto.getRenseignementClinique() != null) {
            RenseignementClinique rc = mapper.toRenseignementClinique(dto.getRenseignementClinique());
            rc.setReference(ref);

            if (rc.getProfils() != null) rc.getProfils().forEach(p -> p.setRenseignementClinique(rc));
            if (rc.getStades() != null) rc.getStades().forEach(s -> s.setRenseignementClinique(rc));

            if (dto.getRenseignementClinique().getProtocoles1s() != null) {
                rc.setProtocoles1s(dto.getRenseignementClinique().getProtocoles1s().stream()
                        .map(p1Dto -> {
                            Protocole1 p1 = mapper.toProtocole1(p1Dto);
                            p1.setRenseignementClinique(rc);
                            return p1;
                        }).toList());
            }

            if (dto.getRenseignementClinique().getProtocoles2s() != null) {
                rc.setProtocoles2s(dto.getRenseignementClinique().getProtocoles2s().stream()
                        .map(p2Dto -> {
                            Protocole2 p2 = mapper.toProtocole2(p2Dto);
                            p2.setRenseignementClinique(rc);
                            return p2;
                        }).toList());
            }

            if (dto.getRenseignementClinique().getProtocolesTheraps() != null) {
                rc.setProtocolesTheraps(dto.getRenseignementClinique().getProtocolesTheraps().stream()
                        .map(ptDto -> {
                            ProtocoleTherap pt = mapper.toProtocoleTherap(ptDto);
                            pt.setRenseignementClinique(rc);
                            return pt;
                        }).toList());
            }

            ref.getRenseignementsCliniques().add(rc);
        }

        // --- Motif ---
        if (dto.getMotif() != null) {
            Motif motif = mapper.toMotif(dto.getMotif());
            motif.setReference(ref);

            if (dto.getMotif().getMotifChangements() != null)
                motif.setMotifChangement(mapper.toMotifChangement(dto.getMotif().getMotifChangements()));

            if (dto.getMotif().getMotifAutres() != null) {
                MotifAutres ma = mapper.toMotifAutres(dto.getMotif().getMotifAutres());
                if (ma.getAutresMotif() == null) ma.setAutresMotif("");
                motif.setMotifAutre(ma);
            }

            if (dto.getMotif().getMotifServs() != null)
                motif.setMotifServ(mapper.toMotifServ(dto.getMotif().getMotifServs()));

            ref.getMotifs().add(motif);
        }

        // --- Sauvegarde ---
        return repository.save(ref);
    }



    @Transactional
    public Reference createReferenceByAssistant(ReferenceDto dto) {
        Reference ref = mapper.toReference(dto);

        // --- Utilisateur connectÃƒÂ© ---
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = helper.findUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur connectÃƒÂ© introuvable"));

        // --- MÃƒÂ©decin destinataire ---
        if (dto.getCodeMedecin() != null && !dto.getCodeMedecin().isEmpty()) {
            Doctor medecinDest = helper.findDoctorByCode(dto.getCodeMedecin())
                    .orElseThrow(() -> new RuntimeException("MÃƒÂ©decin destinataire introuvable"));
            ref.setMedecin(medecinDest);
        }

        // --- Patient ---
        log.info("🔍 Récupération du patient {} pour création de référence", dto.getPatientId());
        
        // 🔄 FORCER la re-synchronisation complète du patient depuis gestion_user
        // pour garantir que toutes les associations (doctorCreate -> hopital) sont à jour
        Patient patient;
        try {
            log.info("🔄 Force re-sync du patient {} depuis gestion_user", dto.getPatientId());
            patient = dataSyncService.forceResyncPatient(dto.getPatientId());
            log.info("✅ Patient {} re-synchronisé - DoctorCreate: {}, Hôpital: {}", 
                    patient.getCodePatient(),
                    patient.getDoctorCreate() != null ? patient.getDoctorCreate().getCodeDoctor() : "null",
                    patient.getDoctorCreate() != null && patient.getDoctorCreate().getHopital() != null 
                        ? patient.getDoctorCreate().getHopital().getId() : "null");
        } catch (Exception e) {
            log.error("❌ Erreur re-sync patient {}: {}", dto.getPatientId(), e.getMessage());
            throw new RuntimeException("Impossible de synchroniser le patient: " + e.getMessage());
        }
        
        ref.setPatient(patient);
        ref.setSite("");
        ref.setType("reference");

        // --- Assistant social auteur ---
        log.info("🔍 Récupération de l'assistant pour username: {}", username);
        AssistantSocial assistant = helper.findAssistantByUser(user)
                .orElseThrow(() -> new RuntimeException("Assistant social introuvable"));
        
        log.info("✅ Assistant trouvé: {} - Hôpital ID: {}", 
                assistant.getCodeAssistant(), 
                assistant.getHopital() != null ? assistant.getHopital().getId() : "null");

        Doctor doctorCreatePatient = patient.getDoctorCreate();

        // 🔄 VALIDATION DEPUIS GESTION_USER (source de vérité)
        // Ne pas utiliser les IDs locaux qui peuvent être auto-générés différemment
        try {
            log.info("🔄 Validation des hôpitaux depuis gestion_user (source de vérité)");
            
            // Récupérer l'assistant depuis gestion_user
            sn.uasz.referencement_PVVIH.dtos.AssistantSocialDto assistantDto = 
                userIntegrationService.getAssistantByUsername(username);
            
            // Récupérer le patient depuis gestion_user
            sn.uasz.referencement_PVVIH.dtos.PatientFeignDto patientDto = 
                userIntegrationService.getPatientByCode(patient.getCodePatient());
            
            if (patientDto.getDoctorCreateCode() == null || patientDto.getDoctorCreateCode().isEmpty()) {
                log.error("❌ Le patient {} n'a pas de médecin créateur dans gestion_user", patient.getCodePatient());
                throw new RuntimeException("Le patient n'a pas de médecin créateur associé");
            }
            
            // Récupérer le médecin créateur depuis gestion_user
            sn.uasz.referencement_PVVIH.dtos.DoctorFeignDto doctorDto = 
                userIntegrationService.getDoctorByCode(patientDto.getDoctorCreateCode());
            
            // VALIDATION : Comparer les IDs d'hôpitaux depuis gestion_user (source de vérité)
            Long assistantHopitalId = assistantDto.getHopitalId();
            Long doctorHopitalId = doctorDto.getHopitalId();
            
            log.info("🔍 Vérification des hôpitaux depuis gestion_user - Assistant: {} / Médecin créateur: {}", 
                    assistantHopitalId, doctorHopitalId);
            
            if (assistantHopitalId == null) {
                log.error("❌ L'assistant {} n'a pas d'hôpital dans gestion_user", assistant.getCodeAssistant());
                throw new RuntimeException("L'assistant social n'est pas associé à un hôpital");
            }
            
            if (doctorHopitalId == null) {
                log.error("❌ Le médecin créateur {} n'a pas d'hôpital dans gestion_user", doctorDto.getCodeDoctor());
                throw new RuntimeException("Le médecin créateur du patient n'est pas associé à un hôpital");
            }
            
            if (!assistantHopitalId.equals(doctorHopitalId)) {
                log.error("❌ Hôpitaux différents dans gestion_user - Assistant: {} / Médecin: {}", 
                        assistantHopitalId, doctorHopitalId);
                throw new RuntimeException("L'assistant ne peut pas référencer un patient d'un autre hôpital");
            }
            
            log.info("✅ Validation OK - Même hôpital dans gestion_user (ID: {})", assistantHopitalId);
            
        } catch (RuntimeException e) {
            throw e; // Re-lancer les exceptions métier
        } catch (Exception e) {
            log.error("❌ Erreur validation depuis gestion_user: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la validation des hôpitaux: " + e.getMessage());
        }

        ref.setValidation(false);
        ref.setEtat(false);
        ref.setMedecinAuteur(null);

        // Ã°Å¸â€â€˜ rÃƒÂ©cupÃƒÂ©rer un proxy "managed" de lÃ¢â‚¬â„¢assistant
        AssistantSocial managedAssistant = entityManager.getReference(
                AssistantSocial.class, assistant.getCodeAssistant()
        );

        ref.setAssistantSocial(managedAssistant);

        // --- Renseignements cliniques ---
        if (dto.getRenseignementClinique() != null) {
            RenseignementClinique rc = mapper.toRenseignementClinique(dto.getRenseignementClinique());
            rc.setReference(ref);

            if (rc.getProfils() != null) rc.getProfils().forEach(p -> p.setRenseignementClinique(rc));
            if (rc.getStades() != null) rc.getStades().forEach(s -> s.setRenseignementClinique(rc));

            if (dto.getRenseignementClinique().getProtocoles1s() != null) {
                rc.setProtocoles1s(dto.getRenseignementClinique().getProtocoles1s().stream()
                        .map(p1Dto -> {
                            Protocole1 p1 = mapper.toProtocole1(p1Dto);
                            p1.setRenseignementClinique(rc);
                            return p1;
                        }).toList());
            }

            if (dto.getRenseignementClinique().getProtocoles2s() != null) {
                rc.setProtocoles2s(dto.getRenseignementClinique().getProtocoles2s().stream()
                        .map(p2Dto -> {
                            Protocole2 p2 = mapper.toProtocole2(p2Dto);
                            p2.setRenseignementClinique(rc);
                            return p2;
                        }).toList());
            }

            if (dto.getRenseignementClinique().getProtocolesTheraps() != null) {
                rc.setProtocolesTheraps(dto.getRenseignementClinique().getProtocolesTheraps().stream()
                        .map(ptDto -> {
                            ProtocoleTherap pt = mapper.toProtocoleTherap(ptDto);
                            pt.setRenseignementClinique(rc);
                            return pt;
                        }).toList());
            }

            ref.getRenseignementsCliniques().add(rc);
        }

        // --- Motif ---
        if (dto.getMotif() != null) {
            Motif motif = mapper.toMotif(dto.getMotif());
            motif.setReference(ref);

            if (dto.getMotif().getMotifChangements() != null)
                motif.setMotifChangement(mapper.toMotifChangement(dto.getMotif().getMotifChangements()));

            if (dto.getMotif().getMotifAutres() != null) {
                MotifAutres ma = mapper.toMotifAutres(dto.getMotif().getMotifAutres());
                if (ma.getAutresMotif() == null) ma.setAutresMotif("");
                motif.setMotifAutre(ma);
            }

            if (dto.getMotif().getMotifServs() != null)
                motif.setMotifServ(mapper.toMotifServ(dto.getMotif().getMotifServs()));

            ref.getMotifs().add(motif);
        }

        // Ã°Å¸â€Â¹ Sauvegarde finale
        return repository.save(ref);
    }

    /**
     * Liste des rÃƒÂ©fÃƒÂ©rences envoyÃƒÂ©es par le mÃƒÂ©decin connectÃƒÂ©
     */
    public List<ReferenceDto> getReferencesEnvoyees() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Doctor doctor = helper.findDoctorByUsername(username)
                .orElseThrow(() -> new RuntimeException("MÃƒÂ©decin non trouvÃƒÂ© pour cet utilisateur"));

        // RÃƒÂ©fÃƒÂ©rences envoyÃƒÂ©es directement par le mÃƒÂ©decin connectÃƒÂ©
        List<Reference> refsDirectes = repository.findByMedecinAuteur_CodeDoctor(doctor.getCodeDoctor());

        // RÃƒÂ©fÃƒÂ©rences envoyÃƒÂ©es par un assistant mais que le mÃƒÂ©decin crÃƒÂ©ateur du patient doit voir
        List<Reference> refsViaAssistant = repository.findByValidationFalse() // uniquement celles non validÃƒÂ©es
                .stream()
                .filter(ref -> ref.getPatient() != null && ref.getPatient().getDoctorCreate() != null)
                .filter(ref -> ref.getPatient().getDoctorCreate().getCodeDoctor().equals(doctor.getCodeDoctor()))
                .collect(Collectors.toList());

        // Fusionner les deux cas
        List<Reference> allRefs = new ArrayList<>();
        allRefs.addAll(refsDirectes);
        allRefs.addAll(refsViaAssistant);

        return allRefs.stream()
                .map(mapper::toReferenceDto)
                .collect(Collectors.toList());
    }



    public List<ReferenceDto> getReferencesRecues() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Doctor doctor = helper.findDoctorByUsername(username)
                .orElseThrow(() -> new RuntimeException("MÃƒÂ©decin non trouvÃƒÂ© pour cet utilisateur"));

        return repository.findByMedecin_CodeDoctor(doctor.getCodeDoctor())
                .stream()
                .filter(ref -> Boolean.TRUE.equals(ref.getValidation()))

                .map(mapper::toReferenceDto)
                .collect(Collectors.toList());
    }



    @Transactional
    public Reference contreReference(Long referenceId) {
        // Récupération de la référence
        Reference ref = repository.findById(referenceId)
                .orElseThrow(() -> new RuntimeException("Référence introuvable"));

        // Récupération de l'utilisateur connecté
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String role = auth.getAuthorities().toString();
        String username = auth.getName();

        if (!role.contains("DOCTOR")) {
            throw new RuntimeException("Seul un médecin peut effectuer une contre-référence");
        }

        // Récupération du médecin connecté directement par username (évite les doublons dans users)
        Doctor medecinConnecte = helper.findDoctorByUsername(username)
                .orElseThrow(() -> new RuntimeException("Médecin connecté introuvable"));

        // Vérifier si c'est bien le médecin destinataire de la référence
        if (!ref.getMedecin().getCodeDoctor().equals(medecinConnecte.getCodeDoctor())) {
            throw new RuntimeException("Ce médecin n'est pas autorisé à contre-référencer cette référence");
        }

        // Mettre à jour l'état (contre-référence validée)
        ref.setEtat(true);

        return repository.save(ref);
    }

    @Transactional
    public ReferenceValidationDto validationReference(Long referenceId) {
        Reference ref = repository.findById(referenceId)
                .orElseThrow(() -> new RuntimeException("RÃƒÂ©fÃƒÂ©rence introuvable"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        Doctor medecinConnecte = helper.findDoctorByUsername(username)
                .orElseThrow(() -> new RuntimeException("MÃƒÂ©decin connectÃƒÂ© introuvable"));

        if (ref.getMedecinAuteur() != null &&
                !ref.getMedecinAuteur().getCodeDoctor().equals(medecinConnecte.getCodeDoctor())) {
            throw new RuntimeException("Ce mÃƒÂ©decin nÃ¢â‚¬â„¢est pas autorisÃƒÂ© ÃƒÂ  valider cette rÃƒÂ©fÃƒÂ©rence");
        }

        ref.setMedecinAuteur(medecinConnecte);
        if (ref.getDate() == null) {
            ref.setDate(LocalDateTime.now());
        }
        ref.setValidation(true);

        Reference saved = repository.save(ref);
        return mapper.toReferenceValidationDto(saved);
    }

   /* @Transactional
    public Reference validationReference(Long referenceId) {
        // Ã°Å¸â€Â¹ RÃƒÂ©cupÃƒÂ©ration de la rÃƒÂ©fÃƒÂ©rence
        Reference ref = repository.findById(referenceId)
                .orElseThrow(() -> new RuntimeException("RÃƒÂ©fÃƒÂ©rence introuvable"));

        // Ã°Å¸â€Â¹ RÃƒÂ©cupÃƒÂ©ration de l'utilisateur connectÃƒÂ©
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String role = auth.getAuthorities().toString();
        String username = auth.getName();

        User user = helper.findUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur connectÃƒÂ© introuvable"));

        // Ã°Å¸â€Â¹ VÃƒÂ©rification du rÃƒÂ´le
        if (!role.contains("DOCTOR")) {
            throw new RuntimeException("Seul un mÃƒÂ©decin peut valider une rÃƒÂ©fÃƒÂ©rence");
        }

        // Ã°Å¸â€Â¹ RÃƒÂ©cupÃƒÂ©ration du mÃƒÂ©decin connectÃƒÂ©
        Doctor medecinConnecte = helper.findDoctorByUser(user)
                .orElseThrow(() -> new RuntimeException("MÃƒÂ©decin connectÃƒÂ© introuvable"));

        // Ã°Å¸â€Â¹ VÃƒÂ©rifier si cÃ¢â‚¬â„¢est bien le mÃƒÂ©decin auteur (ou ÃƒÂ©ventuellement destinataire selon logique)
        if (ref.getMedecinAuteur() != null && !ref.getMedecinAuteur().getCodeDoctor().equals(medecinConnecte.getCodeDoctor())) {
            throw new RuntimeException("Ce mÃƒÂ©decin nÃ¢â‚¬â„¢est pas autorisÃƒÂ© ÃƒÂ  valider cette rÃƒÂ©fÃƒÂ©rence");
        }

        // Ã°Å¸â€Â¹ Mettre ÃƒÂ  jour la rÃƒÂ©fÃƒÂ©rence
        ref.setMedecinAuteur(medecinConnecte);
        ref.setValidation(true);

        return repository.save(ref);
    }*/


    public List<ReferenceDto> findAll() {
        return repository.findAll().stream()
                .map(mapper::toReferenceDto)
                .collect(Collectors.toList());
    }

    public ReferenceDto findById(Long id) {
        return repository.findById(id)
                .map(mapper::toReferenceDto)
                .orElse(null);
    }

    public void deleteReference(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("RÃƒÂ©fÃƒÂ©rence avec l'id " + id + " introuvable !");
        }
        repository.deleteById(id);
    }


    /**
     * Compter les rÃƒÂ©fÃƒÂ©rences reÃƒÂ§ues non lues (etat = false)
     */
    public long countReferencesRecuesNonLues() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Doctor doctor = helper.findDoctorByUsername(username)
                .orElseThrow(() -> new RuntimeException("MÃƒÂ©decin non trouvÃƒÂ© pour cet utilisateur"));

        return repository.findByMedecin_CodeDoctor(doctor.getCodeDoctor())
                .stream()
                .filter(ref -> Boolean.TRUE.equals(ref.getValidation()))
                .filter(ref -> ref.getEtat() != null && !ref.getEtat()) // etat = false => non lue
                .count();
    }

    /**
     * Compter les rÃƒÂ©fÃƒÂ©rences envoyÃƒÂ©es (validation = true)
     */
    public long countReferencesEnvoyees() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Doctor doctor = helper.findDoctorByUsername(username)
                .orElseThrow(() -> new RuntimeException("MÃƒÂ©decin non trouvÃƒÂ© pour cet utilisateur"));

        return repository.findByMedecinAuteur_CodeDoctor(doctor.getCodeDoctor())
                .stream()
                .filter(ref -> Boolean.TRUE.equals(ref.getValidation()))
                .filter(ref -> Boolean.FALSE.equals(ref.getEtat()))
                .filter(ref -> ref.getValidation() != null && ref.getValidation()) // validation = true
                .count();
    }

    public long countReferencesEnvoyeesParAssistant() {
        // RÃƒÂ©cupÃƒÂ©rer le doctor connectÃƒÂ©
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Doctor doctor = helper.findDoctorByUsername(username)
                .orElseThrow(() -> new RuntimeException("MÃƒÂ©decin non trouvÃƒÂ© pour cet utilisateur"));

        // Compter les rÃƒÂ©fÃƒÂ©rences envoyÃƒÂ©es par un assistant pour les patients crÃƒÂ©ÃƒÂ©s par ce doctor
        long count = repository.findByValidationFalse() // uniquement celles non validÃƒÂ©es
                .stream()
                .filter(ref -> ref.getPatient() != null
                        && ref.getPatient().getDoctorCreate() != null
                        && ref.getPatient().getDoctorCreate().getCodeDoctor().equals(doctor.getCodeDoctor())
                        && ref.getAssistantSocial() != null) // s'assurer que c'est un assistant qui l'a crÃƒÂ©ÃƒÂ©
                .count();

        return count;
    }

    @Transactional
    public Reference updateReference(Long id, ReferenceDto dto) {
        Reference ref = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("RÃƒÂ©fÃƒÂ©rence introuvable avec id " + id));

        // Ã¢Å“â€¦ Mise ÃƒÂ  jour des champs simples
        if (dto.getActive() != null) ref.setActive(dto.getActive());
        if (dto.getDate() != null) ref.setDate(dto.getDate());
        if (dto.getEtat() != null) ref.setEtat(dto.getEtat());
        if (dto.getSite() != null) ref.setSite(dto.getSite());
        if (dto.getStatut() != null) ref.setStatut(dto.getStatut());
        if (dto.getType() != null) ref.setType(dto.getType());
        if (dto.getValidation() != null) ref.setValidation(dto.getValidation());

        // Ã¢Å“â€¦ Patient (si changement de patient)
        if (dto.getPatientId() != null) {
            Patient patient = helper.findPatientByCode(dto.getPatientId())
                    .orElseThrow(() -> new RuntimeException("Patient introuvable"));
            ref.setPatient(patient);
        }

        // Ã¢Å“â€¦ MÃƒÂ©decin destinataire
        if (dto.getCodeMedecin() != null) {
            Doctor medecinDest = helper.findDoctorByCode(dto.getCodeMedecin())
                    .orElseThrow(() -> new RuntimeException("MÃƒÂ©decin destinataire introuvable"));
            ref.setMedecin(medecinDest);
        }

        // Ã¢Å“â€¦ Assistant (si mis ÃƒÂ  jour)
        if (dto.getCodeAssistant() != null) {
            AssistantSocial assistant = helper.findAssistantByCode(dto.getCodeAssistant())
                    .orElseThrow(() -> new RuntimeException("Assistant introuvable"));
            ref.setAssistantSocial(assistant);
        }

        // Ã¢Å“â€¦ Mise ÃƒÂ  jour du renseignement clinique (ici : on remplace complÃƒÂ¨tement)
        ref.getRenseignementsCliniques().clear();
        if (dto.getRenseignementClinique() != null) {
            RenseignementClinique rc = mapper.toRenseignementClinique(dto.getRenseignementClinique());
            rc.setReference(ref);
            ref.getRenseignementsCliniques().add(rc);
        }

        // Ã¢Å“â€¦ Mise ÃƒÂ  jour du motif (ici : on remplace complÃƒÂ¨tement)
        ref.getMotifs().clear();
        if (dto.getMotif() != null) {
            Motif motif = mapper.toMotif(dto.getMotif());
            motif.setReference(ref);

            if (dto.getMotif().getMotifChangements() != null)
                motif.setMotifChangement(mapper.toMotifChangement(dto.getMotif().getMotifChangements()));

            if (dto.getMotif().getMotifAutres() != null) {
                MotifAutres ma = mapper.toMotifAutres(dto.getMotif().getMotifAutres());
                if (ma.getAutresMotif() == null) ma.setAutresMotif("");
                motif.setMotifAutre(ma);
            }

            if (dto.getMotif().getMotifServs() != null)
                motif.setMotifServ(mapper.toMotifServ(dto.getMotif().getMotifServs()));

            ref.getMotifs().add(motif);
        }

        // Ã¢Å“â€¦ Sauvegarde
        return repository.save(ref);
    }


}
