package sn.uaz.Forum_PVVIH;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import sn.uaz.Forum_PVVIH.services.SectionService;

@SpringBootApplication
@EnableFeignClients
@EnableDiscoveryClient
public class ForumPvvihApplication {

	public static void main(String[] args) {
		SpringApplication.run(ForumPvvihApplication.class, args);
	}

	@Bean
	CommandLineRunner initData(SectionService sectionService) {
		return args -> {
			sectionService.initialiserSectionsParDefaut();
		};
	}
}