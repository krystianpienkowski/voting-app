package org.vote.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.vote.dtos.AuthRequest;
import org.vote.dtos.SignupRequest;
import org.vote.dtos.UserDTO;
import org.vote.security.JwtService;
import org.vote.services.AuthService;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    @PostMapping("/signup")
    public ResponseEntity<?> signupUser(@RequestBody SignupRequest signupRequest) {
        try {
            if (authService.hasUserWithEmail(signupRequest.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Collections.singletonMap("message", "Email already exists"));
            }

            UserDTO createdUser = authService.createUser(signupRequest);

            if (createdUser == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Collections.singletonMap("message", "User not created"));
            }

            String jwt = jwtService.generateToken(createdUser.getEmail());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "token", jwt,
                            "user", createdUser
                    ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An error occurred: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody AuthRequest authRequest) {
        try {
            UserDTO user = authService.authenticateUser(authRequest);

            String jwt = jwtService.generateToken(user.getEmail());

            return ResponseEntity.ok(Map.of(
                    "token", jwt,
                    "user", user
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "Invalid email or password"));
        }
    }
}