package sn.uasz.referencement_PVVIH.config;

import feign.Response;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Slf4j
public class FeignErrorDecoder implements ErrorDecoder {

    private final ErrorDecoder defaultErrorDecoder = new Default();

    @Override
    public Exception decode(String methodKey, Response response) {
        log.error("❌ Erreur Feign - Méthode: {}, Status: {}, Reason: {}", 
                 methodKey, response.status(), response.reason());

        switch (response.status()) {
            case 400:
                return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Requête invalide");
            case 401:
                return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non autorisé");
            case 403:
                return new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès interdit");
            case 404:
                return new ResponseStatusException(HttpStatus.NOT_FOUND, "Ressource non trouvée");
            case 500:
                return new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur serveur interne");
            default:
                return defaultErrorDecoder.decode(methodKey, response);
        }
    }
}




