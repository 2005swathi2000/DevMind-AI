package com.devmind.jobs.service;

import com.devmind.jobs.dto.JobRequest;
import com.devmind.jobs.dto.JobResponse;
import com.devmind.user.entity.User;

import java.util.List;
import java.util.UUID;

public interface JobService {
    JobResponse submitJob(JobRequest request, User user);
    void executeJobAsync(UUID jobId);
    List<JobResponse> getJobs(User user);
    JobResponse getJob(UUID jobId, User user);
    void cancelOrDeleteJob(UUID jobId, User user);
}
