package sn.uaz.Forum_PVVIH.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
@Slf4j
public class TestController {

    @GetMapping
    public ResponseEntity<String> testGet() {
        log.info("✅ GET /api/test - Requête reçue");
        return ResponseEntity.ok("Test GET réussi");
    }

    @PostMapping
    public ResponseEntity<String> testPost(@RequestBody(required = false) String body) {
        log.info("✅ POST /api/test - Requête reçue avec body: {}", body);
        return ResponseEntity.ok("Test POST réussi");
    }

    @GetMapping("/auth")
    public ResponseEntity<String> testAuth() {
        log.info("✅ GET /api/test/auth - Requête authentifiée reçue");
        return ResponseEntity.ok("Test authentifié réussi");
    }
}













