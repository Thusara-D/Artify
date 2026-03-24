package com.artselling.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${artselling.app.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadDirPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        // Assuming uploadDir is "uploads/artworks", we want to expose "uploads" base
        // Or if we want to keep it specific:
        String absolutePath = uploadDirPath.toString().replace("\\", "/");
        if (!absolutePath.endsWith("/")) {
            absolutePath += "/";
        }

        registry.addResourceHandler("/uploads/artworks/**")
                .addResourceLocations("file:///" + absolutePath);
    }
}
