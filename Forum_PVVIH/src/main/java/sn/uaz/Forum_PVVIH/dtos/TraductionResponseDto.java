package sn.uaz.Forum_PVVIH.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TraductionResponseDto {
    private String id;
    private String textTraduit;
    private String langueCible;
    private String sourceTraduction;
    private Integer scoreConfiance;
    private String dateTraduction;
}
