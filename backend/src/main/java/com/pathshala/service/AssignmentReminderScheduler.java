package com.pathshala.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class AssignmentReminderScheduler {
    private final AssignmentService service;

    @Scheduled(cron="${app.assignment.reminder-cron:0 0 8 * * *}")
    public void remindDueTomorrow(){var day=LocalDate.now().plusDays(1);service.dueForReminder(day.atStartOfDay(),day.plusDays(1).atStartOfDay()).forEach(service::sendDueReminder);service.closeOverdue();}

    @Scheduled(cron="${app.assignment.publish-cron:0 * * * * *}")
    public void publishScheduled(){service.activateScheduledAssignments();}
}
