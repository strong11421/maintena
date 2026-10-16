
package com.example.demo.technician;

import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TechnicianService {

    private final TechnicianRepository technicianRepository;

    public TechnicianService(TechnicianRepository technicianRepository) {
        this.technicianRepository = technicianRepository;
    }

    public Technician createTechnician(Technician technician) {
        if (technician.getEmail() == null ||
                technician.getEmail().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Email is required");
        }

        if (technicianRepository.existsByEmail(technician.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Email already exists");
        }

        if (technician.getName() == null ||
                technician.getName().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Name is required");
        }

        if (technician.getSpecialization() == null ||
                technician.getSpecialization().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Specialization is required");
        }

        return technicianRepository.save(technician);
    }

    public List<Technician> getAllTechnicians() {
        return technicianRepository.findAll();
    }

    public Technician getTechnicianById(Long id) {
        return technicianRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Technician not found"));
    }
}
