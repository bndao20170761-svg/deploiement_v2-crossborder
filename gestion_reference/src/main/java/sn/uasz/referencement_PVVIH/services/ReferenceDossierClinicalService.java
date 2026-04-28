package sn.uasz.referencement_PVVIH.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.uasz.referencement_PVVIH.dtos.*;
import sn.uasz.referencement_PVVIH.entities.*;
import sn.uasz.referencement_PVVIH.mappers.ReferenceDossierMapper;
import sn.uasz.referencement_PVVIH.repositories.*;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReferenceDossierClinicalService {
    
    private final Protocole1Repository protocole1Repository;
    private final Protocole2Repository protocole2Repository;
    private final ProtocoleTherapRepository protocoleTherapRepository;
    private final ProfilVIHRepository profilVIHRepository;
    private final StadeOMSRepository stadeOMSRepository;
    private final MotifRepository motifRepository;
    private final ReferenceDossierMapper referenceDossierMapper;
    
    /**
     * Sauvegarde les données cliniques d'un ReferenceDossier
     */
    public void saveClinicalData(ReferenceDossier referenceDossier, ReferenceDossierDto dto) {
        // Sauvegarder les motifs
        if (dto.getMotifs() != null) {
            List<Motif> motifs = new ArrayList<>();
            for (MotifDto motifDto : dto.getMotifs()) {
                Motif motif = referenceDossierMapper.motifToEntity(motifDto);
                motif.setReferenceDossier(referenceDossier);
                motifs.add(motif);
            }
            motifRepository.saveAll(motifs);
            referenceDossier.setMotifs(motifs);
        }
        
        // Sauvegarder les protocoles 1
        if (dto.getProtocoles1s() != null) {
            List<Protocole1> protocoles1 = new ArrayList<>();
            for (Protocole1Dto protocoleDto : dto.getProtocoles1s()) {
                Protocole1 protocole = referenceDossierMapper.protocole1ToEntity(protocoleDto);
                protocole.setReferenceDossier(referenceDossier);
                protocoles1.add(protocole);
            }
            protocole1Repository.saveAll(protocoles1);
            referenceDossier.setProtocoles1s(protocoles1);
        }
        
        // Sauvegarder les protocoles 2
        if (dto.getProtocoles2s() != null) {
            List<Protocole2> protocoles2 = new ArrayList<>();
            for (Protocole2Dto protocoleDto : dto.getProtocoles2s()) {
                Protocole2 protocole = referenceDossierMapper.protocole2ToEntity(protocoleDto);
                protocole.setReferenceDossier(referenceDossier);
                protocoles2.add(protocole);
            }
            protocole2Repository.saveAll(protocoles2);
            referenceDossier.setProtocoles2s(protocoles2);
        }
        
        // Sauvegarder les protocoles thérapeutiques
        if (dto.getProtocolesTheraps() != null) {
            List<ProtocoleTherap> protocolesTheraps = new ArrayList<>();
            for (ProtocoleTherapDto protocoleDto : dto.getProtocolesTheraps()) {
                ProtocoleTherap protocole = referenceDossierMapper.protocoleTherapToEntity(protocoleDto);
                protocole.setReferenceDossier(referenceDossier);
                protocolesTheraps.add(protocole);
            }
            protocoleTherapRepository.saveAll(protocolesTheraps);
            referenceDossier.setProtocolesTheraps(protocolesTheraps);
        }
        
        // Sauvegarder les profils VIH
        if (dto.getProfils() != null) {
            List<ProfilVIH> profils = new ArrayList<>();
            for (ProfilVIHDto profilDto : dto.getProfils()) {
                ProfilVIH profil = referenceDossierMapper.profilVIHToEntity(profilDto);
                profil.setReferenceDossier(referenceDossier);
                profils.add(profil);
            }
            profilVIHRepository.saveAll(profils);
            referenceDossier.setProfils(profils);
        }
        
        // Sauvegarder les stades OMS
        if (dto.getStades() != null) {
            List<StadeOMS> stades = new ArrayList<>();
            for (StadeOMSDto stadeDto : dto.getStades()) {
                StadeOMS stade = referenceDossierMapper.stadeOMSToEntity(stadeDto);
                stade.setReferenceDossier(referenceDossier);
                stades.add(stade);
            }
            stadeOMSRepository.saveAll(stades);
            referenceDossier.setStades(stades);
        }
    }
    
    /**
     * Met à jour les données cliniques d'un ReferenceDossier
     */
    public void updateClinicalData(ReferenceDossier referenceDossier, ReferenceDossierDto dto) {
        // Supprimer les anciennes données
        deleteClinicalData(referenceDossier.getId());
        
        // Sauvegarder les nouvelles données
        saveClinicalData(referenceDossier, dto);
    }
    
    /**
     * Supprime toutes les données cliniques d'un ReferenceDossier
     */
    public void deleteClinicalData(Long referenceDossierId) {
        motifRepository.deleteByReferenceDossierId(referenceDossierId);
        profilVIHRepository.deleteByReferenceDossierId(referenceDossierId);
        stadeOMSRepository.deleteByReferenceDossierId(referenceDossierId);
        protocole1Repository.deleteByReferenceDossierId(referenceDossierId);
        protocole2Repository.deleteByReferenceDossierId(referenceDossierId);
        protocoleTherapRepository.deleteByReferenceDossierId(referenceDossierId);
    }
    
    /**
     * Récupère les données cliniques complètes d'un ReferenceDossier
     */
    public ReferenceDossierDto getClinicalData(Long referenceDossierId) {
        ReferenceDossierDto dto = new ReferenceDossierDto();
        
        // Récupérer les motifs
        List<Motif> motifs = motifRepository.findByReferenceDossierId(referenceDossierId);
        dto.setMotifs(referenceDossierMapper.motifsToDto(motifs));
        
        // Récupérer les protocoles 1
        List<Protocole1> protocoles1 = protocole1Repository.findByReferenceDossierId(referenceDossierId);
        dto.setProtocoles1s(referenceDossierMapper.protocoles1ToDto(protocoles1));
        
        // Récupérer les protocoles 2
        List<Protocole2> protocoles2 = protocole2Repository.findByReferenceDossierId(referenceDossierId);
        dto.setProtocoles2s(referenceDossierMapper.protocoles2ToDto(protocoles2));
        
        // Récupérer les protocoles thérapeutiques
        List<ProtocoleTherap> protocolesTheraps = protocoleTherapRepository.findByReferenceDossierId(referenceDossierId);
        dto.setProtocolesTheraps(referenceDossierMapper.protocolesTherapsToDto(protocolesTheraps));
        
        // Récupérer les profils VIH
        List<ProfilVIH> profils = profilVIHRepository.findByReferenceDossierId(referenceDossierId);
        dto.setProfils(referenceDossierMapper.profilsToDto(profils));
        
        // Récupérer les stades OMS
        List<StadeOMS> stades = stadeOMSRepository.findByReferenceDossierId(referenceDossierId);
        dto.setStades(referenceDossierMapper.stadesToDto(stades));
        
        return dto;
    }
}
