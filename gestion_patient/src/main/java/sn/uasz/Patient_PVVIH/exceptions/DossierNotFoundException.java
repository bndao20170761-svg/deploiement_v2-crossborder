package sn.uasz.Patient_PVVIH.exceptions;

public class DossierNotFoundException extends RuntimeException {
    
    public DossierNotFoundException(String message) {
        super(message);
    }
    
    public DossierNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}