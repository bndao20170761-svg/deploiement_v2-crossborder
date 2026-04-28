package sn.uasz.referencement_PVVIH.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import sn.uasz.referencement_PVVIH.dtos.*;
import sn.uasz.referencement_PVVIH.entities.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReferenceDossierMapper {
    
    @Mapping(target = "dateCreation", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "changementAdresseTemporaire", expression = "java(dto.getChangementAdresse() != null && dto.getChangementAdresseTemporaire())")
    @Mapping(target = "changementAdressePermanent", expression = "java(dto.getChangementAdresse() != null && dto.getChangementAdressePermanent())")
    @Mapping(target = "protocoles1s", ignore = true)
    @Mapping(target = "protocoles2s", ignore = true)
    @Mapping(target = "protocolesTheraps", ignore = true)
    @Mapping(target = "profils", ignore = true)
    @Mapping(target = "stades", ignore = true)
    ReferenceDossier dtoToEntity(ReferenceDossierDto dto);
    
    @Mapping(target = "dateModification", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "changementAdresseTemporaire", expression = "java(dto.getChangementAdresse() != null && dto.getChangementAdresseTemporaire())")
    @Mapping(target = "changementAdressePermanent", expression = "java(dto.getChangementAdresse() != null && dto.getChangementAdressePermanent())")
    @Mapping(target = "protocoles1s", ignore = true)
    @Mapping(target = "protocoles2s", ignore = true)
    @Mapping(target = "protocolesTheraps", ignore = true)
    @Mapping(target = "profils", ignore = true)
    @Mapping(target = "stades", ignore = true)
    ReferenceDossier updateDtoToEntity(ReferenceDossierDto dto);
    
    @Mapping(target = "protocoles1s", source = "protocoles1s")
    @Mapping(target = "protocoles2s", source = "protocoles2s")
    @Mapping(target = "protocolesTheraps", source = "protocolesTheraps")
    @Mapping(target = "profils", source = "profils")
    @Mapping(target = "stades", source = "stades")
    ReferenceDossierDto entityToDto(ReferenceDossier entity);
    
    // Mappers pour les entités imbriquées
    Protocole1Dto protocole1ToDto(Protocole1 protocole1);
    Protocole1 protocole1ToEntity(Protocole1Dto dto);
    List<Protocole1Dto> protocoles1ToDto(List<Protocole1> protocoles1);
    List<Protocole1> protocoles1ToEntity(List<Protocole1Dto> dtos);
    
    Protocole2Dto protocole2ToDto(Protocole2 protocole2);
    Protocole2 protocole2ToEntity(Protocole2Dto dto);
    List<Protocole2Dto> protocoles2ToDto(List<Protocole2> protocoles2);
    List<Protocole2> protocoles2ToEntity(List<Protocole2Dto> dtos);
    
    ProtocoleTherapDto protocoleTherapToDto(ProtocoleTherap protocoleTherap);
    ProtocoleTherap protocoleTherapToEntity(ProtocoleTherapDto dto);
    List<ProtocoleTherapDto> protocolesTherapsToDto(List<ProtocoleTherap> protocolesTheraps);
    List<ProtocoleTherap> protocolesTherapsToEntity(List<ProtocoleTherapDto> dtos);
    
    ProfilVIHDto profilVIHToDto(ProfilVIH profilVIH);
    ProfilVIH profilVIHToEntity(ProfilVIHDto dto);
    List<ProfilVIHDto> profilsToDto(List<ProfilVIH> profils);
    List<ProfilVIH> profilsToEntity(List<ProfilVIHDto> dtos);
    
    StadeOMSDto stadeOMSToDto(StadeOMS stadeOMS);
    StadeOMS stadeOMSToEntity(StadeOMSDto dto);
    List<StadeOMSDto> stadesToDto(List<StadeOMS> stades);
    List<StadeOMS> stadesToEntity(List<StadeOMSDto> dtos);
}
