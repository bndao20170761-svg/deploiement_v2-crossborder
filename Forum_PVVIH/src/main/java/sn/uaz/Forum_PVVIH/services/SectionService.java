// SectionService.java
package sn.uaz.Forum_PVVIH.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.uaz.Forum_PVVIH.dtos.SectionCreationDto;
import sn.uaz.Forum_PVVIH.dtos.SectionDto;
import sn.uaz.Forum_PVVIH.entities.Section;
import sn.uaz.Forum_PVVIH.repositories.SectionRepository;
import sn.uaz.Forum_PVVIH.repositories.SujetRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SectionService {

    private final SectionRepository sectionRepository;
    private final SujetRepository sujetRepository;

    // Créer une nouvelle section
    public SectionDto creerSection(SectionCreationDto sectionDto) {
        // Vérifier si le code existe déjà
        if (sectionRepository.existsByCode(sectionDto.getCode())) {
            throw new RuntimeException("Une section avec ce code existe déjà");
        }

        Section nouvelleSection = Section.builder()
                .code(sectionDto.getCode())
                .nomFr(sectionDto.getNomFr())
                .nomEn(sectionDto.getNomEn())
                .nomPt(sectionDto.getNomPt())
                .descriptionFr(sectionDto.getDescriptionFr())
                .descriptionEn(sectionDto.getDescriptionEn())
                .descriptionPt(sectionDto.getDescriptionPt())
                .icone(sectionDto.getIcone())
                .ordre(sectionDto.getOrdre() != null ? sectionDto.getOrdre() : 0)
                .build();

        Section sectionSauvegardee = sectionRepository.save(nouvelleSection);
        return convertToDto(sectionSauvegardee);
    }

    // Récupérer toutes les sections
    public List<SectionDto> getToutesSections() {
        return sectionRepository.findAllByOrderByOrdreAsc()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Récupérer une section par ID
    public SectionDto getSectionById(String id) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Section non trouvée"));
        return convertToDto(section);
    }

    // Mettre à jour une section
    public SectionDto mettreAJourSection(String id, SectionCreationDto sectionDto) {
        Section sectionExistante = sectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Section non trouvée"));

        // Vérifier si le code est déjà utilisé par une autre section
        if (!sectionExistante.getCode().equals(sectionDto.getCode()) && 
            sectionRepository.existsByCode(sectionDto.getCode())) {
            throw new RuntimeException("Une autre section utilise déjà ce code");
        }

        sectionExistante.setCode(sectionDto.getCode());
        sectionExistante.setNomFr(sectionDto.getNomFr());
        sectionExistante.setNomEn(sectionDto.getNomEn());
        sectionExistante.setNomPt(sectionDto.getNomPt());
        sectionExistante.setDescriptionFr(sectionDto.getDescriptionFr());
        sectionExistante.setDescriptionEn(sectionDto.getDescriptionEn());
        sectionExistante.setDescriptionPt(sectionDto.getDescriptionPt());
        sectionExistante.setIcone(sectionDto.getIcone());
        sectionExistante.setOrdre(sectionDto.getOrdre() != null ? sectionDto.getOrdre() : sectionExistante.getOrdre());

        Section sectionMiseAJour = sectionRepository.save(sectionExistante);
        return convertToDto(sectionMiseAJour);
    }

    // Supprimer une section
    public void supprimerSection(String id) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Section non trouvée"));

        // Vérifier si la section contient des sujets
        long nombreSujets = sujetRepository.countBySection(section);
        if (nombreSujets > 0) {
            throw new RuntimeException("Impossible de supprimer la section : elle contient " + nombreSujets + " sujet(s)");
        }

        sectionRepository.delete(section);
    }

    // Initialiser les sections par défaut (à appeler au démarrage)
    public void initialiserSectionsParDefaut() {
        if (sectionRepository.count() == 0) {
            List<Section> sections = List.of(
                Section.builder()
                    .code("prevention")
                    .nomFr("Prévention VIH")
                    .nomEn("HIV Prevention")
                    .nomPt("Prevenção do VIH")
                    .descriptionFr("Tout sur les méthodes de prévention du VIH")
                    .descriptionEn("Everything about HIV prevention methods")
                    .descriptionPt("Tudo sobre métodos de prevenção do VIH")
                    .icone("🛡️")
                    .ordre(1)
                    .build(),
                    
                Section.builder()
                    .code("traitements")
                    .nomFr("Traitements ARV")
                    .nomEn("ARV Treatments")
                    .nomPt("Tratamentos ARV")
                    .descriptionFr("Discussions sur les traitements antirétroviraux")
                    .descriptionEn("Discussions about antiretroviral treatments")
                    .descriptionPt("Discussões sobre tratamentos antirretrovirais")
                    .icone("💊")
                    .ordre(2)
                    .build(),
                    
                Section.builder()
                    .code("soutien")
                    .nomFr("Soutien psychosocial")
                    .nomEn("Psychosocial Support")
                    .nomPt("Apoio Psicossocial")
                    .descriptionFr("Espace d'entraide et de soutien émotionnel")
                    .descriptionEn("Mutual aid space and emotional support")
                    .descriptionPt("Espaço de ajuda mútua e apoio emocional")
                    .icone("🤝")
                    .ordre(3)
                    .build(),
                    
                Section.builder()
                    .code("questions")
                    .nomFr("Questions médicales")
                    .nomEn("Medical Questions")
                    .nomPt("Questões Médicas")
                    .descriptionFr("Posez vos questions médicales aux professionnels")
                    .descriptionEn("Ask your medical questions to professionals")
                    .descriptionPt("Faça suas perguntas médicas aos profissionais")
                    .icone("❓")
                    .ordre(4)
                    .build()
            );
            
            sectionRepository.saveAll(sections);
        }
    }

    // Conversion Entity → DTO
    private SectionDto convertToDto(Section section) {
        // Compter le nombre de sujets dans cette section
        long nombreSujets = sujetRepository.countBySection(section);
        
        return SectionDto.builder()
                .id(section.getId())
                .code(section.getCode())
                .nomFr(section.getNomFr())
                .nomEn(section.getNomEn())
                .nomPt(section.getNomPt())
                .descriptionFr(section.getDescriptionFr())
                .descriptionEn(section.getDescriptionEn())
                .descriptionPt(section.getDescriptionPt())
                .icone(section.getIcone())
                .ordre(section.getOrdre())
                .dateCreation(section.getDateCreation())
                .nombreSujets((int) nombreSujets)
                .build();
    }
}