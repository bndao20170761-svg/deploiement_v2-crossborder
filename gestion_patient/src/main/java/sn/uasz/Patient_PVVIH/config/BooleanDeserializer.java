package sn.uasz.Patient_PVVIH.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;

/**
 * Désérialiseur personnalisé pour convertir "0"/"1" en Boolean
 * Gère également les valeurs true/false classiques
 */
public class BooleanDeserializer extends JsonDeserializer<Boolean> {

    @Override
    public Boolean deserialize(JsonParser parser, DeserializationContext context) throws IOException {
        String value = parser.getText();
        
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        
        // Gestion des chaînes "0" et "1"
        if ("0".equals(value) || "false".equalsIgnoreCase(value)) {
            return false;
        }
        
        if ("1".equals(value) || "true".equalsIgnoreCase(value)) {
            return true;
        }
        
        // Si ce n'est ni 0, ni 1, ni true, ni false, retourner null
        return null;
    }
}
