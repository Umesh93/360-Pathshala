package com.pathshala.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pathshala.dto.DemoDtos.PublicDemoRequestResponse;
import com.pathshala.repository.Repositories.ModuleRepository;
import com.pathshala.service.DemoRequestService;
import com.pathshala.security.JwtService;
import com.pathshala.security.CustomUserDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.data.domain.AuditorAware;
import org.springframework.test.context.ContextConfiguration;
import com.pathshala.exception.ApiExceptionHandler;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = PublicController.class, excludeAutoConfiguration = org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class)
@ContextConfiguration(classes = {PublicController.class, ApiExceptionHandler.class})
class PublicDemoRequestControllerTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @MockBean DemoRequestService service;
    @MockBean ModuleRepository moduleRepository;
    @MockBean JwtService jwtService;
    @MockBean CustomUserDetailsService userDetailsService;

    private static final String VALID = """
            {"schoolName":"Pathshala","contactPerson":"Admin","designation":"Principal","email":"admin@example.com","phone":"9800000000","address":"Kathmandu","interestedModules":["ATTENDANCE"]}
            """;

    @Test void acceptsJson() throws Exception {
        when(service.createPublicRequest(any())).thenReturn(new PublicDemoRequestResponse(1L, "DR-1", "Pathshala", "PENDING", null));
        mvc.perform(post("/public/demo-request").contentType(MediaType.APPLICATION_JSON).content(VALID)).andExpect(status().isCreated());
    }
    @Test void acceptsMultipartLogo() throws Exception {
        when(service.createPublicRequest(any(), any())).thenReturn(new PublicDemoRequestResponse(1L, "DR-1", "Pathshala", "PENDING", null));
        MockMultipartFile request = new MockMultipartFile("request", "", MediaType.APPLICATION_JSON_VALUE, VALID.getBytes());
        MockMultipartFile logo = new MockMultipartFile("logo", "logo.png", MediaType.IMAGE_PNG_VALUE, new byte[]{1});
        mvc.perform(multipart("/public/demo-request").file(request).file(logo)).andExpect(status().isCreated());
    }
    @Test void acceptsMultipartFileAlias() throws Exception {
        when(service.createPublicRequest(any(), any())).thenReturn(new PublicDemoRequestResponse(1L, "DR-1", "Pathshala", "PENDING", null));
        mvc.perform(multipart("/public/demo-request")
                .file(new MockMultipartFile("request", "", MediaType.APPLICATION_JSON_VALUE, VALID.getBytes()))
                .file(new MockMultipartFile("file", "logo.png", MediaType.IMAGE_PNG_VALUE, new byte[]{1})))
                .andExpect(status().isCreated());
    }
    @Test void rejectsBothFileNames() throws Exception {
        mvc.perform(multipart("/public/demo-request")
                .file(new MockMultipartFile("request", "", MediaType.APPLICATION_JSON_VALUE, VALID.getBytes()))
                .file(new MockMultipartFile("logo", "a.png", MediaType.IMAGE_PNG_VALUE, new byte[]{1}))
                .file(new MockMultipartFile("file", "b.png", MediaType.IMAGE_PNG_VALUE, new byte[]{1})))
                .andExpect(status().isBadRequest());
    }
    @Test void rejectsBlankSchool() throws Exception { expectBad(VALID.replace("Pathshala", "")); }
    @Test void rejectsBlankContact() throws Exception { expectBad(VALID.replace("Admin", "")); }
    @Test void rejectsBlankDesignation() throws Exception { expectBad(VALID.replace("Principal", "")); }
    @Test void rejectsInvalidEmail() throws Exception { expectBad(VALID.replace("admin@example.com", "invalid")); }
    @Test void rejectsBlankPhone() throws Exception { expectBad(VALID.replace("9800000000", "")); }
    @Test void rejectsBlankAddress() throws Exception { expectBad(VALID.replace("Kathmandu", "")); }
    @Test void rejectsEmptyModules() throws Exception { expectBad(VALID.replace("[\"ATTENDANCE\"]", "[]")); }
    @Test void rejectsUnknownModuleEnum() throws Exception { expectBad(VALID.replace("ATTENDANCE", "FUTURE_MODULE")); }
    @Test void rejectsStringInsteadOfModuleList() throws Exception { expectBad(VALID.replace("[\"ATTENDANCE\"]", "\"ATTENDANCE\"")); }
    @Test void requiresJsonContentTypeForJsonOverload() throws Exception {
        mvc.perform(post("/public/demo-request").contentType(MediaType.TEXT_PLAIN).content(VALID)).andExpect(status().isUnsupportedMediaType());
    }
    private void expectBad(String body) throws Exception {
        mvc.perform(post("/public/demo-request").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isBadRequest());
    }
}
