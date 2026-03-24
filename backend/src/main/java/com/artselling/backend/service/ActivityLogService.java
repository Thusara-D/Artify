package com.artselling.backend.service;

import com.artselling.backend.entity.ActivityLog;
import com.artselling.backend.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    public void log(String action, String username, String details) {
        ActivityLog log = new ActivityLog(action, username, details);
        activityLogRepository.save(log);
    }

    public List<ActivityLog> getRecentLogs() {
        return activityLogRepository.findFirst10ByOrderByTimestampDesc();
    }
}
