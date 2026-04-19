package sn.uasz.referencement_PVVIH.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.uasz.referencement_PVVIH.dtos.HopitalDto;
import sn.uasz.referencement_PVVIH.dtos.PrestataireDto;
import sn.uasz.referencement_PVVIH.feign.HopitalClient;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HopitalServiceProxy {

    private final HopitalClient hopitalClient;

    public List<HopitalDto> getHospitauxActifs() {
        return hopitalClient.getHospitauxActifs();
    }

    // AJOUTER CETTE MÉTHODE
    public List<HopitalDto> getAllHospitals() {
        return hopitalClient.getAllHospitals();
    }
    public List<HopitalDto> getHospitauxPourCarte() {
        return hopitalClient.getHospitauxPourCarte();
    }

    public HopitalDto getHopitalById(Long id) {
        return hopitalClient.getHopitalById(id);
    }

    public HopitalDto createHospital(HopitalDto dto) {
        return hopitalClient.createHospital(dto);
    }

    public HopitalDto updateHospital(Long id, HopitalDto dto) {
        return hopitalClient.updateHospital(id, dto);
    }

    public void deleteHopital(Long id) {
        hopitalClient.deleteHopital(id);
    }

    public List<HopitalDto> rechercherHospitaux(String ville, String pays) {
        return hopitalClient.rechercherHospitaux(ville, pays);
    }


    // 🔹 Détails avec médecins et assistants
    public HopitalDto getHopitalAvecDetails(Long id) {
        return hopitalClient.getHopitalAvecDetails(id);
    }

    // 🔹 Mes hôpitaux (pour l’utilisateur connecté)
    public List<HopitalDto> getMyHospitals() {
        return hopitalClient.getMyHospitals();
    }

    // Méthodes pour les prestataires
    public HopitalDto getHopitalAvecPrestataires(Long id) {
        return hopitalClient.getHopitalAvecPrestataires(id);
    }

    public List<PrestataireDto> getPrestatairesByHopitalId(Long hopitalId) {
        return hopitalClient.getPrestatairesByHopitalId(hopitalId);
    }
}