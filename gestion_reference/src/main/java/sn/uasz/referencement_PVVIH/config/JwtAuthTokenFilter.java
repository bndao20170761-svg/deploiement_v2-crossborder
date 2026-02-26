package sn.uasz.referencement_PVVIH.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;
import sn.uasz.referencement_PVVIH.security.JwtUtils;

import java.io.IOException;
public class JwtAuthTokenFilter extends OncePerRequestFilter {

    public static final ThreadLocal<String> CURRENT_TOKEN = new ThreadLocal<>();

    private final JwtUtils jwtUtils;

    public JwtAuthTokenFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws IOException, ServletException {
        try {
            String jwt = parseJwt(request);
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                CURRENT_TOKEN.set(jwt); // ✅ stocke le token pour Feign
                // ici ton code d'auth classique (set Authentication dans le context)
            }
            filterChain.doFilter(request, response);
        } finally {
            CURRENT_TOKEN.remove(); // ✅ nettoyage pour éviter fuites mémoire
        }
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
}
