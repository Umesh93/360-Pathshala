package com.pathshala.service;

import com.pathshala.dto.AuthDtos.*;
import com.pathshala.dto.ApiDtos.AccountProfile;
import com.pathshala.dto.ApiDtos.ChangePasswordRequest;
import com.pathshala.dto.ApiDtos.UpdateAccountProfile;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
    AccountProfile me();
    AccountProfile updateMe(UpdateAccountProfile request);
    void changePassword(ChangePasswordRequest request);
    void requestPasswordReset(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}
