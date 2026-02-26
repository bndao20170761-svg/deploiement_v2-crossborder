package sn.uaz.Forum_PVVIH.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import sn.uaz.Forum_PVVIH.dtos.TranslationRequestDto;
import sn.uaz.Forum_PVVIH.dtos.TranslationResponseDto;
import sn.uaz.Forum_PVVIH.entities.Translation;
import sn.uaz.Forum_PVVIH.repositories.TranslationRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TranslationService {
    
    private final TranslationRepository translationRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    
    @Value("${translation.google.api-key:}")
    private String googleApiKey;
    
    @Value("${translation.libre.url:http://localhost:5000}")
    private String libreTranslateUrl;
    
    @Value("${translation.cache.enabled:true}")
    private boolean cacheEnabled;
    
    public TranslationResponseDto translate(TranslationRequestDto request) {
        log.info("🌐 Traduction demandée: {} -> {} ({})", 
                request.getSourceLanguage(), request.getTargetLanguage(), 
                request.getText().substring(0, Math.min(50, request.getText().length())));
        
        // 1. Vérifier le cache si activé
        if (cacheEnabled) {
            Optional<Translation> cachedTranslation = translationRepository
                    .findByOriginalTextAndSourceLanguageAndTargetLanguage(
                            request.getText(), request.getSourceLanguage(), request.getTargetLanguage());
            
            if (cachedTranslation.isPresent()) {
                log.info("✅ Traduction trouvée dans le cache");
                return convertToDto(cachedTranslation.get());
            }
        }
        
        // 2. Essayer Google Translate en premier
        Translation translation = null;
        try {
            translation = translateWithGoogle(request);
            log.info("✅ Traduction réussie avec Google Translate");
        } catch (Exception e) {
            log.warn("⚠️ Échec Google Translate: {}", e.getMessage());
            
            // 3. Fallback sur LibreTranslate
            try {
                translation = translateWithLibre(request);
                log.info("✅ Traduction réussie avec LibreTranslate");
            } catch (Exception e2) {
                log.error("❌ Échec de toutes les méthodes de traduction: {}", e2.getMessage());
                throw new RuntimeException("Impossible de traduire le texte");
            }
        }
        
        // 4. Sauvegarder en base
        Translation savedTranslation = translationRepository.save(translation);
        
        return convertToDto(savedTranslation);
    }
    
    private Translation translateWithGoogle(TranslationRequestDto request) {
        if (googleApiKey == null || googleApiKey.isEmpty()) {
            throw new RuntimeException("Clé API Google non configurée");
        }
        
        String url = "https://translation.googleapis.com/language/translate/v2?key=" + googleApiKey;
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("q", request.getText());
        requestBody.put("source", request.getSourceLanguage());
        requestBody.put("target", request.getTargetLanguage());
        requestBody.put("format", "text");
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
        
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            Map<String, Object> data = (Map<String, Object>) response.getBody();
            Map<String, Object> translations = (Map<String, Object>) data.get("data");
            List<Map<String, Object>> translationsList = (List<Map<String, Object>>) translations.get("translations");
            
            if (!translationsList.isEmpty()) {
                Map<String, Object> translation = translationsList.get(0);
                String translatedText = (String) translation.get("translatedText");
                String detectedSource = (String) translation.get("detectedSourceLanguage");
                
                return Translation.builder()
                        .originalText(request.getText())
                        .translatedText(translatedText)
                        .sourceLanguage(detectedSource != null ? detectedSource : request.getSourceLanguage())
                        .targetLanguage(request.getTargetLanguage())
                        .translationProvider("GOOGLE")
                        .confidenceScore(0.95) // Google Translate est généralement très fiable
                        .sujetId(request.getSujetId())
                        .commentaireId(request.getCommentaireId())
                        .userId(request.getUserId())
                        .isApproved(request.isAutoApprove())
                        .dateCreation(LocalDateTime.now())
                        .build();
            }
        }
        
        throw new RuntimeException("Erreur lors de la traduction avec Google");
    }
    
    private Translation translateWithLibre(TranslationRequestDto request) {
        // Note: LibreTranslate supporte le portugais, on peut essayer la traduction
        
        String url = libreTranslateUrl + "/translate";
        
        // Vérifier d'abord si LibreTranslate est accessible
        try {
            ResponseEntity<String> healthCheck = restTemplate.getForEntity(libreTranslateUrl, String.class);
            if (!healthCheck.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("LibreTranslate n'est pas accessible");
            }
        } catch (Exception e) {
            log.error("❌ LibreTranslate non accessible: {}", e.getMessage());
            throw new RuntimeException("LibreTranslate n'est pas accessible: " + e.getMessage());
        }
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("q", request.getText());
        requestBody.put("source", request.getSourceLanguage());
        requestBody.put("target", request.getTargetLanguage());
        requestBody.put("format", "text");
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        headers.set("User-Agent", "Forum-PVVIH/1.0");
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            log.info("🌐 Tentative de traduction avec LibreTranslate: {} -> {}", 
                    request.getSourceLanguage(), request.getTargetLanguage());
            
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            
            log.info("📡 Réponse LibreTranslate: {}", response.getStatusCode());
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> data = response.getBody();
                String translatedText = (String) data.get("translatedText");
                
                log.info("✅ Traduction LibreTranslate réussie: {}", translatedText);
                
                if (translatedText != null && !translatedText.isEmpty()) {
                    return Translation.builder()
                            .originalText(request.getText())
                            .translatedText(translatedText)
                            .sourceLanguage(request.getSourceLanguage())
                            .targetLanguage(request.getTargetLanguage())
                            .translationProvider("LIBRE")
                            .confidenceScore(0.80) // LibreTranslate est généralement moins fiable
                            .sujetId(request.getSujetId())
                            .commentaireId(request.getCommentaireId())
                            .userId(request.getUserId())
                            .isApproved(request.isAutoApprove())
                            .dateCreation(LocalDateTime.now())
                            .build();
                }
            }
            
            throw new RuntimeException("Réponse invalide de LibreTranslate");
            
        } catch (Exception e) {
            log.error("❌ Erreur lors de l'appel à LibreTranslate: {}", e.getMessage());
            
            // Si c'est le portugais et que LibreTranslate échoue, utiliser la traduction de fallback
            if ("pt".equals(request.getTargetLanguage())) {
                log.warn("⚠️ LibreTranslate a échoué pour le portugais, utilisation de la traduction de fallback");
                return createFallbackTranslation(request);
            }
            
            throw new RuntimeException("Erreur lors de la traduction avec LibreTranslate: " + e.getMessage());
        }
    }
    
    // Méthode de traduction de fallback pour les langues non supportées
    private Translation createFallbackTranslation(TranslationRequestDto request) {
        String translatedText = request.getText();
        
        log.info("🔄 Création d'une traduction de fallback pour: {} -> {}", 
                request.getSourceLanguage(), request.getTargetLanguage());
        
        // Traduction intelligente de fallback
        if ("pt".equals(request.getTargetLanguage())) {
            translatedText = translateToPortuguese(request.getText());
        } else if ("en".equals(request.getTargetLanguage())) {
            translatedText = translateToEnglish(request.getText());
        }
        
        return Translation.builder()
                .originalText(request.getText())
                .translatedText(translatedText)
                .sourceLanguage(request.getSourceLanguage())
                .targetLanguage(request.getTargetLanguage())
                .translationProvider("FALLBACK")
                .confidenceScore(0.30) // Faible confiance pour les traductions de fallback
                .sujetId(request.getSujetId())
                .commentaireId(request.getCommentaireId())
                .userId(request.getUserId())
                .isApproved(false) // Les traductions de fallback ne sont pas approuvées par défaut
                .dateCreation(LocalDateTime.now())
                .build();
    }
    
    // Traduction française vers portugais
    private String translateToPortuguese(String text) {
        if (text == null || text.trim().isEmpty()) {
            return text;
        }
        
        // Dictionnaire de traduction français-portugais
        Map<String, String> dictionary = new HashMap<>();
        
        // Articles et déterminants
        dictionary.put("le", "o");
        dictionary.put("la", "a");
        dictionary.put("les", "os/as");
        dictionary.put("un", "um");
        dictionary.put("une", "uma");
        dictionary.put("des", "dos/das");
        dictionary.put("du", "do");
        dictionary.put("de", "de");
        dictionary.put("d'", "d'");
        
        // Prépositions
        dictionary.put("à", "a");
        dictionary.put("au", "ao");
        dictionary.put("aux", "aos");
        dictionary.put("dans", "em");
        dictionary.put("sur", "sobre");
        dictionary.put("sous", "sob");
        dictionary.put("avec", "com");
        dictionary.put("sans", "sem");
        dictionary.put("pour", "para");
        dictionary.put("par", "por");
        dictionary.put("vers", "para");
        dictionary.put("chez", "em casa de");
        dictionary.put("entre", "entre");
        dictionary.put("parmi", "entre");
        dictionary.put("pendant", "durante");
        dictionary.put("depuis", "desde");
        dictionary.put("jusqu'", "até");
        dictionary.put("avant", "antes");
        dictionary.put("après", "depois");
        dictionary.put("devant", "na frente de");
        dictionary.put("derrière", "atrás de");
        
        // Conjonctions
        dictionary.put("et", "e");
        dictionary.put("ou", "ou");
        dictionary.put("mais", "mas");
        dictionary.put("donc", "então");
        dictionary.put("car", "porque");
        dictionary.put("ni", "nem");
        dictionary.put("que", "que");
        dictionary.put("qui", "que");
        dictionary.put("quoi", "o que");
        dictionary.put("où", "onde");
        dictionary.put("quand", "quando");
        dictionary.put("comment", "como");
        dictionary.put("pourquoi", "por que");
        
        // Verbes courants
        dictionary.put("être", "ser");
        dictionary.put("avoir", "ter");
        dictionary.put("faire", "fazer");
        dictionary.put("aller", "ir");
        dictionary.put("venir", "vir");
        dictionary.put("voir", "ver");
        dictionary.put("savoir", "saber");
        dictionary.put("pouvoir", "poder");
        dictionary.put("vouloir", "querer");
        dictionary.put("devoir", "dever");
        dictionary.put("falloir", "precisar");
        
        // Pronoms
        dictionary.put("je", "eu");
        dictionary.put("tu", "você");
        dictionary.put("il", "ele");
        dictionary.put("elle", "ela");
        dictionary.put("nous", "nós");
        dictionary.put("vous", "vocês");
        dictionary.put("ils", "eles");
        dictionary.put("elles", "elas");
        
        // Adjectifs
        dictionary.put("bon", "bom");
        dictionary.put("bonne", "boa");
        dictionary.put("mauvais", "ruim");
        dictionary.put("mauvaise", "ruim");
        dictionary.put("grand", "grande");
        dictionary.put("grande", "grande");
        dictionary.put("petit", "pequeno");
        dictionary.put("petite", "pequena");
        dictionary.put("nouveau", "novo");
        dictionary.put("nouvelle", "nova");
        dictionary.put("vieux", "velho");
        dictionary.put("vieille", "velha");
        dictionary.put("jeune", "jovem");
        dictionary.put("beau", "bonito");
        dictionary.put("belle", "bonita");
        dictionary.put("laid", "feio");
        dictionary.put("laide", "feia");
        
        // Adverbes
        dictionary.put("très", "muito");
        dictionary.put("trop", "demais");
        dictionary.put("assez", "bastante");
        dictionary.put("peu", "pouco");
        dictionary.put("beaucoup", "muito");
        dictionary.put("toujours", "sempre");
        dictionary.put("jamais", "nunca");
        dictionary.put("souvent", "frequentemente");
        dictionary.put("parfois", "às vezes");
        dictionary.put("maintenant", "agora");
        dictionary.put("hier", "ontem");
        dictionary.put("aujourd'hui", "hoje");
        dictionary.put("demain", "amanhã");
        
        // Termes médicaux/VIH
        dictionary.put("maladie", "doença");
        dictionary.put("incurable", "incuravel");
        dictionary.put("traitement", "tratamento");
        dictionary.put("médicament", "medicamento");
        dictionary.put("santé", "saúde");
        dictionary.put("médecin", "médico");
        dictionary.put("hôpital", "hospital");
        dictionary.put("patient", "paciente");
        dictionary.put("symptôme", "sintoma");
        dictionary.put("diagnostic", "diagnóstico");
        dictionary.put("thérapie", "terapia");
        dictionary.put("prévention", "prevenção");
        dictionary.put("infection", "infecção");
        dictionary.put("virus", "vírus");
        dictionary.put("immunité", "imunidade");
        dictionary.put("système immunitaire", "sistema imunológico");
        dictionary.put("cellule", "célula");
        dictionary.put("sang", "sangue");
        dictionary.put("test", "teste");
        dictionary.put("résultat", "resultado");
        dictionary.put("positif", "positivo");
        dictionary.put("négatif", "negativo");
        dictionary.put("VIH", "HIV");
        dictionary.put("SIDA", "AIDS");
        dictionary.put("antirétroviral", "antirretroviral");
        dictionary.put("ARV", "ARV");
        dictionary.put("CD4", "CD4");
        dictionary.put("charge virale", "carga viral");
        dictionary.put("résistance", "resistência");
        dictionary.put("mutation", "mutação");
        dictionary.put("séropositif", "soropositivo");
        dictionary.put("séronégatif", "soronegativo");
        
        // Termes politiques/administratifs
        dictionary.put("politique", "política");
        dictionary.put("politique", "política");
        dictionary.put("gouvernement", "governo");
        dictionary.put("ministère", "ministério");
        dictionary.put("décret", "decreto");
        dictionary.put("loi", "lei");
        dictionary.put("réglementation", "regulamentação");
        dictionary.put("disposition", "disposição");
        dictionary.put("dispositions", "disposições");
        dictionary.put("faciliter", "facilitar");
        dictionary.put("importance", "importância");
        dictionary.put("État", "Estado");
        dictionary.put("États", "Estados");
        dictionary.put("prendre", "tomar");
        dictionary.put("prendre les dispositions", "tomar as disposições");
        dictionary.put("par rapport à", "em relação a");
        dictionary.put("par rapport aux", "em relação aos");
        dictionary.put("serait", "seria");
        dictionary.put("serait l'importance", "seria a importância");
        dictionary.put("quelle", "qual");
        dictionary.put("quelle serait", "qual seria");
        dictionary.put("traitements", "tratamentos");
        dictionary.put("traitement", "tratamento");
        
        // Appliquer les traductions
        String result = text;
        for (Map.Entry<String, String> entry : dictionary.entrySet()) {
            result = result.replaceAll("\\b" + entry.getKey() + "\\b", entry.getValue());
        }
        
        return result + " [Traduction automatique basique]";
    }
    
    // Traduction française vers anglais
    private String translateToEnglish(String text) {
        if (text == null || text.trim().isEmpty()) {
            return text;
        }
        
        // Dictionnaire de traduction français-anglais
        Map<String, String> dictionary = new HashMap<>();
        
        // Articles et déterminants
        dictionary.put("le", "the");
        dictionary.put("la", "the");
        dictionary.put("les", "the");
        dictionary.put("un", "a");
        dictionary.put("une", "a");
        dictionary.put("des", "some");
        dictionary.put("du", "of the");
        dictionary.put("de", "of");
        dictionary.put("d'", "of");
        
        // Prépositions
        dictionary.put("à", "to");
        dictionary.put("au", "to the");
        dictionary.put("aux", "to the");
        dictionary.put("dans", "in");
        dictionary.put("sur", "on");
        dictionary.put("sous", "under");
        dictionary.put("avec", "with");
        dictionary.put("sans", "without");
        dictionary.put("pour", "for");
        dictionary.put("par", "by");
        dictionary.put("vers", "towards");
        dictionary.put("chez", "at");
        dictionary.put("entre", "between");
        dictionary.put("parmi", "among");
        dictionary.put("pendant", "during");
        dictionary.put("depuis", "since");
        dictionary.put("jusqu'", "until");
        dictionary.put("avant", "before");
        dictionary.put("après", "after");
        dictionary.put("devant", "in front of");
        dictionary.put("derrière", "behind");
        
        // Conjonctions
        dictionary.put("et", "and");
        dictionary.put("ou", "or");
        dictionary.put("mais", "but");
        dictionary.put("donc", "so");
        dictionary.put("car", "because");
        dictionary.put("ni", "nor");
        dictionary.put("que", "that");
        dictionary.put("qui", "who");
        dictionary.put("quoi", "what");
        dictionary.put("où", "where");
        dictionary.put("quand", "when");
        dictionary.put("comment", "how");
        dictionary.put("pourquoi", "why");
        
        // Verbes courants
        dictionary.put("être", "be");
        dictionary.put("avoir", "have");
        dictionary.put("faire", "do");
        dictionary.put("aller", "go");
        dictionary.put("venir", "come");
        dictionary.put("voir", "see");
        dictionary.put("savoir", "know");
        dictionary.put("pouvoir", "can");
        dictionary.put("vouloir", "want");
        dictionary.put("devoir", "must");
        dictionary.put("falloir", "need");
        
        // Pronoms
        dictionary.put("je", "I");
        dictionary.put("tu", "you");
        dictionary.put("il", "he");
        dictionary.put("elle", "she");
        dictionary.put("nous", "we");
        dictionary.put("vous", "you");
        dictionary.put("ils", "they");
        dictionary.put("elles", "they");
        
        // Adjectifs
        dictionary.put("bon", "good");
        dictionary.put("bonne", "good");
        dictionary.put("mauvais", "bad");
        dictionary.put("mauvaise", "bad");
        dictionary.put("grand", "big");
        dictionary.put("grande", "big");
        dictionary.put("petit", "small");
        dictionary.put("petite", "small");
        dictionary.put("nouveau", "new");
        dictionary.put("nouvelle", "new");
        dictionary.put("vieux", "old");
        dictionary.put("vieille", "old");
        dictionary.put("jeune", "young");
        dictionary.put("beau", "beautiful");
        dictionary.put("belle", "beautiful");
        dictionary.put("laid", "ugly");
        dictionary.put("laide", "ugly");
        
        // Adverbes
        dictionary.put("très", "very");
        dictionary.put("trop", "too");
        dictionary.put("assez", "enough");
        dictionary.put("peu", "little");
        dictionary.put("beaucoup", "a lot");
        dictionary.put("toujours", "always");
        dictionary.put("jamais", "never");
        dictionary.put("souvent", "often");
        dictionary.put("parfois", "sometimes");
        dictionary.put("maintenant", "now");
        dictionary.put("hier", "yesterday");
        dictionary.put("aujourd'hui", "today");
        dictionary.put("demain", "tomorrow");
        
        // Termes médicaux/VIH
        dictionary.put("maladie", "disease");
        dictionary.put("incurable", "incurable");
        dictionary.put("traitement", "treatment");
        dictionary.put("médicament", "medication");
        dictionary.put("santé", "health");
        dictionary.put("médecin", "doctor");
        dictionary.put("hôpital", "hospital");
        dictionary.put("patient", "patient");
        dictionary.put("symptôme", "symptom");
        dictionary.put("diagnostic", "diagnosis");
        dictionary.put("thérapie", "therapy");
        dictionary.put("prévention", "prevention");
        dictionary.put("infection", "infection");
        dictionary.put("virus", "virus");
        dictionary.put("immunité", "immunity");
        dictionary.put("système immunitaire", "immune system");
        dictionary.put("cellule", "cell");
        dictionary.put("sang", "blood");
        dictionary.put("test", "test");
        dictionary.put("résultat", "result");
        dictionary.put("positif", "positive");
        dictionary.put("négatif", "negative");
        dictionary.put("VIH", "HIV");
        dictionary.put("SIDA", "AIDS");
        dictionary.put("antirétroviral", "antiretroviral");
        dictionary.put("ARV", "ARV");
        dictionary.put("CD4", "CD4");
        dictionary.put("charge virale", "viral load");
        dictionary.put("résistance", "resistance");
        dictionary.put("mutation", "mutation");
        dictionary.put("séropositif", "seropositive");
        dictionary.put("séronégatif", "seronegative");
        
        // Termes politiques/administratifs
        dictionary.put("politique", "political");
        dictionary.put("gouvernement", "government");
        dictionary.put("ministère", "ministry");
        dictionary.put("décret", "decree");
        dictionary.put("loi", "law");
        dictionary.put("réglementation", "regulation");
        dictionary.put("disposition", "provision");
        dictionary.put("faciliter", "facilitate");
        dictionary.put("importance", "importance");
        dictionary.put("État", "State");
        dictionary.put("États", "States");
        dictionary.put("prendre", "take");
        dictionary.put("prendre les dispositions", "take measures");
        
        // Appliquer les traductions
        String result = text;
        for (Map.Entry<String, String> entry : dictionary.entrySet()) {
            result = result.replaceAll("\\b" + entry.getKey() + "\\b", entry.getValue());
        }
        
        return result + " [Basic automatic translation]";
    }
    
    public List<TranslationResponseDto> getTranslationsBySujet(String sujetId, String targetLanguage) {
        List<Translation> translations = translationRepository.findBySujetIdAndTargetLanguage(sujetId, targetLanguage);
        return translations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<TranslationResponseDto> getTranslationsByCommentaire(String commentaireId, String targetLanguage) {
        List<Translation> translations = translationRepository.findByCommentaireIdAndTargetLanguage(commentaireId, targetLanguage);
        return translations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public TranslationResponseDto approveTranslation(String translationId, String approvedBy) {
        Translation translation = translationRepository.findById(translationId)
                .orElseThrow(() -> new RuntimeException("Traduction non trouvée"));
        
        translation.setApproved(true);
        translation.setApprovedBy(approvedBy);
        translation.setApprovalDate(LocalDateTime.now());
        translation.setDateModification(LocalDateTime.now());
        
        Translation savedTranslation = translationRepository.save(translation);
        log.info("✅ Traduction approuvée: {} par {}", translationId, approvedBy);
        
        return convertToDto(savedTranslation);
    }
    
    public void deleteTranslationsBySujet(String sujetId) {
        translationRepository.deleteBySujetId(sujetId);
        log.info("🗑️ Traductions supprimées pour le sujet: {}", sujetId);
    }
    
    public void deleteTranslationsByCommentaire(String commentaireId) {
        translationRepository.deleteByCommentaireId(commentaireId);
        log.info("🗑️ Traductions supprimées pour le commentaire: {}", commentaireId);
    }
    
    private TranslationResponseDto convertToDto(Translation translation) {
        return TranslationResponseDto.builder()
                .id(translation.getId())
                .originalText(translation.getOriginalText())
                .translatedText(translation.getTranslatedText())
                .sourceLanguage(translation.getSourceLanguage())
                .targetLanguage(translation.getTargetLanguage())
                .translationProvider(translation.getTranslationProvider())
                .confidenceScore(translation.getConfidenceScore())
                .sujetId(translation.getSujetId())
                .commentaireId(translation.getCommentaireId())
                .userId(translation.getUserId())
                .dateCreation(translation.getDateCreation())
                .dateModification(translation.getDateModification())
                .isApproved(translation.isApproved())
                .approvedBy(translation.getApprovedBy())
                .approvalDate(translation.getApprovalDate())
                .build();
    }
}
