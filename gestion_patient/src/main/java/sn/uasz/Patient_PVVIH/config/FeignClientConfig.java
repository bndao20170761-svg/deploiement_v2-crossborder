package sn.uasz.Patient_PVVIH.config;

import feign.RequestInterceptor;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.client.RestTemplate;
import sn.uasz.Patient_PVVIH.dtos.LoginRequest;
import sn.uasz.Patient_PVVIH.dtos.LoginResponse;
@Configuration
public class FeignClientConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            String jwt = JwtAuthTokenFilter.CURRENT_TOKEN.get(); // récupère le token du ThreadLocal
            if (jwt != null) {
                requestTemplate.header("Authorization", "Bearer " + jwt);
            }
        };
    }
}
