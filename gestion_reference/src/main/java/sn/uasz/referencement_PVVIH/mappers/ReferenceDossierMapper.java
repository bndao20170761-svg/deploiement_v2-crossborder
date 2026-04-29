package sn.uasz.referencement_PVVIH.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import sn.uasz.referencement_PVVIH.dtos.*;
import sn.uasz.referencement_PVVIH.entities.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReferenceDossierMapper {

    @Mapping(target = "dateCreation", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "changementAdresseTemporaire", expression = "java(dto.getChangementAdresse() != null && Boolean.TRUE.equals(dto.getChangementAdresseTemporaire()))")
    @Mapping(target = "changementAdressePermanent", expression = "java(dto.getChangementAdresse() != null && Boolean.TRUE.equals(dto.getChangementAdressePermanent()))")
    @Mapping(target = "motifs", ignore = true)
    @Mapping(target = "protocoles1s", ignore = true)
    @Mapping(target = "protocoles2s", ignore = true)
    @Mapping(target = "protocolesTheraps", ignore = true)
    @Mapping(target = "profils", ignore = true)
    @Mapping(target = "stades", ignore = true)
    @Mapping(target = "medecin", ignore = true)
    @Mapping(target = "medecinAuteur", ignore = true)
    ReferenceDossier dtoToEntity(ReferenceDossierDto dto);

    @Mapping(target = "dateModification", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "changementAdresseTemporaire", expression = "java(dto.getChangementAdresse() != null && Boolean.TRUE.equals(dto.getChangementAdresseTemporaire()))")
    @Mapping(target = "changementAdressePermanent", expression = "java(dto.getChangementAdresse() != null && Boolean.TRUE.equals(dto.getChangementAdressePermanent()))")
    @Mapping(target = "motifs", ignore = true)
    @Mapping(target = "protocoles1s", ignore = true)
    @Mapping(target = "protocoles2s", ignore = true)
    @Mapping(target = "protocolesTheraps", ignore = true)
    @Mapping(target = "profils", ignore = true)
    @Mapping(target = "stades", ignore = true)
    @Mapping(target = "medecin", ignore = true)
    @Mapping(target = "medecinAuteur", ignore = true)
    ReferenceDossier updateDtoToEntity(ReferenceDossierDto dto);

    @Mapping(target = "motifs", source = "motifs")
    @Mapping(target = "protocoles1s", source = "protocoles1s")
    @Mapping(target = "protocoles2s", source = "protocoles2s")
    @Mapping(target = "protocolesTheraps", source = "protocolesTheraps")
    @Mapping(target = "profils", source = "profils")
    @Mapping(target = "stades", source = "stades")
    ReferenceDossierDto entityToDto(ReferenceDossier entity);

    // Mappers entités imbriquées — ignorer le champ parent pour éviter les cycles
    @Mapping(target = "referenceDossier", ignore = true)
    Protocole1 protocole1ToEntity(Protocole1Dto dto);
    @Mapping(target = "referenceDossierId", source = "referenceDossier.id")
    Protocole1Dto protocole1ToDto(Protocole1 protocole1);
    List<Protocole1Dto> protocoles1ToDto(List<Protocole1> protocoles1);
    List<Protocole1> protocoles1ToEntity(List<Protocole1Dto> dtos);

    @Mapping(target = "referenceDossier", ignore = true)
    Protocole2 protocole2ToEntity(Protocole2Dto dto);
    @Mapping(target = "referenceDossierId", source = "referenceDossier.id")
    Protocole2Dto protocole2ToDto(Protocole2 protocole2);
    List<Protocole2Dto> protocoles2ToDto(List<Protocole2> protocoles2);
    List<Protocole2> protocoles2ToEntity(List<Protocole2Dto> dtos);

    @Mapping(target = "referenceDossier", ignore = true)
    ProtocoleTherap protocoleTherapToEntity(ProtocoleTherapDto dto);
    @Mapping(target = "referenceDossierId", source = "referenceDossier.id")
    ProtocoleTherapDto protocoleTherapToDto(ProtocoleTherap protocoleTherap);
    List<ProtocoleTherapDto> protocolesTherapsToDto(List<ProtocoleTherap> protocolesTheraps);
    List<ProtocoleTherap> protocolesTherapsToEntity(List<ProtocoleTherapDto> dtos);

    @Mapping(target = "referenceDossier", ignore = true)
    ProfilVIH profilVIHToEntity(ProfilVIHDto dto);
    @Mapping(target = "referenceDossierId", source = "referenceDossier.id")
    ProfilVIHDto profilVIHToDto(ProfilVIH profilVIH);
    List<ProfilVIHDto> profilsToDto(List<ProfilVIH> profils);
    List<ProfilVIH> profilsToEntity(List<ProfilVIHDto> dtos);

    @Mapping(target = "referenceDossier", ignore = true)
    StadeOMS stadeOMSToEntity(StadeOMSDto dto);
    @Mapping(target = "referenceDossierId", source = "referenceDossier.id")
    StadeOMSDto stadeOMSToDto(StadeOMS stadeOMS);
    List<StadeOMSDto> stadesToDto(List<StadeOMS> stades);
    List<StadeOMS> stadesToEntity(List<StadeOMSDto> dtos);

    @Mapping(target = "referenceDossier", ignore = true)
    Motif motifToEntity(MotifDto dto);
    @Mapping(target = "referenceDossierId", source = "referenceDossier.id")
    MotifDto motifToDto(Motif motif);
    List<MotifDto> motifsToDto(List<Motif> motifs);
    List<Motif> motifsToEntity(List<MotifDto> dtos);
}
