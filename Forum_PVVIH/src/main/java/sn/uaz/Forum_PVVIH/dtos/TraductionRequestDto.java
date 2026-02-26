package sn.uaz.Forum_PVVIH.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TraductionRequestDto {
    private String text;
    private String fromLang;
    private String toLang;
    private String sujetId;
    private String commentaireId;
}
