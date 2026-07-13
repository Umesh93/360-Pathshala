package com.pathshala.config;

import com.pathshala.entity.ModuleCode;
import com.pathshala.entity.PlatformModule;
import com.pathshala.repository.Repositories.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final ModuleRepository moduleRepository;

    private static final Map<ModuleCode, String> MODULE_NAMES = Map.of(
            ModuleCode.STUDENT_MANAGEMENT, "Student Management",
            ModuleCode.TEACHER_MANAGEMENT, "Teacher Management",
            ModuleCode.PARENT_MANAGEMENT, "Parent Management",
            ModuleCode.ATTENDANCE, "Attendance",
            ModuleCode.EXAMINATION, "Examination",
            ModuleCode.ASSIGNMENT, "Assignment",
            ModuleCode.FEE_MANAGEMENT, "Fee Management",
            ModuleCode.LEAVE_MANAGEMENT, "Leave Management",
            ModuleCode.NOTIFICATIONS, "Notifications",
            ModuleCode.ANALYTICS_DASHBOARD, "Analytics Dashboard"
    );

    @Override
    @Transactional
    public void run(String... args) {
        Arrays.stream(ModuleCode.values())
                .filter(code -> !moduleRepository.existsByCode(code))
                .map(this::module)
                .forEach(moduleRepository::save);
    }

    private PlatformModule module(ModuleCode code) {
        PlatformModule module = new PlatformModule();
        module.setCode(code);
        module.setName(MODULE_NAMES.get(code));
        module.setDescription(MODULE_NAMES.get(code) + " module");
        module.setActive(true);
        return module;
    }
}
