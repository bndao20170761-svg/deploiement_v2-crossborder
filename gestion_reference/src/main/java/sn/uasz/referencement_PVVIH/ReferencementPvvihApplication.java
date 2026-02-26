package sn.uasz.referencement_PVVIH;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@EnableFeignClients
@SpringBootApplication(scanBasePackages = "sn.uasz.referencement_PVVIH")
@EntityScan(basePackages = "sn.uasz.referencement_PVVIH.entities")
@EnableDiscoveryClient
@EnableJpaRepositories(basePackages = "sn.uasz.referencement_PVVIH.repositories")
public class ReferencementPvvihApplication {

	public static void main(String[] args) {
		SpringApplication.run(ReferencementPvvihApplication.class, args);
	}

}
