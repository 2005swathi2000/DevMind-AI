package com.devmind.jobs.worker;

import com.devmind.enums.JobStatus;
import com.devmind.jobs.entity.AiJob;
import com.devmind.jobs.repository.AiJobRepository;
import com.devmind.ai.service.AiService;
import com.devmind.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class JobWorker {

    private final AiJobRepository repository;
    private final AiService aiService;
    private final AnalyticsService analyticsService;

    @Async
    public void executeJobAsync(UUID jobId) {
        log.info("Starting async execution of job: {}", jobId);

        Optional<AiJob> jobOpt = repository.findById(jobId);
        if (jobOpt.isEmpty()) {
            log.error("Job not found for execution: {}", jobId);
            return;
        }

        AiJob job = jobOpt.get();
        if (job.getStatus() == JobStatus.CANCELLED) {
            log.info("Job {} was cancelled before starting execution", jobId);
            return;
        }

        // Set state to RUNNING
        job.setStatus(JobStatus.RUNNING);
        job.setStartedAt(LocalDateTime.now());
        job = repository.save(job);

        long startTime = System.currentTimeMillis();
        boolean success = false;
        String result = null;
        String lastErrorMsg = null;
        String errorType = null;

        int maxRetries = 3;
        while (job.getRetryCount() <= maxRetries) {
            // Re-fetch job to cooperatively check if user cancelled it in the database
            AiJob freshJob = repository.findById(jobId).orElse(null);
            if (freshJob == null || freshJob.getStatus() == JobStatus.CANCELLED) {
                log.info("Job {} was cooperatively cancelled during worker run", jobId);
                return;
            }

            try {
                result = aiService.generate(job.getProvider(), job.getPrompt());
                success = true;
                break;
            } catch (Exception ex) {
                log.warn("Job {} execution attempt {} failed", jobId, job.getRetryCount(), ex);

                // Re-check cancellation post failure
                freshJob = repository.findById(jobId).orElse(null);
                if (freshJob == null || freshJob.getStatus() == JobStatus.CANCELLED) {
                    log.info("Job {} was cooperatively cancelled after run failure", jobId);
                    return;
                }

                lastErrorMsg = ex.getMessage();
                errorType = ex.getClass().getSimpleName();

                if (job.getRetryCount() < maxRetries && isTransientError(ex)) {
                    job.setRetryCount(job.getRetryCount() + 1);
                    repository.save(job);
                    try {
                        long sleepTime = 2000L * job.getRetryCount();
                        log.info("Job {} sleeping {}ms before retry attempt {}", jobId, sleepTime, job.getRetryCount());
                        Thread.sleep(sleepTime);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        lastErrorMsg = "Execution interrupted: " + ie.getMessage();
                        break;
                    }
                } else {
                    break;
                }
            }
        }

        long duration = System.currentTimeMillis() - startTime;

        // Final re-fetch to protect against race condition cancellation
        AiJob finalJob = repository.findById(jobId).orElse(null);
        if (finalJob == null || finalJob.getStatus() == JobStatus.CANCELLED) {
            log.info("Job {} was cooperatively cancelled before final persistence", jobId);
            return;
        }

        if (success) {
            finalJob.setStatus(JobStatus.COMPLETED);
            finalJob.setResponse(result);
            finalJob.setCompletedAt(LocalDateTime.now());
            repository.save(finalJob);

            analyticsService.record(
                    finalJob.getUser(),
                    finalJob.getProvider(),
                    finalJob.getToolType(),
                    duration,
                    finalJob.getInputCode() != null ? finalJob.getInputCode().length() : finalJob.getPrompt().length(),
                    result.length(),
                    false,
                    true,
                    null
            );
            log.info("Job {} completed successfully in {}ms", jobId, duration);
        } else {
            finalJob.setStatus(JobStatus.FAILED);
            finalJob.setErrorMessage(lastErrorMsg);
            finalJob.setCompletedAt(LocalDateTime.now());
            repository.save(finalJob);

            analyticsService.record(
                    finalJob.getUser(),
                    finalJob.getProvider(),
                    finalJob.getToolType(),
                    duration,
                    finalJob.getInputCode() != null ? finalJob.getInputCode().length() : finalJob.getPrompt().length(),
                    0,
                    false,
                    false,
                    errorType
            );
            log.warn("Job {} final state set to FAILED: {}", jobId, lastErrorMsg);
        }
    }

    private boolean isTransientError(Throwable throwable) {
        if (throwable == null) return false;
        Throwable current = throwable;
        while (current != null) {
            if (current instanceof java.io.IOException ||
                current instanceof java.net.http.HttpTimeoutException ||
                (current.getMessage() != null && (
                    current.getMessage().toLowerCase().contains("timeout") ||
                    current.getMessage().toLowerCase().contains("rate limit") ||
                    current.getMessage().contains("429") ||
                    current.getMessage().contains("500") ||
                    current.getMessage().contains("502") ||
                    current.getMessage().contains("503") ||
                    current.getMessage().contains("504")
                ))) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }
}
