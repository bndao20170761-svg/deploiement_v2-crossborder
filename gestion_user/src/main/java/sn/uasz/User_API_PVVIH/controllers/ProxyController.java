package sn.uasz.User_API_PVVIH.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ProxyController {

    private final RestTemplate restTemplate = new RestTemplate();

    // Proxy pour les sujets vers le serveur Forum_PVVIH (port 8080)
    @GetMapping("/sujets")
    public ResponseEntity<String> proxySujetsGet(@RequestParam(required = false) Integer page,
                                               @RequestParam(required = false) Integer size) {
        try {
            String url = "http://forum-pvvih:8080/api/sujets";
            if (page != null || size != null) {
                url += "?";
                if (page != null) url += "page=" + page;
                if (size != null) url += (page != null ? "&" : "") + "size=" + size;
            }

            log.info("Proxy GET sujets vers: {}", url);
            String response = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur proxy sujets GET: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/sujets/{id}")
    public ResponseEntity<String> proxySujetById(@PathVariable String id) {
        try {
            String url = "http://forum-pvvih:8080/api/sujets/" + id;
            log.info("Proxy GET sujet vers: {}", url);
            String response = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur proxy sujet GET: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/sujets")
    public ResponseEntity<String> proxyCreateSujet(@RequestBody String sujetData) {
        try {
            String url = "http://forum-pvvih:8080/api/sujets";
            log.info("Proxy POST sujet vers: {}", url);
            log.info("Données reçues: {}", sujetData);
            ResponseEntity<String> response = restTemplate.postForEntity(url, sujetData, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            log.error("Erreur proxy sujet POST: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
