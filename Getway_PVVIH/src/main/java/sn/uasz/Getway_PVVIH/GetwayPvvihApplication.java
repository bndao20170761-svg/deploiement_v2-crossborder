// java
// Fichier : `src/main/java/sn/uasz/Getway_PVVIH/GetwayPvvihApplication.java`
package sn.uasz.Getway_PVVIH;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpHeaders;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;
@SpringBootApplication
public class GetwayPvvihApplication {

	public static void main(String[] args) {
		SpringApplication.run(GetwayPvvihApplication.class, args);
	}

	@Bean
	public GlobalFilter removeDuplicateCorsHeadersFilter() {
		return (exchange, chain) -> chain.filter(exchange).then(Mono.fromRunnable(() -> {
			HttpHeaders headers = exchange.getResponse().getHeaders();
			dedupeHeader(headers, HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN);
			dedupeHeader(headers, HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS);
			dedupeHeader(headers, HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS);
			dedupeHeader(headers, HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS);
			dedupeHeader(headers, HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS);
		}));
	}

	private void dedupeHeader(HttpHeaders headers, String name) {
		List<String> values = headers.get(name);
		if (values != null && values.size() > 1) {
			headers.put(name, Collections.singletonList(values.get(0)));
		}
	}
}
