package com.smartfisheries;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class SmartFisheriesApplicationTests {

    @Test
    void contextLoads() {
        // Basic integration test confirming that Spring application context boots up correctly
    }
}
