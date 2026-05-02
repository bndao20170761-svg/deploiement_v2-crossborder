# Implementation Plan

- [ ] 1. Corriger la propagation du JWT dans les appels Feign
  - [ ] 1.1 Alimenter le ThreadLocal CURRENT_TOKEN depuis security/JwtAuthTokenFilter
    - Dans `doFilterInternal`, après avoir validé le JWT et positionné le SecurityContext, appeler `sn.uasz.referencement_PVVIH.config.JwtAuthTokenFilter.CURRENT_TOKEN.set(jwt)` et nettoyer dans le bloc `finally`
    - _Requirements: 1.2, 1.3_
  - [ ] 1.2 Ajouter le fallback ThreadLocal dans FeignClientInterceptor
    - Modifier `apply()` : si `RequestContextHolder` ne retourne pas de token, lire `JwtAuthTokenFilter.CURRENT_TOKEN.get()` et l'injecter dans le header `Authorization`
    - _Requirements: 1.2, 1.3_

- [ ] 2. Corriger countReferencesDossierRecuesNonLues pour l'assistant
  - Modifier `countReferencesDossierRecuesNonLues()` dans `ReferenceDossierService` pour ajouter le cas ASSISTANT avec le même filtrage par hôpital que `getReferencesRecues()`
  - _Requirements: 4.2_
