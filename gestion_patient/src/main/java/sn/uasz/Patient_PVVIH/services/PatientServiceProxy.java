package sn.uasz.Patient_PVVIH.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.uasz.Patient_PVVIH.dtos.PatientDto;
import sn.uasz.Patient_PVVIH.feign.PatientClient;
import sn.uasz.Patient_PVVIH.feign.PatientClient;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientServiceProxy {

    private final PatientClient referencementClient;

    public List<PatientDto> getAll() {
        return referencementClient.getAll();
    }

    public PatientDto create(PatientDto dto) {
        return referencementClient.create(dto);
    }

    public PatientDto update(String codePatient, PatientDto dto) {
        return referencementClient.update(codePatient, dto);
    }

    public void delete(String codePatient) {
        referencementClient.delete(codePatient);
    }
}
