package com.devmind.jobs.service;

import com.devmind.ai.prompt.PromptLoader;
import com.devmind.enums.JobStatus;
import com.devmind.jobs.dto.JobRequest;
import com.devmind.jobs.dto.JobResponse;
import com.devmind.jobs.entity.AiJob;
import com.devmind.jobs.repository.AiJobRepository;
import com.devmind.jobs.worker.JobWorker;
import com.devmind.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobServiceImpl implements JobService {

    private final AiJobRepository repository;
    private final PromptLoader promptLoader;
    private final JobWorker jobWorker;

    @Override
    @Transactional
    public JobResponse submitJob(JobRequest request, User user) {
        String prompt = promptLoader.getPrompt(request.getToolType(), request.getCode(), request.getLanguage());

        AiJob job = AiJob.builder()
                .user(user)
                .toolType(request.getToolType())
                .provider(request.getProvider())
                .status(JobStatus.QUEUED)
                .inputCode(request.getCode())
                .language(request.getLanguage())
                .prompt(prompt)
                .retryCount(0)
                .build();

        job = repository.save(job);
        log.info("Job {} successfully queued for user {}", job.getId(), user.getEmail());

        // Delegate to async worker component
        jobWorker.executeJobAsync(job.getId());

        return mapToResponse(job);
    }

    @Override
    public void executeJobAsync(UUID jobId) {
        // Handled by JobWorker component to bypass proxy limitation
        jobWorker.executeJobAsync(jobId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getJobs(User user) {
        return repository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public JobResponse getJob(UUID jobId, User user) {
        AiJob job = repository.findByIdAndUser(jobId, user)
                .orElseThrow(() -> new IllegalArgumentException("Job not found with ID: " + jobId));
        return mapToResponse(job);
    }

    @Override
    @Transactional
    public void cancelOrDeleteJob(UUID jobId, User user) {
        AiJob job = repository.findByIdAndUser(jobId, user)
                .orElseThrow(() -> new IllegalArgumentException("Job not found with ID: " + jobId));

        if (job.getStatus() == JobStatus.QUEUED || job.getStatus() == JobStatus.RUNNING) {
            job.setStatus(JobStatus.CANCELLED);
            job.setCompletedAt(LocalDateTime.now());
            repository.save(job);
            log.info("Job {} cooperatively marked as CANCELLED", jobId);
        } else {
            repository.delete(job);
            log.info("Job {} deleted from database", jobId);
        }
    }

    private JobResponse mapToResponse(AiJob job) {
        return JobResponse.builder()
                .id(job.getId())
                .toolType(job.getToolType())
                .provider(job.getProvider())
                .status(job.getStatus())
                .inputCode(job.getInputCode())
                .language(job.getLanguage())
                .response(job.getResponse())
                .errorMessage(job.getErrorMessage())
                .retryCount(job.getRetryCount())
                .createdAt(job.getCreatedAt())
                .startedAt(job.getStartedAt())
                .completedAt(job.getCompletedAt())
                .build();
    }
}
