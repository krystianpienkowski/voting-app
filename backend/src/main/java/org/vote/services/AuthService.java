package org.vote.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.vote.repositories.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    public Boolean hashUserWithEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }
}
