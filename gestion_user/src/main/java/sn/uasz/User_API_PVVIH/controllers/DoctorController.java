package sn.uasz.User_API_PVVIH.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sn.uasz.User_API_PVVIH.dtos.DoctorDto;
import sn.uasz.User_API_PVVIH.dtos.HopitalDto;
import sn.uasz.User_API_PVVIH.mappers.AdminMapper;
import sn.uasz.User_API_PVVIH.services.DoctorService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = {"http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://gateway-pvvih:8080"})
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;
private final AdminMapper adminMapper;
    public DoctorController(DoctorService doctorService, AdminMapper adminMapper) {
        this.doctorService = doctorService;
        this.adminMapper = adminMapper;
    }


    @GetMapping
    public ResponseEntity<List<DoctorDto>> getAllDoctors() {
        try {
            List<DoctorDto> doctors = doctorService.getAllDoctors();
            return ResponseEntity.ok(doctors);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    @GetMapping("/{codeDoctor}")
    public ResponseEntity<DoctorDto> getDoctorByCode(@PathVariable String codeDoctor) {
        try {
            DoctorDto doctor = doctorService.getDoctorByCode(codeDoctor);
            return ResponseEntity.ok(doctor);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createDoctor(@RequestBody DoctorDto doctorDto) {
        try {
            DoctorDto createdDoctor = doctorService.creerDoctor(doctorDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdDoctor);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la création du médecin");
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{codeDoctor}")
    public ResponseEntity<?> updateDoctor(
            @PathVariable String codeDoctor,
            @RequestBody DoctorDto doctorDto) {
        try {
            DoctorDto updatedDoctor = doctorService.modifierDoctor(codeDoctor, doctorDto);
            return ResponseEntity.ok(updatedDoctor);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("non trouvé")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la modification du médecin");
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{codeDoctor}")
    public ResponseEntity<?> deleteDoctor(@PathVariable String codeDoctor) {
        try {
            doctorService.supprimerDoctor(codeDoctor);
            return ResponseEntity.ok().body("Médecin supprimé avec succès");
        } catch (RuntimeException e) {
            if (e.getMessage().contains("non trouvé")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la suppression du médecin");
        }
    }

    // Endpoint pour vérifier si un code doctor existe déjà
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/exists/{codeDoctor}")
    public ResponseEntity<Boolean> checkDoctorCodeExists(@PathVariable String codeDoctor) {
        try {
            // Cette méthode devrait être ajoutée dans DoctorService
            boolean exists = doctorService.existsByCodeDoctor(codeDoctor);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Endpoint pour compter le nombre total de médecins
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/count")
    public ResponseEntity<Long> countDoctors() {
        try {
            // Cette méthode devrait être ajoutée dans DoctorService
            long count = doctorService.countDoctors();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/hopitaux-disponibles")
    @PreAuthorize("hasRole('ADMIN')")
    public List<HopitalDto> getHopitauxDisponibles() {
        return doctorService.getHopitauxActifs().stream()
                .map(adminMapper::hopitalToDto)
                .collect(Collectors.toList());
    }

}