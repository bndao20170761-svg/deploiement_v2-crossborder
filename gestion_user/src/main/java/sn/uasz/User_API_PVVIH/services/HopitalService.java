package sn.uasz.User_API_PVVIH.services;

import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import sn.uasz.User_API_PVVIH.dtos.HopitalDto;
import sn.uasz.User_API_PVVIH.dtos.PrestataireDto;
import sn.uasz.User_API_PVVIH.dtos.ServiceDto;
import sn.uasz.User_API_PVVIH.entities.Doctor;
import sn.uasz.User_API_PVVIH.entities.Hopital;
import sn.uasz.User_API_PVVIH.entities.Prestataire;
import sn.uasz.User_API_PVVIH.entities.User;
import sn.uasz.User_API_PVVIH.mappers.AdminMapper;
import sn.uasz.User_API_PVVIH.repositories.DoctorRepository;
import sn.uasz.User_API_PVVIH.repositories.HopitalRepository;
import sn.uasz.User_API_PVVIH.repositories.PrestataireRepository;
import sn.uasz.User_API_PVVIH.repositories.UserRepository;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class HopitalService {

    private final HopitalRepository hopitalRepository;
    private final AdminMapper adminMapper;
    private final UserRepository userRepository;
    private  final DoctorRepository doctorRepository;
    private  final PrestataireRepository prestataireRepository;

    public HopitalService(HopitalRepository hopitalRepository, AdminMapper adminMapper,
                          UserRepository userRepository, DoctorRepository doctorRepository, PrestataireRepository prestataireRepository) {
        this.hopitalRepository = hopitalRepository;
        this.adminMapper = adminMapper;
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.prestataireRepository = prestataireRepository;
    }

    // ✅ MÉTHODE HELPER : Charger un hôpital avec services et prestataires (évite MultipleBagFetchException)
    private Hopital loadHopitalWithServicesAndPrestataires(Long id) {
        // Charger d'abord avec services
        Hopital hopital = hopitalRepository.findByIdWithServices(id)
                .orElseThrow(() -> new RuntimeException("Hôpital non trouvé avec ID: " + id));
        
        // ✅ CORRECTION: Toujours charger les prestataires via repository pour éviter les problèmes de collection
        ensurePrestatairesLoaded(hopital);
        
        return hopital;
    }



    /*public HopitalDto creerHopital(HopitalDto hopitalDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        // Récupérer l'utilisateur courant
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        // Initialiser le champ 'active' selon le rôle
        if ("ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            hopitalDto.setActive(true); // Admin : actif directement
        } else if ("DOCTOR".equalsIgnoreCase(currentUser.getProfil())) {
            hopitalDto.setActive(false); // Doctor : pas actif
        } else {
            // Optionnel : pour les autres profils
            hopitalDto.setActive(false);
        }

        // Mapper le DTO en entité
        Hopital hopital = adminMapper.dtoToHopital(hopitalDto);

        // Sauvegarder dans la base
        hopital = hopitalRepository.save(hopital);

        // Retourner le DTO
        return adminMapper.hopitalToDto(hopital);
    }
*/





    public HopitalDto getHopitalById(Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        String profil = currentUser.getProfil();
        if (!"ADMIN".equalsIgnoreCase(profil) && 
            !"DOCTOR".equalsIgnoreCase(profil) && 
            !"ASSISTANT".equalsIgnoreCase(profil)) {
            throw new RuntimeException("Seuls les administrateurs, docteurs et assistants peuvent consulter les détails d'un hôpital");
        }

        Hopital hopital = loadHopitalWithServicesAndPrestataires(id);

        return adminMapper.hopitalToDto(hopital);
    }

    public boolean existsById(Long id) {
        return hopitalRepository.existsById(id);
    }

    public long countHospitals() {
        return hopitalRepository.count();
    }

    // Méthode pour trouver les hôpitaux par pays
    public List<HopitalDto> getHospitalsByCountry(String pays) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent consulter cette liste");
        }

        return hopitalRepository.findByPays(pays).stream()
                .map(adminMapper::hopitalToDto)
                .collect(Collectors.toList());
    }

    // Méthode pour trouver les hôpitaux par ville
    public List<HopitalDto> getHospitalsByCity(String ville) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent consulter cette liste");
        }

        return hopitalRepository.findByVille(ville).stream()
                .map(adminMapper::hopitalToDto)
                .collect(Collectors.toList());
    }

    // Méthode pour activer/désactiver un hôpital
    @Transactional
    public HopitalDto toggleHospitalStatus(Long id, boolean active) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        // Vérifier le privilège ADMIN
        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent modifier le statut des hôpitaux");
        }

        Hopital hopital = hopitalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hôpital non trouvé avec ID: " + id));

        hopital.setActive(active);
        Hopital updatedHopital = hopitalRepository.save(hopital);

        return adminMapper.hopitalToDto(updatedHopital);
    }

    public List<HopitalDto> getHospitauxActifs() {
        // Pas besoin de vérifier le rôle ADMIN - accessible à tous les authentifiés
        return hopitalRepository.findByActiveTrue().stream()
                .map(adminMapper::hopitalToDto)
                .collect(Collectors.toList());
    }

    public List<HopitalDto> getHospitauxPourCarte() {
        // Pas besoin de vérifier le rôle ADMIN - accessible à tous les authentifiés
        return hopitalRepository.findByActiveTrue().stream()
                .filter(hopital -> hopital.getLatitude() != null && hopital.getLongitude() != null)
                .map(adminMapper::hopitalToDto)
                .collect(Collectors.toList());
    }

    public List<HopitalDto> rechercherHospitaux(String ville, String pays) {
        List<Hopital> hopitaux;

        if (ville != null && pays != null) {
            hopitaux = hopitalRepository.findByVilleAndPaysAndActiveTrue(ville, pays);
        } else if (ville != null) {
            hopitaux = hopitalRepository.findByVilleAndActiveTrue(ville);
        } else if (pays != null) {
            hopitaux = hopitalRepository.findByPaysAndActiveTrue(pays);
        } else {
            hopitaux = hopitalRepository.findByActiveTrue();
        }

        return hopitaux.stream()
                .map(adminMapper::hopitalToDto)
                .collect(Collectors.toList());
    }

    public HopitalDto getHopitalAvecDetails(Long id) {
        Hopital hopital = loadHopitalWithServicesAndPrestataires(id);

        return adminMapper.hopitalToDto(hopital);
    }

    // Récupérer tous les hôpitaux désactivés (accessible uniquement par l'ADMIN)
    public List<HopitalDto> getInactiveHospitals() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent consulter les hôpitaux désactivés");
        }

        return hopitalRepository.findByActiveFalse().stream()
                .map(adminMapper::hopitalToDto)
                .collect(Collectors.toList());
    }






    // NOUVELLE METHODE : Récupérer les hôpitaux créés par le docteur + tous les hôpitaux actifs
    // Pour ASSISTANT : retourner uniquement les hôpitaux actifs
    public List<HopitalDto> getHospitalsByCurrentDoctor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        String profil = currentUser.getProfil();
        
        // ✅ NOUVEAU : Si l'utilisateur est un ASSISTANT, retourner uniquement les hôpitaux actifs
        if ("ASSISTANT".equalsIgnoreCase(profil)) {
            return hopitalRepository.findByActiveTrue().stream()
                    .map(adminMapper::hopitalToDto)
                    .collect(Collectors.toList());
        }

        // ✅ LOGIQUE EXISTANTE : Pour les docteurs (ne pas modifier)
        if (!"DOCTOR".equalsIgnoreCase(profil)) {
            throw new RuntimeException("Seuls les docteurs et assistants peuvent consulter les hôpitaux");
        }

        Doctor doctor = doctorRepository.findByUser(currentUser)
                .orElseThrow(() -> new RuntimeException("Docteur non trouvé"));

        // Récupérer les hôpitaux créés par ce docteur
        List<Hopital> hopitauxCrees = hopitalRepository.findByCreatedByDoctor(doctor);
        
        // Récupérer tous les hôpitaux actifs
        List<Hopital> hopitauxActifs = hopitalRepository.findByActiveTrue();
        
        // Combiner les deux listes et supprimer les doublons
        Set<Hopital> hopitauxUniques = new HashSet<>();
        hopitauxUniques.addAll(hopitauxCrees);
        hopitauxUniques.addAll(hopitauxActifs);
        
        return hopitauxUniques.stream()
                .map(adminMapper::hopitalToDto)
                .collect(Collectors.toList());
    }

    // NOUVELLE METHODE : Récupérer tous les hôpitaux pour la carte
    public List<HopitalDto> getAllHospitalsForMap() {
        // Accessible à tous les utilisateurs authentifiés
        return hopitalRepository.findAll().stream()
                .map(adminMapper::hopitalToDto)
                .collect(Collectors.toList());
    }





    @Transactional
    public HopitalDto creerHopital(HopitalDto hopitalDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        // Récupérer l'utilisateur courant
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        // Mapper le DTO en entité
        Hopital hopital = adminMapper.dtoToHopital(hopitalDto);

        // 🔹 Initialiser les collections
        if (hopital.getServices() == null) {
            hopital.setServices(new ArrayList<>());
        }
        if (hopital.getPrestataires() == null) {
            hopital.setPrestataires(new ArrayList<>());
        }

        // Initialiser le champ 'active' selon le rôle
        if ("ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            hopital.setActive(true);
        } else if ("DOCTOR".equalsIgnoreCase(currentUser.getProfil())) {
            hopital.setActive(false);
            Doctor doctor = doctorRepository.findByUser(currentUser)
                    .orElseThrow(() -> new RuntimeException("Docteur non trouvé pour cet utilisateur"));
            hopital.setCreatedByDoctor(doctor);
        } else {
            hopital.setActive(false);
        }

        // 🔹 GESTION DES SERVICES
        // 🔹 GESTION DES SERVICES
        final Hopital finalHopital = hopital;

        if (hopitalDto.getServices() != null && !hopitalDto.getServices().isEmpty()) {
            hopitalDto.getServices().forEach(service -> {
                sn.uasz.User_API_PVVIH.entities.Service serviceEntity;

                // SUPPRIMEZ la vérification instanceof String - les services sont maintenant des ServiceDto
                if (service instanceof ServiceDto) {
                    serviceEntity = adminMapper.dtoToService((ServiceDto) service);
                    serviceEntity.setHopital(finalHopital);
                } else {
                    // Fallback si ce n'est pas un ServiceDto
                    serviceEntity = sn.uasz.User_API_PVVIH.entities.Service.builder()
                            .type("Service inconnu")
                            .hopital(finalHopital)
                            .build();
                }
                finalHopital.getServices().add(serviceEntity);
            });
        } else {
            // Service par défaut
            sn.uasz.User_API_PVVIH.entities.Service serviceConsultation = sn.uasz.User_API_PVVIH.entities.Service.builder()
                    .type("Consultation VIH")
                    .hopital(finalHopital)
                    .build();
            finalHopital.getServices().add(serviceConsultation);
        }

        // 🔹 GESTION DES PRESTATAIRES
        System.out.println("🔍 DEBUG: Prestataires reçus: " + (hopitalDto.getPrestataires() != null ? hopitalDto.getPrestataires().size() : "null"));
        if (hopitalDto.getPrestataires() != null && !hopitalDto.getPrestataires().isEmpty()) {
            hopitalDto.getPrestataires().forEach(prestataireDto -> {
                try {
                    System.out.println("🔍 DEBUG: Prestataire reçu: " + prestataireDto);
                    if (prestataireDto instanceof PrestataireDto) {
                        PrestataireDto prestataireDtoObj = (PrestataireDto) prestataireDto;
                        System.out.println("🔍 DEBUG: PrestataireDto: nom=" + prestataireDtoObj.getNom() + ", type=" + prestataireDtoObj.getType());
                        
                        // Créer un nouveau prestataire directement associé à l'hôpital
                        Prestataire prestataire = adminMapper.dtoToPrestataire(prestataireDtoObj);
                        prestataire.setHopital(finalHopital); // ✅ Associer directement à l'hôpital
                        
                        System.out.println("🔍 DEBUG: Prestataire créé: " + prestataire.getNom() + ", hôpital: " + finalHopital.getNom());
                        
                        // Sauvegarder le prestataire
                        prestataire = prestataireRepository.save(prestataire);
                        System.out.println("🔍 DEBUG: Prestataire sauvegardé avec ID: " + prestataire.getId());

                        // Ajouter à la liste des prestataires de l'hôpital
                        finalHopital.getPrestataires().add(prestataire);

                        System.out.println("✅ Prestataire ajouté: " + prestataire.getNom());
                    } else {
                        System.out.println("❌ DEBUG: PrestataireDto n'est pas une instance de PrestataireDto: " + prestataireDto.getClass());
                    }
                } catch (Exception e) {
                    System.err.println("❌ Erreur création prestataire: " + e.getMessage());
                    e.printStackTrace();
                }
            });
        } else {
            System.out.println("⚠️ DEBUG: Aucun prestataire à traiter");
        }

        // Sauvegarder l'hôpital avec ses relations
        hopital = hopitalRepository.save(hopital);

        // Retourner le DTO
        return adminMapper.hopitalToDto(hopital);
    }


    @Transactional
    public HopitalDto modifierHopital(Long id, HopitalDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        // ✅ CHANGEMENT: Utiliser loadHopitalWithServicesAndPrestataires pour charger les prestataires (évite MultipleBagFetchException)
        Hopital existingHopital = loadHopitalWithServicesAndPrestataires(id);

        // ✅ S'assurer que les prestataires sont chargés (inspiré de votre exemple)
        ensurePrestatairesLoaded(existingHopital);

        // ✅ Vérification des permissions : ADMIN peut modifier tous, DOCTOR peut modifier seulement ses propres hôpitaux
        boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getProfil());
        boolean isDoctor = "DOCTOR".equalsIgnoreCase(currentUser.getProfil());
        
        if (!isAdmin) {
            if (isDoctor) {
                Doctor doctor = doctorRepository.findByUtilisateur(currentUser)
                        .orElseThrow(() -> new RuntimeException("Médecin non trouvé pour cet utilisateur"));

                boolean isCreator = existingHopital.getCreatedByDoctor() != null &&
                        existingHopital.getCreatedByDoctor().getCodeDoctor().equals(doctor.getCodeDoctor());

                boolean sameHospital = doctor.getHopital() != null &&
                        doctor.getHopital().getId() != null &&
                        doctor.getHopital().getId().equals(existingHopital.getId());

                if (!isCreator && !sameHospital) {
                    throw new RuntimeException("Vous n'êtes pas autorisé à modifier cet hôpital. Seuls les administrateurs, le créateur de l'hôpital ou un médecin affilié peuvent le modifier.");
                }
            } else {
                throw new RuntimeException("Vous n'êtes pas autorisé à modifier cet hôpital. Seuls les administrateurs ou les médecins affiliés peuvent le modifier.");
            }
        }

        // Mettre à jour les champs de l'hôpital
        existingHopital.setNom(dto.getNom());
        existingHopital.setPays(dto.getPays());
        existingHopital.setVille(dto.getVille());
        existingHopital.setLatitude(dto.getLatitude());
        existingHopital.setLongitude(dto.getLongitude());
        existingHopital.setAdresseComplete(dto.getAdresseComplete());
        existingHopital.setTelephoneFixe(dto.getTelephoneFixe());
        existingHopital.setType(dto.getType());

        // Seul l'admin peut modifier le statut actif
        if ("ADMIN".equalsIgnoreCase(currentUser.getProfil()) && dto.getActive() != null) {
            existingHopital.setActive(dto.getActive());
        }

        // 🔹 Mise à jour des services
        if (dto.getServices() != null) {
            // Supprimer les services existants
            existingHopital.getServices().clear();

            // Ajouter les nouveaux services
            dto.getServices().forEach(service -> {
                sn.uasz.User_API_PVVIH.entities.Service serviceEntity;

                if (service instanceof ServiceDto) {
                    serviceEntity = adminMapper.dtoToService((ServiceDto) service);
                    serviceEntity.setHopital(existingHopital);
                    existingHopital.getServices().add(serviceEntity);
                } else {
                    // Fallback pour les strings ou autres types
                    serviceEntity = sn.uasz.User_API_PVVIH.entities.Service.builder()
                            .type(service.toString())
                            .hopital(existingHopital)
                            .build();
                    existingHopital.getServices().add(serviceEntity);
                }
            });
        } else {
            // Si aucun service n'est fourni, garder les services existants
            // Ou ajouter un service par défaut si vide
            if (existingHopital.getServices().isEmpty()) {
                sn.uasz.User_API_PVVIH.entities.Service serviceConsultation = sn.uasz.User_API_PVVIH.entities.Service.builder()
                        .type("Consultation VIH")
                        .hopital(existingHopital)
                        .build();
                existingHopital.getServices().add(serviceConsultation);
            }
        }

        // 🔹 Mise à jour des prestataires (inspiré de votre exemple)
        if (dto.getPrestataires() != null && !dto.getPrestataires().isEmpty()) {
            // ✅ Supprimer tous les prestataires existants de cet hôpital
            List<Prestataire> prestatairesToRemove = new ArrayList<>(existingHopital.getPrestataires());
            for (Prestataire prestataire : prestatairesToRemove) {
                prestataire.setHopital(null); // Désassocier de l'hôpital
                prestataireRepository.delete(prestataire); // Supprimer de la base
            }
            existingHopital.getPrestataires().clear();

            // ✅ Ajouter les nouveaux prestataires
            dto.getPrestataires().forEach(prestataireDto -> {
                try {
                    if (prestataireDto instanceof PrestataireDto) {
                        PrestataireDto prestataireDtoObj = (PrestataireDto) prestataireDto;

                        // Créer un nouveau prestataire
                        Prestataire prestataire = adminMapper.dtoToPrestataire(prestataireDtoObj);
                        prestataire.setHopital(existingHopital); // ✅ Associer à l'hôpital
                        prestataire = prestataireRepository.save(prestataire);

                        // Ajouter à la liste des prestataires de l'hôpital
                        existingHopital.getPrestataires().add(prestataire);

                        System.out.println("✅ Prestataire associé: " + prestataire.getNom());
                    }
                } catch (Exception e) {
                    System.err.println("❌ Erreur association prestataire: " + e.getMessage());
                    e.printStackTrace();
                }
            });
        } else {
            // ✅ Si aucun prestataire n'est fourni, garder les prestataires existants
            // (Les prestataires sont déjà chargés par loadHopitalWithServicesAndPrestataires)
            System.out.println("ℹ️ Aucun changement pour les prestataires - " + 
                existingHopital.getPrestataires().size() + " prestataires conservés");
        }

        // ✅ CHANGEMENT: Sauvegarder sans recharger avec les collections
        Hopital updatedHopital = hopitalRepository.save(existingHopital);

        // ✅ S'assurer que les prestataires sont chargés dans le résultat final
        ensurePrestatairesLoaded(updatedHopital);

        return adminMapper.hopitalToDto(updatedHopital);
    }

    // 🔹 NOUVELLE MÉTHODE : Récupérer un hôpital avec ses services détaillés
    public HopitalDto getHopitalAvecServices(Long id) {
        Hopital hopital = hopitalRepository.findByIdWithServices(id)
                .orElseThrow(() -> new RuntimeException("Hôpital non trouvé avec ID: " + id));

        HopitalDto dto = adminMapper.hopitalToDto(hopital);

        // 🔹 Mapper les services
        if (hopital.getServices() != null) {
            List<ServiceDto> serviceDtos = hopital.getServices().stream()
                    .map(adminMapper::serviceToDto) // ✅ Correction : serviceToDto au lieu de toServiceDto
                    .collect(Collectors.toList());
            dto.setServices(serviceDtos);
        }

        return dto;
    }

    // 🔹 NOUVELLE MÉTHODE : Récupérer un hôpital avec ses prestataires
    public HopitalDto getHopitalAvecPrestataires(Long id) {
        Hopital hopital = loadHopitalWithServicesAndPrestataires(id);

        return adminMapper.hopitalToDto(hopital);
    }

    // 🔹 MÉTHODE UTILITAIRE : S'assurer que les prestataires sont chargés (inspiré de votre exemple)
    private void ensurePrestatairesLoaded(Hopital hopital) {
        if (hopital.getPrestataires() == null || hopital.getPrestataires().isEmpty()) {
            // Recharger les prestataires si ils ne sont pas chargés
            List<Prestataire> prestataires = prestataireRepository.findByHopitalId(hopital.getId());
            // ✅ CORRECTION: Modifier la collection existante au lieu de la remplacer
            if (hopital.getPrestataires() == null) {
                hopital.setPrestataires(new ArrayList<>());
            }
            // Vider et remplir la collection existante
            hopital.getPrestataires().clear();
            if (prestataires != null) {
                for (Prestataire p : prestataires) {
                    // S'assurer que chaque prestataire référence bien l'objet hopital courant
                    p.setHopital(hopital);
                }
                hopital.getPrestataires().addAll(prestataires);
            }
            System.out.println("🔄 Prestataires rechargés pour l'hôpital " + hopital.getNom() + ": " + prestataires.size());
        }
    }

    // 🔹 NOUVELLE MÉTHODE : Récupérer les prestataires d'un hôpital
    public List<PrestataireDto> getPrestatairesByHopitalId(Long hopitalId) {
        List<Prestataire> prestataires = prestataireRepository.findByHopitalId(hopitalId);
        int found = prestataires == null ? 0 : prestataires.size();
        System.out.println("🔍 getPrestatairesByHopitalId hopitalId=" + hopitalId + " -> found=" + found);
        if (found > 0) {
            for (Prestataire p : prestataires) {
                Long hopId = (p.getHopital() != null) ? p.getHopital().getId() : null;
                System.out.println("  • Prestataire id=" + p.getId() + " nom='" + p.getNom() + "' hopitalId=" + hopId + " type=" + p.getType());
            }
        } else {
            System.out.println("  (aucun prestataire trouvé pour l'hôpital " + hopitalId + ")");
        }

        return prestataires.stream()
                .map(adminMapper::prestataireToDto)
                .collect(Collectors.toList());
    }

    // 🔹 NOUVELLE MÉTHODE : Ajouter un service à un hôpital existant
    // 🔹 NOUVELLE MÉTHODE : Ajouter un service à un hôpital existant
    @Transactional
    public HopitalDto ajouterService(Long hopitalId, ServiceDto serviceDto) {
        Hopital hopital = loadHopitalWithServicesAndPrestataires(hopitalId);

        sn.uasz.User_API_PVVIH.entities.Service service = adminMapper.dtoToService(serviceDto); // ✅ Correction ici
        service.setHopital(hopital);

        if (hopital.getServices() == null) {
            hopital.setServices(new ArrayList<>());
        }

        hopital.getServices().add(service);
        hopital = hopitalRepository.save(hopital);

        return adminMapper.hopitalToDto(hopital);
    }
    // Les autres méthodes restent inchangées...
    public List<HopitalDto> getAllHospitals() {
        // Vérifier que l'utilisateur est authentifié (optionnel selon votre configuration de sécurité)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Si vous voulez simplement vérifier l'authentification sans restriction de rôle
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Accès non autorisé");
        }

        // Retourner tous les hôpitaux sans restriction de rôle
        return hopitalRepository.findAll().stream()
                .map(adminMapper::hopitalToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void supprimerHopital(Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent supprimer des hôpitaux");
        }

        Hopital hopital = loadHopitalWithServicesAndPrestataires(id);

        boolean hasDoctors = hopitalRepository.countDoctorsByHospital(id) > 0;
        if (hasDoctors) {
            throw new RuntimeException("Impossible de supprimer l'hôpital : des médecins y sont associés");
        }

        hopitalRepository.delete(hopital);
    }

}