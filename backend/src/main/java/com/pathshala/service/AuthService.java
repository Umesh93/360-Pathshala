package com.pathshala.service;

import com.pathshala.dto.AuthDtos.*;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
}
