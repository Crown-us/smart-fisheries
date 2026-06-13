package com.smartfisheries.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI smartFisheriesOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Smart Fisheries System API")
                        .description("REST API specifications for Smart Fisheries Cultivation Management & Marketplace Platform")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Smart Fisheries Team")
                                .email("support@smartfish.com"))
                        .license(new Info().getLicense()))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication", createAPIKeyScheme()));
    }

    private SecurityScheme createAPIKeyScheme() {
        return new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .bearerFormat("JWT")
                .scheme("bearer")
                .description("Enter your JWT token to access protected endpoints.");
    }
}
