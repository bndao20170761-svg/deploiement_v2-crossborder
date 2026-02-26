package sn.uasz.referencement_PVVIH.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.uasz.referencement_PVVIH.dtos.ContreReferenceDto;
import sn.uasz.referencement_PVVIH.entities.ContreReference;
import sn.uasz.referencement_PVVIH.mappers.ReferenceMapper;
import sn.uasz.referencement_PVVIH.repositories.ContreReferenceRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContreReferenceService {
    private final ContreReferenceRepository repository;
    private final ReferenceMapper mapper;

    public ContreReferenceDto save(ContreReferenceDto dto) {
        ContreReference entity = mapper.toContreReference(dto);
        return mapper.toContreReferenceDto(repository.save(entity));
    }

    public List<ContreReferenceDto> findAll() {
        return repository.findAll().stream()
                .map(mapper::toContreReferenceDto)
                .collect(Collectors.toList());
    }

    public ContreReferenceDto findById(Long id) {
        return repository.findById(id)
                .map(mapper::toContreReferenceDto)
                .orElse(null);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
