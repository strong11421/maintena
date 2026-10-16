
package com.example.demo.technician;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TechnicianRepository
        extends JpaRepository<Technician, Long> {

    boolean existsByEmail(String email);
}
