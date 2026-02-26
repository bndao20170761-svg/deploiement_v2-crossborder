package sn.uasz.User_API_PVVIH.services;

import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import sn.uasz.User_API_PVVIH.dtos.AssistantSocialDto;
import sn.uasz.User_API_PVVIH.entities.AssistantSocial;
import sn.uasz.User_API_PVVIH.entities.Hopital;
import sn.uasz.User_API_PVVIH.entities.User;
import sn.uasz.User_API_PVVIH.mappers.AdminMapper;
import sn.uasz.User_API_PVVIH.repositories.AssistantSocialRepository;
import sn.uasz.User_API_PVVIH.repositories.HopitalRepository;
import sn.uasz.User_API_PVVIH.repositories.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class AssistantSocialService {

    private final AssistantSocialRepository assistantSocialRepository;
    private final AdminMapper adminMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final HopitalRepository hopitalRepository;

    public AssistantSocialService(AssistantSocialRepository assistantSocialRepository, 
                                 AdminMapper adminMapper,
                                 UserRepository userRepository, 
                                 PasswordEncoder passwordEncoder,
                                 HopitalRepository hopitalRepository) {
        this.assistantSocialRepository = assistantSocialRepository;
        this.adminMapper = adminMapper;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.hopitalRepository = hopitalRepository;
    }

    public List<AssistantSocialDto> getAllAssistants() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent consulter la liste des assistants sociaux");
        }

        return assistantSocialRepository.findAll().stream()
                .map(adminMapper::assistantSocialToDto)
                .collect(Collectors.toList());
    }

    private String generateAlphaNumericCode(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder code = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < length; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }
        return code.toString();
    }

    @Transactional
    public AssistantSocialDto creerAssistant(AssistantSocialDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent créer des assistants sociaux");
        }

        if (dto.getCodeAssistant() == null || dto.getCodeAssistant().isBlank()) {
            throw new RuntimeException("Le code assistant est obligatoire");
        }

        if (assistantSocialRepository.existsByCodeAssistant(dto.getCodeAssistant())) {
            throw new RuntimeException("Un assistant social avec ce code existe déjà: " + dto.getCodeAssistant());
        }

        AssistantSocial assistant = adminMapper.dtoToAssistantSocial(dto);

        if (dto.getHopitalId() != null) {
            Hopital hopital = hopitalRepository.findById(dto.getHopitalId())
                    .orElseThrow(() -> new RuntimeException("Hôpital non trouvé avec ID: " + dto.getHopitalId()));
            assistant.setHopital(hopital);
        }

        String assistantUsername = dto.getEmail();
        if (assistantUsername == null || assistantUsername.isBlank()) {
            throw new RuntimeException("L'email est obligatoire");
        }

        Optional<User> existingUser = userRepository.findByUsername(assistantUsername);
        if (existingUser.isPresent()) {
            throw new RuntimeException("Un utilisateur avec cet email existe déjà");
        }

        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new RuntimeException("Le mot de passe est obligatoire");
        }

        User assistantUser = User.builder()
                .username(assistantUsername)
                .nom(dto.getNomUtilisateur())
                .prenom(dto.getPrenomUtilisateur())
                .nationalite(dto.getNationaliteUtilisateur())
                .profil("ASSISTANT")
                .active(true)
                .password(passwordEncoder.encode(dto.getPassword()))
                .dateCreation(LocalDateTime.now())
                .build();

        assistantUser = userRepository.save(assistantUser);
        assistant.setUtilisateur(assistantUser);

        assistant.setCodeAssistant(dto.getCodeAssistant());

        String pseudo;
        do {
            pseudo = "AS" + generateAlphaNumericCode(4);
        } while (assistantSocialRepository.existsByPseudo(pseudo));
        assistant.setPseudo(pseudo);

        AssistantSocial savedAssistant = assistantSocialRepository.save(assistant);
        return adminMapper.assistantSocialToDto(savedAssistant);
    }

    @Transactional
    public AssistantSocialDto modifierAssistant(String codeAssistant, AssistantSocialDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent modifier des assistants sociaux");
        }

        AssistantSocial existingAssistant = assistantSocialRepository.findByCodeAssistant(codeAssistant)
                .orElseThrow(() -> new RuntimeException("Assistant social non trouvé avec code: " + codeAssistant));

        existingAssistant.setEmail(dto.getEmail());
        existingAssistant.setLieuExercice(dto.getLieuExercice());
        existingAssistant.setTelephone(dto.getTelephone());

        if (dto.getHopitalId() != null) {
            Hopital hopital = hopitalRepository.findById(dto.getHopitalId())
                    .orElseThrow(() -> new RuntimeException("Hôpital non trouvé avec ID: " + dto.getHopitalId()));
            existingAssistant.setHopital(hopital);
        }

        User assistantUser = existingAssistant.getUtilisateur();
        if (assistantUser != null) {
            assistantUser.setNom(dto.getNomUtilisateur());
            assistantUser.setPrenom(dto.getPrenomUtilisateur());
            assistantUser.setNationalite(dto.getNationaliteUtilisateur());

            if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
                assistantUser.setPassword(passwordEncoder.encode(dto.getPassword()));
            }

            userRepository.save(assistantUser);
        }

        AssistantSocial updatedAssistant = assistantSocialRepository.save(existingAssistant);
        return adminMapper.assistantSocialToDto(updatedAssistant);
    }

    @Transactional
    public void supprimerAssistant(String codeAssistant) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent supprimer des assistants sociaux");
        }

        AssistantSocial assistant = assistantSocialRepository.findByCodeAssistant(codeAssistant)
                .orElseThrow(() -> new RuntimeException("Assistant social non trouvé avec code: " + codeAssistant));

        User user = assistant.getUtilisateur();

        assistantSocialRepository.delete(assistant);

        if (user != null) {
            boolean isReferencedElsewhere = assistantSocialRepository.existsByUtilisateurAndCodeAssistantNot(user, codeAssistant);
            if (!isReferencedElsewhere) {
                userRepository.delete(user);
            }
        }
    }

    public AssistantSocialDto getAssistantByCode(String codeAssistant) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));

        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil())) {
            throw new RuntimeException("Seuls les administrateurs peuvent consulter les détails d'un assistant social");
        }

        AssistantSocial assistant = assistantSocialRepository.findByCodeAssistant(codeAssistant)
                .orElseThrow(() -> new RuntimeException("Assistant social non trouvé avec code: " + codeAssistant));

        return adminMapper.assistantSocialToDto(assistant);
    }

    public boolean existsByCodeAssistant(String codeAssistant) {
        return assistantSocialRepository.existsByCodeAssistant(codeAssistant);
    }

    public long countAssistants() {
        return assistantSocialRepository.count();
    }

    /**
     * Récupère un assistant par username/email
     * Permet aux assistants de récupérer leurs propres infos et aux admins de récupérer n'importe quel assistant
     */
    public AssistantSocialDto getAssistantByUsername(String username) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));
        
        // Vérifier que l'utilisateur est soit ADMIN, soit l'assistant lui-même
        if (!"ADMIN".equalsIgnoreCase(currentUser.getProfil()) && !username.equals(currentUsername)) {
            throw new RuntimeException("Vous ne pouvez récupérer que vos propres informations");
        }
        
        Optional<AssistantSocial> assistantOpt = assistantSocialRepository.findByUtilisateur_Username(username);
        
        if (assistantOpt.isEmpty()) {
            // Si l'utilisateur n'a pas de record assistant mais a le profil ASSISTANT, 
            // cela peut arriver dans certains cas - on lance une exception
            throw new RuntimeException("Assistant social non trouvé pour username: " + username);
        }
        
        AssistantSocial assistant = assistantOpt.get();
        return adminMapper.assistantSocialToDto(assistant);
    }
}