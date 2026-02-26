package sn.uasz.referencement_PVVIH.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import sn.uasz.referencement_PVVIH.dtos.DoctorDto;
import sn.uasz.referencement_PVVIH.dtos.DoctorFeignDto;

@Mapper(componentModel = "spring")
public interface DoctorMapper {

    /**
     * Convertit DoctorFeignDto vers DoctorDto pour l'usage interne
     */
    @Mapping(target = "utilisateurId", ignore = true)
    @Mapping(target = "nomUtilisateur", source = "nom")
    @Mapping(target = "prenomUtilisateur", source = "prenom")
    @Mapping(target = "nationaliteUtilisateur", ignore = true)
    DoctorDto toDoctorDto(DoctorFeignDto dto);

    /**
     * Convertit DoctorDto vers DoctorFeignDto pour la communication Feign
     */
    @Mapping(target = "nom", source = "nomUtilisateur")
    @Mapping(target = "prenom", source = "prenomUtilisateur")
    DoctorFeignDto toDoctorFeignDto(DoctorDto dto);
}




