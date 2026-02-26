package com.enda.crossborder.dto.shared;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String role;
    private String phone;
    private String address;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Champs spécifiques au médecin
    private String speciality;
    private String licenseNumber;
    private String department;
    
    // Champs spécifiques au patient
    private String dateOfBirth;
    private String placeOfBirth;
    private String gender;
    private String bloodType;
    private String emergencyContact;
    private String emergencyPhone;
}
