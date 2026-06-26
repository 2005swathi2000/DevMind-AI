package com.devmind.jobs.controller;

import com.devmind.common.dto.ApiResponse;
import com.devmind.jobs.dto.JobRequest;
import com.devmind.jobs.dto.JobResponse;
import com.devmind.jobs.service.JobService;
import com.devmind.security.user.CustomUserDetails;
import com.devmind.user.entity.User;
import com.devmind.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<JobResponse>> submitJob(
            @Valid @RequestBody JobRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        JobResponse response = jobService.submitJob(request, user);
        return ResponseEntity.ok(ApiResponse.success("Background job queued successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobResponse>>> getJobs(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<JobResponse> jobs = jobService.getJobs(user);
        return ResponseEntity.ok(ApiResponse.success("Jobs fetched successfully", jobs));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobResponse>> getJob(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        JobResponse response = jobService.getJob(id, user);
        return ResponseEntity.ok(ApiResponse.success("Job details fetched successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelOrDeleteJob(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        jobService.cancelOrDeleteJob(id, user);
        return ResponseEntity.ok(ApiResponse.success("Job operation completed successfully", null));
    }
}
