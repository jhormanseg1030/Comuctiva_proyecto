package com.ecomerce.dto;

// lombok AllArgsConstructor removed to avoid duplicate constructor
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MessageResponse {
    private String message;

    // Convenience constructor used widely across controllers
    public MessageResponse(String message) {
        this.message = message;
    }
}
