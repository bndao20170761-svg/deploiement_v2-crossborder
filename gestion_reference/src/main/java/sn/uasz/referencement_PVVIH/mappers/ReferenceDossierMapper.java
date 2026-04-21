package sn.uasz.referencement_PVVIH.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import sn.uasz.referencement_PVVIH.dtos.ReferenceDossierDto;
import sn.uasz.referencement_PVVIH.entities.ReferenceDossier;

@Mapper
public interface ReferenceDossierMapper {
    
    ReferenceDossierMapper INSTANCE = Mappers.getMapper(ReferenceDossierMapper.class);
    
    @Mapping(target = "dateCreation", expression = "java(java.time.LocalDateTime.now())")
    ReferenceDossier dtoToEntity(ReferenceDossierDto dto);
    
    @Mapping(target = "dateModification", expression = "java(java.time.LocalDateTime.now())")
    ReferenceDossier updateDtoToEntity(ReferenceDossierDto dto);
    
    ReferenceDossierDto entityToDto(ReferenceDossier entity);
}
