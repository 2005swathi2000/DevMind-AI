package com.devmind.user.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String firstName;
    private String lastName;
    private String profilePicture;
    private String gender;
}
