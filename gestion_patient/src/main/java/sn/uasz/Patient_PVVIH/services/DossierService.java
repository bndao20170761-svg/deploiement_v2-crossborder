package sn.uasz.Patient_PVVIH.services;

import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import sn.uasz.Patient_PVVIH.dtos.*;
import sn.uasz.Patient_PVVIH.entities.*;
import sn.uasz.Patient_PVVIH.mappers.PatientPvvihMapper;
import sn.uasz.Patient_PVVIH.repositories.DossierRepository;

import java.util.ArrayList;
import java.util.UUID;

@Service
public class DossierService {

    private final PatientPvvihMapper mapper;
    private final DossierRepository dossierRepository;
    private final UserIntegrationService userIntegrationService;

    // ✅ Injection par constructeur - utilisation des services d'intégration
    public DossierService(PatientPvvihMapper mapper,
                          DossierRepository dossierRepository,
                          UserIntegrationService userIntegrationService) {
        this.mapper = mapper;
        this.dossierRepository = dossierRepository;
        this.userIntegrationService = userIntegrationService;
    }
    @Transactional
    public Dossier createDossierPatient(DossierDTO dto) {
        // 🔹 Mapper le DTO vers l’entité Dossier
        Dossier dossier = mapper.toDossier(dto);

        // --- Initialiser la collection des pages ---
        if (dossier.getPages() == null) {
            dossier.setPages(new ArrayList<>());
        } else {
            dossier.getPages().clear(); // ⚠️ éviter de mélanger les anciennes pages du mapper
        }

        // --- Utilisateur connecté ---
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String role = auth.getAuthorities().toString();
        String username = auth.getName();

        // --- Vérification du rôle : seul un DOCTOR peut créer un dossier ---
        if (!role.contains("DOCTOR")) {
            throw new RuntimeException("Seul un médecin peut créer un dossier patient");
        }

        // --- Vérifier que le patient existe via Feign Client ---
        try {
            UserPatientDto patientDto = userIntegrationService.getPatientByCode(dto.getCodePatient());
            // Le patient existe, on peut continuer
        } catch (Exception e) {
            throw new RuntimeException("Patient introuvable avec ce code: " + dto.getCodePatient());
        }

        // --- Récupérer les informations du médecin connecté via Feign Client ---
        try {
            // Récupérer tous les médecins et trouver celui qui correspond à l'utilisateur connecté
            var doctors = userIntegrationService.getAllDoctors();
            
            // Log pour debug
            System.out.println("🔍 Username JWT: " + username);
            System.out.println("🔍 Médecins disponibles (" + doctors.size() + "):");
            doctors.forEach(doc -> System.out.println("  - Code: " + doc.getCodeDoctor() + ", Email: " + doc.getEmail() + ", Username: " + doc.getUsername() + ", NomUtilisateur: " + doc.getNomUtilisateur()));
            
            var connectedDoctor = doctors.stream()
                .filter(doc -> {
                    // Essayer avec l'username de l'utilisateur associé
                    if (username.equals(doc.getUsername())) {
                        System.out.println("✅ Trouvé par username utilisateur: " + doc.getCodeDoctor());
                        return true;
                    }
                    // Essayer avec l'email du médecin
                    if (username.equals(doc.getEmail())) {
                        System.out.println("✅ Trouvé par email: " + doc.getCodeDoctor());
                        return true;
                    }
                    return false;
                })
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Médecin connecté introuvable pour username: " + username));
            
            // Stocker seulement le code du médecin dans le dossier
            dossier.setDoctorCreateCode(connectedDoctor.getCodeDoctor());
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la récupération du médecin connecté: " + e.getMessage());
        }

        // --- Stocker seulement le code patient dans le dossier ---
        dossier.setPatientCode(dto.getCodePatient());

        // --- Génération automatique code dossier: codePatient + dateNaissance + codeDoctor ---
        if (dossier.getCodeDossier() == null || dossier.getCodeDossier().isBlank()) {
            String codePatient = dto.getCodePatient();
            String codeDoctor = dossier.getDoctorCreateCode();
            
            // Récupérer la date de naissance du patient depuis UserIntegrationService
            String dateNaissancePatient = "UNK"; // Valeur par défaut
            try {
                UserPatientDto patientDto = userIntegrationService.getPatientByCode(codePatient);
                if (patientDto.getDateNaissance() != null) {
                    // Formater la date au format YYYY-MM-DD
                    dateNaissancePatient = patientDto.getDateNaissance().toString();
                }
            } catch (Exception e) {
                System.out.println("⚠️ Impossible de récupérer la date de naissance pour le patient: " + e.getMessage());
            }
            
            // Générer le code dossier: CODE-PATIENT-YYYY-MM-DD-CODE-DOCTOR
            String codeDossier = codePatient + "-" + dateNaissancePatient + "-" + codeDoctor;
            dossier.setCodeDossier(codeDossier);
            
            System.out.println("📝 Code dossier généré: " + codeDossier);
        }

        if (dto.getIdentificationBiom() != null && !dto.getIdentificationBiom().isBlank()) {
            dossier.setIdentificationBiom(dto.getIdentificationBiom());
            dossier.setBiometricStatus("CAPTURED");
        } else {
            dossier.setBiometricStatus("PENDING");
        }
        // --- Gestion des pages et sous-entités ---
        if (dto.getPages() != null) {
            dto.getPages().forEach(pageDto -> {
                Page page = mapper.toPage(pageDto);
                page.setDossier(dossier); // 🔑 relier la page au dossier

                // 🔹 Bilans
                if (pageDto.getBilans() != null) {
                    page.setBilans(pageDto.getBilans().stream()
                            .map(bDto -> {
                                Bilan bilan = mapper.toBilan(bDto);
                                bilan.setPage(page);
                                return bilan;
                            }).toList());
                }

                // 🔹 Dépistage familiale
                if (pageDto.getDepistageFamiliales() != null) {
                    page.setDepistageFamiliales(pageDto.getDepistageFamiliales().stream()
                            .map(dfDto -> {
                                DepistageFamiliale df = mapper.toDepistageFamiliale(dfDto);
                                df.setPage(page);
                                return df;
                            }).toList());
                }

                // 🔹 Index tests
                if (pageDto.getIndexTests() != null) {
                    page.setIndexTests(pageDto.getIndexTests().stream()
                            .map(itDto -> {
                                IndexTest it = mapper.toIndexTest(itDto);
                                it.setPage(page);
                                return it;
                            }).toList());
                }

                // 🔹 PTME
                if (pageDto.getPtmes() != null) {
                    page.setPtmes(pageDto.getPtmes().stream()
                            .map(ptmeDto -> {
                                PTME ptme = mapper.toPtme(ptmeDto);
                                ptme.setPage(page);
                                return ptme;
                            }).toList());
                }

                // 🔹 Suivis immunovirologiques
                if (pageDto.getSuiviImmunovirologiques() != null) {
                    page.setSuiviImmunovirologiques(pageDto.getSuiviImmunovirologiques().stream()
                            .map(siDto -> {
                                Suivi_Immunovirologique si = mapper.toSuiviImmunovirologique(siDto);
                                si.setPage(page);
                                return si;
                            }).toList());
                }

                // 🔹 Suivis pathologiques
                if (pageDto.getSuiviPathologiques() != null) {
                    page.setSuiviPathologiques(pageDto.getSuiviPathologiques().stream()
                            .map(spDto -> {
                                SuiviPathologique sp = mapper.toSuiviPathologique(spDto);
                                sp.setPage(page);
                                return sp;
                            }).toList());
                }

                // 🔹 Suivis ARV
                if (pageDto.getSuiviARVs() != null) {
                    page.setSuiviARVs(pageDto.getSuiviARVs().stream()
                            .map(saDto -> {
                                SuiviARV sa = mapper.toSuiviARV(saDto);
                                sa.setPage(page);
                                return sa;
                            }).toList());
                }

                // 🔹 PEC TB
                if (pageDto.getPriseEnChargeTbs() != null) {
                    page.setPriseEnChargeTbs(pageDto.getPriseEnChargeTbs().stream()
                            .map(tbDto -> {
                                PriseEnChargeTb tb = mapper.toPriseEnChargeTb(tbDto);
                                tb.setPage(page);
                                return tb;
                            }).toList());
                }
                // Debug log supprimé pour éviter les erreurs de substring

                // 🔑 Ajouter la page au dossier
                dossier.getPages().add(page);
            });
        }

        // --- Sauvegarde ---
        return dossierRepository.save(dossier);
    }


    @Transactional()
    public DossierViewDto dossierView(String codePatient) {
        // Chercher le dossier par code patient
        Dossier dossier = dossierRepository.findByPatientCode(codePatient)
                .orElseThrow(() -> new sn.uasz.Patient_PVVIH.exceptions.DossierNotFoundException(
                        "Aucun dossier trouvé pour le patient : " + codePatient));

        // --- Récupérer les informations du patient via Feign Client ---
        UserPatientDto patient;
        try {
            patient = userIntegrationService.getPatientByCode(codePatient);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la récupération des informations du patient: " + e.getMessage());
        }

        // --- Récupérer les informations du médecin créateur via Feign Client ---
        DoctorDto doctorCreate = null;
        if (dossier.getDoctorCreateCode() != null) {
            try {
                doctorCreate = userIntegrationService.getDoctorByCode(dossier.getDoctorCreateCode());
            } catch (Exception e) {
                // Log l'erreur mais ne pas faire échouer la récupération du dossier
                System.err.println("Erreur lors de la récupération du médecin créateur: " + e.getMessage());
            }
        }

        // --- Construction du DTO dossier ---
        DossierViewDto dto = new DossierViewDto();
        dto.setCodeDossier(dossier.getCodeDossier());
        dto.setCodePatient(patient.getCodePatient());
        dto.setIdentificationBiom(dossier.getIdentificationBiom());

        // ⚡️ Exposer des infos lisibles depuis les données Feign
        dto.setNomComplet(patient.getNom() + " " + patient.getPrenom());

        dto.setDoctorCreateNom(
                doctorCreate != null 
                        ? doctorCreate.getNom() + " " + doctorCreate.getPrenom()
                        : "Médecin inconnu"
        );


        // --- Mapper les pages ---
        dto.setPages(
                dossier.getPages().stream()
                        .map(page -> {
                            PageDTO pageDto = new PageDTO();
                            pageDto.setId(page.getId());

                            // ✅ SECTION I : Père
                            pageDto.setPereNomPrenoms(page.getPereNomPrenoms());
                            pageDto.setPereStatut(page.getPereStatut());
                            pageDto.setPereNiveauInstruction(page.getPereNiveauInstruction());
                            pageDto.setPereProfession(page.getPereProfession());
                            pageDto.setPereStatutVih(page.getPereStatutVih());
                            pageDto.setPereTelephone(page.getPereTelephone());

                            // ✅ SECTION I : Mère
                            pageDto.setMereNomPrenoms(page.getMereNomPrenoms());
                            pageDto.setMereStatut(page.getMereStatut());
                            pageDto.setMereNiveauInstruction(page.getMereNiveauInstruction());
                            pageDto.setMereProfession(page.getMereProfession());
                            pageDto.setMereStatutVih(page.getMereStatutVih());
                            pageDto.setMereTelephone(page.getMereTelephone());

                            // ✅ SECTION II : Naissance
                            pageDto.setNaissanceStructure(page.getNaissanceStructure());
                            pageDto.setPoidsNaissance(page.getPoidsNaissance());
                            pageDto.setTailleNaissance(page.getTailleNaissance());
                            pageDto.setPerimetreCranien(page.getPerimetreCranien());
                            pageDto.setApgar(page.getApgar());

                            // ✅ SECTION III : Entrée / Référence
                            pageDto.setPortesEntree(page.getPortesEntree() != null ? page.getPortesEntree() : new java.util.ArrayList<>());
                            pageDto.setReference(page.getReference());
                            pageDto.setDateReference(page.getDateReference());
                            pageDto.setSiteOrigine(page.getSiteOrigine());

                            // ✅ SECTION IV : Dépistage
                            pageDto.setDateTest(page.getDateTest());
                            pageDto.setDateConfirmation(page.getDateConfirmation());
                            pageDto.setLieuTest(page.getLieuTest());
                            pageDto.setResultat(page.getResultat());

                            // ✅ SECTION V : Education thérapeutique (ETP)
                            pageDto.setDateDebutETP(page.getDateDebutETP());
                            pageDto.setAgeETP(page.getAgeETP());
                            pageDto.setAnnonceComplete(page.getAnnonceComplete());
                            pageDto.setAgeAnnonce(page.getAgeAnnonce());

                            // ✅ SECTION VI : Vaccins
                            pageDto.setVaccins(page.getVaccins() != null ? page.getVaccins() : new java.util.ArrayList<>());
                            pageDto.setAutresVaccins(page.getAutresVaccins());

                            // ✅ SECTION VII : PTME
                            pageDto.setEnfantProphylaxieArvNaissance(page.getEnfantProphylaxieArvNaissance());
                            pageDto.setEnfantProphylaxieCotrimoxazole(page.getEnfantProphylaxieCotrimoxazole());
                            pageDto.setEnfantAlimentation(page.getEnfantAlimentation() != null ? page.getEnfantAlimentation() : new java.util.ArrayList<>());
                            pageDto.setEnfantSevrageAgeMois(page.getEnfantSevrageAgeMois());
                            pageDto.setEnfantNumeroSeropositif(page.getEnfantNumeroSeropositif());
                            pageDto.setMereTritherapieGrossesse(page.getMereTritherapieGrossesse());

                            // ✅ SECTION VIII : ARV
                            pageDto.setDateDebutArv(page.getDateDebutArv() != null ? java.time.LocalDate.parse(page.getDateDebutArv()) : null);
                            pageDto.setProtocoleInitialArv(page.getProtocoleInitialArv());
                            pageDto.setProtocoleActuelArv(page.getProtocoleActuelArv());
                            // Champs additionnels exposés depuis l'entité
                            pageDto.setProtocole(page.getProtocole());
                            pageDto.setArv(page.getArv());
                            pageDto.setDateDebutArv2(page.getDateDebutArv2());
                            pageDto.setArvStadeOmsInitial(page.getArvStadeOmsInitial());
                            pageDto.setStadeOmsInitial(page.getStadeOmsInitial() != null ? page.getStadeOmsInitial() : new java.util.ArrayList<>());

                            // ✅ SECTION IX : Répondants légaux
                            pageDto.setRepondant1Nom(page.getRepondant1Nom());
                            pageDto.setRepondant1Lien(page.getRepondant1Lien());
                            pageDto.setRepondant1Niveau(page.getRepondant1Niveau());
                            pageDto.setRepondant1Profession(page.getRepondant1Profession());
                            pageDto.setRepondant1Tel(page.getRepondant1Tel());

                            pageDto.setRepondant2Nom(page.getRepondant2Nom());
                            pageDto.setRepondant2Lien(page.getRepondant2Lien());
                            pageDto.setRepondant2Niveau(page.getRepondant2Niveau());
                            pageDto.setRepondant2Profession(page.getRepondant2Profession());
                            pageDto.setRepondant2Tel(page.getRepondant2Tel());

                            // ✅ SECTION X : Antécédents & OMS
                            pageDto.setTuberculose(page.getTuberculose());
                            pageDto.setAutresAnt(page.getAutresAnt());
                            pageDto.setProfession(page.getProfession());
                            pageDto.setStatutFamilial(page.getStatutFamilial());

                            // ✅ SECTION XI : Contact & Soutien
                            pageDto.setPersonneContact(page.getPersonneContact());
                            pageDto.setTelephoneContact(page.getTelephoneContact());
                            pageDto.setSoutienNom(page.getSoutienNom());
                            pageDto.setSoutienPrenoms(page.getSoutienPrenoms());
                            pageDto.setSoutienLien(page.getSoutienLien());
                            pageDto.setSoutienTelephone(page.getSoutienTelephone());
                            pageDto.setSoutienAdresse(page.getSoutienAdresse());

                            // ✅ SECTION XII : TAR
                            pageDto.setStadeOms(page.getStadeOms());
                            pageDto.setDateDebutTar(page.getDateDebutTar());
                            pageDto.setProtocoleInitialTar(page.getProtocoleInitialTar());

                            // ✅ SECTION XIII : Autres infos
                            pageDto.setNbGrossessesPtme(page.getNbGrossessesPtme());
                            pageDto.setContraception(page.getContraception());
                            pageDto.setPrep(page.getPrep());
                            pageDto.setMaladiesChroniques(page.getMaladiesChroniques());
                            pageDto.setAutresMaladiesChroniques(page.getAutresMaladiesChroniques());

                            // ✅ Liaison
                            pageDto.setDossierCode(page.getDossier() != null ? page.getDossier().getCodeDossier() : null);

                            // ✅ Mapper les sous-entités
                                pageDto.setBilans(
                                    page.getBilans() == null ? new java.util.ArrayList<>() : page.getBilans().stream()
                                        .map(mapper::toBilanDTO)
                                        .toList()
                                );


                            pageDto.setIndexTests(
                                    page.getIndexTests().stream()
                                            .map(mapper::toIndexTestDTO)
                                            .toList()
                            );

                            pageDto.setPtmes(
                                    page.getPtmes().stream()
                                            .map(mapper::toPtmeDTO)
                                            .toList()
                            );

                                pageDto.setSuiviARVs(
                                    page.getSuiviARVs() == null ? new java.util.ArrayList<>() : page.getSuiviARVs().stream()
                                        .map(mapper::toSuiviARVDTO)
                                        .toList()
                                );

                                pageDto.setSuiviPathologiques(
                                    page.getSuiviPathologiques() == null ? new java.util.ArrayList<>() : page.getSuiviPathologiques().stream()
                                        .map(mapper::toSuiviPathologiqueDTO)
                                        .toList()
                                );

                                pageDto.setSuiviImmunovirologiques(
                                    page.getSuiviImmunovirologiques() == null ? new java.util.ArrayList<>() : page.getSuiviImmunovirologiques().stream()
                                        .map(mapper::toSuiviImmunovirologiqueDTO)
                                        .toList()
                                );

                                pageDto.setPriseEnChargeTbs(
                                    page.getPriseEnChargeTbs() == null ? new java.util.ArrayList<>() : page.getPriseEnChargeTbs().stream()
                                        .map(mapper::toPriseEnChargeTbDTO)
                                        .toList()
                                );

                            pageDto.setDepistageFamiliales(
                                    page.getDepistageFamiliales().stream()
                                            .map(mapper::toDepistageFamilialeDTO)
                                            .toList()
                            );

                            return pageDto;
                        })
                        .toList()
        );

        return dto;
    }

    public boolean hasDossier(String codePatient) {
        return dossierRepository.findByPatientCode(codePatient).isPresent();
    }
    public UserPatientDto getPatientWithDossier(String codePatient) {
        // Récupérer les informations du patient via Feign Client
        try {
            return userIntegrationService.getPatientByCode(codePatient);
        } catch (Exception e) {
            throw new RuntimeException("Patient non trouvé: " + codePatient, e);
        }
    }

}
