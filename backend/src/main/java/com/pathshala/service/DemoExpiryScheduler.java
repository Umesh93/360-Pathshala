package com.pathshala.service;

import com.pathshala.entity.*;
import com.pathshala.repository.Repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DemoExpiryScheduler {
    private final SchoolRepository schoolRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SchoolModuleRepository schoolModuleRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final DemoSchoolRepository demoSchoolRepository;

    @Scheduled(fixedRate = 86400000)
    public void checkDemoExpiries() {
        expireDemos(LocalDate.now());
    }

    @org.springframework.transaction.annotation.Transactional
    public void expireDemos(LocalDate today) {
        List<Subscription> demoSubs = subscriptionRepository.findBySubscriptionStatusIgnoreCaseAndEndsOnBefore("DEMO", today);

        for (Subscription sub : demoSubs) {
            Optional<School> schoolOpt = schoolRepository.findById(sub.getSchoolId());
            if (schoolOpt.isEmpty()) continue;
            School school = schoolOpt.get();
            sub.setSubscriptionStatus("EXPIRED");
            subscriptionRepository.save(sub);
            school.setStatus("EXPIRED");
            school.setActive(false);
            schoolRepository.save(school);
            demoSchoolRepository.lockBySchoolIdAndDeletedFalse(school.getId()).ifPresent(demo -> {
                if (!"CONVERTED".equalsIgnoreCase(demo.getStatus()) && !"CANCELLED".equalsIgnoreCase(demo.getStatus())) {
                    demo.setStatus("EXPIRED");
                    demoSchoolRepository.save(demo);
                }
            });
            userRepository.findBySchoolIdAndDeletedFalse(school.getId()).forEach(user -> {
                user.setActive(false);
                userRepository.save(user);
            });
        }
    }
}
