package org.vote.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.vote.dtos.AuthRequest;
import org.vote.dtos.SignupRequest;
import org.vote.dtos.UserDTO;
import org.vote.entities.User;
import org.vote.enums.UserRole;
import org.vote.mappers.UserMapper;
import org.vote.repositories.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public boolean hasUserWithEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    public UserDTO createUser(SignupRequest signupRequest) {
        User user = new User();

        user.setEmail(signupRequest.getEmail());
        user.setFirstName(signupRequest.getFirstName());
        user.setLastName(signupRequest.getLastName());
        user.setUserRole(UserRole.USER);
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));

        User createdUser = userRepository.save(user);

        return userMapper.toDTO(createdUser);
    }

    public UserDTO authenticateUser(AuthRequest authRequest) {
        User user = userRepository.findByEmail(authRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(authRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        return userMapper.toDTO(user);
    }
}