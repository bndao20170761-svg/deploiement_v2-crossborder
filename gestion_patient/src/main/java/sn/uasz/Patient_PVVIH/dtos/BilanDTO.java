package sn.uasz.Patient_PVVIH.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BilanDTO {
    private Long id;
    private String date;
    private String hb;
    private String vgm;
    private String ccmh;
    private String gb;
    private String neutrophiles;
    private String lymphocytes;
    private String plaquettes;
    private String alat;
    private String asat;
    private String glycemie;
    private String creat;
    private String aghbs;
    private String tb_lam;
    private String ag_crypto;
    private String genexpert;
    private String proteinurie;
    private String chol_total;
    private String hdl;
    private String ldl;
    private String triglycerides;
    private String depistage_col;
    private String syphilis;
    private Long pageId;
}
