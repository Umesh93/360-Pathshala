package com.pathshala.service.impl;

import com.pathshala.dto.AuthDtos.*;
import com.pathshala.entity.RoleName;
import com.pathshala.entity.User;
import com.pathshala.repository.Repositories.UserRepository;
import com.pathshala.security.JwtService;
import com.pathshala.security.UserPrincipal;
import com.pathshala.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsernameOrEmailAndDeletedFalse(request.usernameOrEmail(), request.usernameOrEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(), request.password()));
        UserPrincipal principal = new UserPrincipal(user);
        return new AuthResponse(jwtService.generateToken(principal), user.getId(), user.getSchoolId(), user.getUsername(), user.getRoles());
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsernameOrEmail(request.username(), request.email())) {
            throw new IllegalArgumentException("Username or email already exists");
        }
        if (!request.roles().contains(RoleName.SUPER_ADMIN) && request.schoolId() == null) {
            throw new IllegalArgumentException("schoolId is required for school users");
        }
        User user = new User();
        user.setSchoolId(request.schoolId());
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setRoles(request.roles());
        User saved = userRepository.save(user);
        UserPrincipal principal = new UserPrincipal(saved);
        return new AuthResponse(jwtService.generateToken(principal), saved.getId(), saved.getSchoolId(), saved.getUsername(), saved.getRoles());
    }
}
