package com.artselling.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${artselling.app.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // uploadDir is "uploads/artworks". We want to map "/uploads/**" to the
        // "uploads" directory
        // so that "/uploads/artworks/..." works.
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path rootPath = uploadPath.getParent();

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + rootPath.toString() + "/");
    }
}
