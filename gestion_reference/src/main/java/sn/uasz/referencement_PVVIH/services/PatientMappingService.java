package sn.uasz.referencement_PVVIH.services;

import org.springframework.stereotype.Service;
import sn.uasz.referencement_PVVIH.dtos.PatientFeignDto;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service pour mapper les données patients entre les différents formats
 */
@Service
public class PatientMappingService {

    /**
     * Convertit une Map (réponse JSON brute) vers PatientFeignDto
     * Mapping corrigé pour correspondre exactement aux champs de gestion_user PatientDto
     */
    public PatientFeignDto mapToPatientFeignDto(Map<String, Object> patientData) {
        PatientFeignDto dto = new PatientFeignDto();
        
        try {
            // Champs de base (avec fallback sur plusieurs noms possibles)
            dto.setCodePatient(firstNonBlank(
                    getStringValue(patientData, "codePatient"),
                    getStringValue(patientData, "code_patient")
            ));
            
            dto.setNom(firstNonBlank(
                    getStringValue(patientData, "nom"),
                    getStringValue(patientData, "nomUtilisateur")
            ));
            
            dto.setPrenom(firstNonBlank(
                    getStringValue(patientData, "prenom"),
                    getStringValue(patientData, "prenomUtilisateur")
            ));
            
            dto.setEmail(firstNonBlank(
                    getStringValue(patientData, "email"),
                    getStringValue(patientData, "username")
            ));
            
            dto.setTelephone(firstNonBlank(
                    getStringValue(patientData, "telephone"),
                    getStringValue(patientData, "tel"),
                    getStringValue(patientData, "phone")
            ));
            
            dto.setAdresse(firstNonBlank(
                    getStringValue(patientData, "adresse"),
                    getStringValue(patientData, "adressePermanent"),
                    getStringValue(patientData, "adresse_complete")
            ));
            
            // Sexe/Genre - fallback: genre ou sexe
            String genre = firstNonBlank(
                    getStringValue(patientData, "genre"),
                    getStringValue(patientData, "sexe")
            );
            dto.setGenre(genre != null ? genre : "");
            
            // Profession : conserver ton comportement actuel (stockage dans antecedents)
            // mais au moins lire la bonne clé
            String profession = getStringValue(patientData, "profession");
            if (profession != null && !profession.isEmpty()) {
                dto.setAntecedents(profession);
            }
            
            // Statut (si existe dans la source, sinon valeur par défaut)
            dto.setStatut(firstNonBlank(
                    getStringValue(patientData, "statut"),
                    "Actif"
            ));
            
            // Conversion Date vers LocalDate
            Object dateNaissanceObj = patientData.get("dateNaissance");
            if (dateNaissanceObj != null) {
                try {
                    if (dateNaissanceObj instanceof Date) {
                        Date date = (Date) dateNaissanceObj;
                        dto.setDateNaissance(date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
                    } else if (dateNaissanceObj instanceof Long) {
                        // Timestamp en millisecondes
                        Date date = new Date((Long) dateNaissanceObj);
                        dto.setDateNaissance(date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
                    } else if (dateNaissanceObj instanceof String) {
                        String dateStr = (String) dateNaissanceObj;
                        // Essayer différents formats
                        if (dateStr.contains("T")) {
                            // Format ISO avec heure
                            dto.setDateNaissance(LocalDate.parse(dateStr.substring(0, 10)));
                        } else {
                            dto.setDateNaissance(LocalDate.parse(dateStr));
                        }
                    } else if (dateNaissanceObj instanceof java.util.Map) {
                        // Format complexe (année, mois, jour)
                        @SuppressWarnings("unchecked")
                        Map<String, Object> dateMap = (Map<String, Object>) dateNaissanceObj;
                        Integer year = getIntValue(dateMap, "year");
                        Integer month = getIntValue(dateMap, "monthValue");
                        Integer day = getIntValue(dateMap, "dayOfMonth");
                        if (year != null && month != null && day != null) {
                            dto.setDateNaissance(LocalDate.of(year, month, day));
                        }
                    }
                } catch (Exception e) {
                    System.err.println("⚠️ Erreur parsing date de naissance: " + dateNaissanceObj + " - " + e.getMessage());
                }
            }
            
            // Âge
            Object ageObj = patientData.get("age");
            if (ageObj != null && dto.getDateNaissance() == null) {
                // Si on a l'âge mais pas la date de naissance, on peut l'estimer
                try {
                    Long age = getLongValue(patientData, "age");
                    if (age != null && age > 0) {
                        dto.setDateNaissance(LocalDate.now().minusYears(age));
                    }
                } catch (Exception e) {
                    System.err.println("⚠️ Erreur calcul âge: " + e.getMessage());
                }
            }
            
            // Nationalité/Pays : fallback sur pays ou nationalite
            String pays = firstNonBlank(
                    getStringValue(patientData, "pays"),
                    getStringValue(patientData, "nationalite"),
                    getStringValue(patientData, "nationaliteUtilisateur")
            );
            dto.setPays(pays != null ? pays : "");
            
            // Champs non disponibles dans gestion_user
            dto.setVille(firstNonBlank(getStringValue(patientData, "ville"), ""));
            dto.setGroupeSanguin(firstNonBlank(getStringValue(patientData, "groupeSanguin"), ""));
            dto.setAllergies(firstNonBlank(getStringValue(patientData, "allergies"), ""));
            
            // Code du médecin créateur
            dto.setDoctorCreateCode(firstNonBlank(
                    getStringValue(patientData, "doctorCreateCode"),
                    getStringValue(patientData, "doctor_create_code")
            ));
            
            System.out.println("✅ Patient mappé: " + dto.getCodePatient() + " - " + dto.getNom() + " " + dto.getPrenom());
            
        } catch (Exception e) {
            System.err.println("❌ Erreur mapping patient: " + e.getMessage());
            e.printStackTrace();
        }
        
        return dto;
    }
    
    /**
     * Méthode utilitaire pour extraire une valeur String de la Map
     */
    private String getStringValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }
    
    /**
     * Méthode utilitaire pour retourner la première valeur non vide
     */
    private String firstNonBlank(String... values) {
        if (values == null) return null;
        for (String v : values) {
            if (v != null && !v.trim().isEmpty()) {
                return v;
            }
        }
        return null;
    }
    
    /**
     * Méthode utilitaire pour extraire une valeur Integer de la Map
     */
    private Integer getIntValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        if (value instanceof Integer) return (Integer) value;
        if (value instanceof Number) return ((Number) value).intValue();
        try {
            return Integer.parseInt(value.toString());
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * Méthode utilitaire pour extraire une valeur Long de la Map
     */
    private Long getLongValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        if (value instanceof Long) return (Long) value;
        if (value instanceof Number) return ((Number) value).longValue();
        try {
            return Long.parseLong(value.toString());
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Convertit une liste de Maps vers une liste de PatientFeignDto
     */
    public List<PatientFeignDto> mapToPatientFeignDtoList(List<Map<String, Object>> patientsData) {
        return patientsData.stream()
                .map(this::mapToPatientFeignDto)
                .collect(Collectors.toList());
    }

    /**
     * Convertit PatientFeignDto vers Map pour l'envoi via Feign Client
     * Tous les champs requis par gestion_user sont mappés
     * CORRECTION: Utilise les getters normalisés pour gérer les alias de champs
     */
    public Map<String, Object> mapFromPatientFeignDto(PatientFeignDto dto) {
        Map<String, Object> patientMap = new java.util.HashMap<>();
        
        try {
            // Champs obligatoires - Utiliser les getters normalisés
            patientMap.put("codePatient", dto.getCodePatient() != null ? dto.getCodePatient() : "");
            
            // Mapping nom/prénom - Les getters gèrent automatiquement les fallbacks
            String nom = dto.getNom();  // Retourne nom OU nomUtilisateur
            String prenom = dto.getPrenom();  // Retourne prenom OU prenomUtilisateur
            
            patientMap.put("nomUtilisateur", nom != null ? nom : "");
            patientMap.put("prenomUtilisateur", prenom != null ? prenom : "");
            
            // Username - Le getter gère email OU username
            String username = dto.getEmail();  // Retourne email OU username
            if (username == null || username.isEmpty()) {
                // Générer un username basé sur le code patient
                username = "patient_" + dto.getCodePatient() + "@system.local";
            }
            patientMap.put("username", username);
            
            // Téléphone
            patientMap.put("telephone", dto.getTelephone() != null ? dto.getTelephone() : "");
            
            // Adresses - Le getter gère adresse OU adressePermanent
            String adresse = dto.getAdresse();  // Retourne adresse OU adressePermanent
            patientMap.put("adressePermanent", adresse != null ? adresse : "");
            patientMap.put("adresseTemporaire", dto.getAdresseTemporaire() != null ? dto.getAdresseTemporaire() : "");
            
            // Sexe/Genre - Le getter gère genre OU sexe
            String sexe = dto.getGenre();  // Retourne genre OU sexe
            patientMap.put("sexe", sexe != null ? sexe : "");
            
            // Nationalité - Le getter gère pays OU nationaliteUtilisateur OU nationalite
            String nationalite = dto.getPays();  // Retourne pays OU nationaliteUtilisateur OU nationalite
            patientMap.put("nationalite", nationalite != null ? nationalite : "");
            patientMap.put("nationaliteUtilisateur", nationalite != null ? nationalite : "");
            
            // Date de naissance et âge
            if (dto.getDateNaissance() != null) {
                patientMap.put("dateNaissance", dto.getDateNaissance().toString());
                long age = java.time.Period.between(dto.getDateNaissance(), LocalDate.now()).getYears();
                patientMap.put("age", age);
            } else if (dto.getAge() != null) {
                patientMap.put("age", dto.getAge());
            } else {
                patientMap.put("age", 0);
            }
            
            // Profession - Le getter gère antecedents OU profession
            String profession = dto.getAntecedents();  // Retourne antecedents OU profession
            patientMap.put("profession", profession != null ? profession : "");
            
            // Pseudo
            patientMap.put("pseudo", nom != null ? nom : "");
            
            // Statut matrimonial
            patientMap.put("statutMatrimoniale", dto.getStatutMatrimoniale() != null ? dto.getStatutMatrimoniale() : "");
            
            // Password - Utiliser le password fourni ou une valeur par défaut
            if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
                patientMap.put("password", dto.getPassword());
            }
            
            // Code du médecin créateur - IMPORTANT pour l'association
            if (dto.getDoctorCreateCode() != null && !dto.getDoctorCreateCode().isEmpty()) {
                patientMap.put("doctorCreateCode", dto.getDoctorCreateCode());
            }
            
            System.out.println("✅ Patient mappé pour envoi vers gestion_user: " + patientMap.get("codePatient") + 
                             " - " + patientMap.get("nomUtilisateur") + " " + patientMap.get("prenomUtilisateur"));
            System.out.println("📋 Détails mapping:");
            System.out.println("   - Sexe: " + patientMap.get("sexe"));
            System.out.println("   - Profession: " + patientMap.get("profession"));
            System.out.println("   - Nationalité: " + patientMap.get("nationalite"));
            System.out.println("   - Adresse: " + patientMap.get("adressePermanent"));
            
        } catch (Exception e) {
            System.err.println("❌ Erreur mapping inverse patient: " + e.getMessage());
            e.printStackTrace();
        }
        
        return patientMap;
    }
}