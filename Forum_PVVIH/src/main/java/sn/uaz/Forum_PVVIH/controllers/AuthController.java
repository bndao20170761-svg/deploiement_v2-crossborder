package sn.uaz.Forum_PVVIH.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.uaz.Forum_PVVIH.dtos.UserCreationDto;
import sn.uaz.Forum_PVVIH.dtos.LoginRequestDto;
import sn.uaz.Forum_PVVIH.dtos.AuthResponseDto;
import sn.uaz.Forum_PVVIH.services.AuthService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody LoginRequestDto loginRequest) {
        try {
            AuthResponseDto response = authService.authenticate(loginRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@RequestBody UserCreationDto userDto) {
        try {
            AuthResponseDto response = authService.register(userDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
