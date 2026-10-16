
package com.example.demo.technician;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
@CrossOrigin(origins = "http://localhost:5173")
public class TechnicianController {

    private final TechnicianService technicianService;

    public TechnicianController(TechnicianService technicianService) {
        this.technicianService = technicianService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Technician createTechnician(@RequestBody Technician technician) {
        return technicianService.createTechnician(technician);
    }

    @GetMapping
    public List<Technician> getAllTechnicians() {
        return technicianService.getAllTechnicians();
    }

    @GetMapping("/{id}")
    public Technician getTechnicianById(@PathVariable Long id) {
        return technicianService.getTechnicianById(id);
    }
}
