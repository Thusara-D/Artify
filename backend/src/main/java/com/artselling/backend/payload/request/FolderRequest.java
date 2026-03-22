package com.artselling.backend.payload.request;

import jakarta.validation.constraints.NotBlank;

public class FolderRequest {
    @NotBlank
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
