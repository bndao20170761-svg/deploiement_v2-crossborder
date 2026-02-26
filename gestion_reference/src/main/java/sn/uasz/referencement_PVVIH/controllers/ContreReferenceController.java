package sn.uasz.referencement_PVVIH.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.uasz.referencement_PVVIH.dtos.ContreReferenceDto;
import sn.uasz.referencement_PVVIH.services.ContreReferenceService;

import java.util.List;

@RestController
@RequestMapping("/api/contre-references")
@RequiredArgsConstructor
public class ContreReferenceController {
    private final ContreReferenceService service;

    @PostMapping
    public ResponseEntity<ContreReferenceDto> create(@RequestBody ContreReferenceDto dto) {
        return ResponseEntity.ok(service.save(dto));
    }

    @GetMapping
    public ResponseEntity<List<ContreReferenceDto>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContreReferenceDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
