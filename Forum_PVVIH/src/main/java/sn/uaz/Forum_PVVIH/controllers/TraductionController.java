package sn.uaz.Forum_PVVIH.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.uaz.Forum_PVVIH.dtos.TraductionRequestDto;
import sn.uaz.Forum_PVVIH.dtos.TraductionResponseDto;
import sn.uaz.Forum_PVVIH.services.TraductionService;

import java.util.List;

@RestController
@RequestMapping("/api/translation")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TraductionController {

    private final TraductionService traductionService;

    @PostMapping("/translate")
    public ResponseEntity<TraductionResponseDto> translateText(@RequestBody TraductionRequestDto request) {
        try {
            TraductionResponseDto response = traductionService.translateText(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/request")
    public ResponseEntity<TraductionResponseDto> requestHumanTranslation(@RequestBody TraductionRequestDto request) {
        try {
            TraductionResponseDto response = traductionService.requestHumanTranslation(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/requests")
    public ResponseEntity<List<TraductionResponseDto>> getTranslationRequests(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            List<TraductionResponseDto> requests = traductionService.getTranslationRequests(status, page, size);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
