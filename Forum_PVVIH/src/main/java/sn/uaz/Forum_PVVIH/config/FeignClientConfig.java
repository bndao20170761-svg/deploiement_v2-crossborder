package sn.uaz.Forum_PVVIH.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import sn.uaz.Forum_PVVIH.security.JwtAuthTokenFilter;

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
