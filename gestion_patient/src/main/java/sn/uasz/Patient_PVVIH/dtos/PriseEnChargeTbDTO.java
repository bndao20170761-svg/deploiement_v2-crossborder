package sn.uasz.Patient_PVVIH.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriseEnChargeTbDTO {
    private Long id;
    private String date;
    private String debut;
    private String fin;
    private String issu;
    private Long pageId;
}
