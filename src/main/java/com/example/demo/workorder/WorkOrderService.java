
package com.example.demo.workorder;

import com.example.demo.asset.Asset;
import com.example.demo.asset.AssetRepository;
import com.example.demo.asset.AssetStatus;
import com.example.demo.technician.Technician;
import com.example.demo.technician.TechnicianRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.jpa.domain.Specification;
import java.time.LocalDate;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.util.List;

@Service
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final AssetRepository assetRepository;
    private final TechnicianRepository technicianRepository;

    public WorkOrderService(
            WorkOrderRepository workOrderRepository,
            AssetRepository assetRepository,
            TechnicianRepository technicianRepository) {
        this.workOrderRepository = workOrderRepository;
        this.assetRepository = assetRepository;
        this.technicianRepository = technicianRepository;
    }

    public WorkOrder createWorkOrder(WorkOrder workOrder) {

        if (workOrder.getWorkOrderNumber() == null ||
                workOrder.getWorkOrderNumber().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Work order number is required");
        }

        if (workOrderRepository.existsByWorkOrderNumber(
                workOrder.getWorkOrderNumber())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Work order number already exists");
        }

        if (workOrder.getTitle() == null ||
                workOrder.getTitle().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Title is required");
        }

        if (workOrder.getScheduledDate() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Scheduled date is required");
        }

        if (workOrder.getScheduledDate().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Scheduled date cannot be in the past");
        }

        if (workOrder.getPriority() == WorkOrderPriority.CRITICAL
                && workOrder.getTechnician() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Critical work orders require a technician");
        }

        if (workOrder.getMaintenanceType() == null ||
                workOrder.getMaintenanceType().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Maintenance type is required");
        }

        if (workOrder.getAsset() == null ||
                workOrder.getAsset().getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Asset is required");
        }

        Asset asset = assetRepository.findById(workOrder.getAsset().getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Asset not found"));

        boolean emergency =
                "EMERGENCY".equalsIgnoreCase(workOrder.getMaintenanceType());

        if (asset.getStatus() == AssetStatus.OUT_OF_SERVICE && !emergency) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Out-of-service assets require emergency maintenance");
        }

        workOrder.setAsset(asset);

        if (workOrder.getTechnician() != null) {
            if (workOrder.getTechnician().getId() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Valid technician ID is required");
            }

            Technician technician = technicianRepository
                    .findById(workOrder.getTechnician().getId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Technician not found"));

            workOrder.setTechnician(technician);
        }

        workOrder.setStatus(
                workOrder.getTechnician() == null
                        ? WorkOrderStatus.OPEN
                        : WorkOrderStatus.ASSIGNED);

        return workOrderRepository.save(workOrder);
    }

    
public List<WorkOrder> getWorkOrders(
        WorkOrderStatus status,
        WorkOrderPriority priority,
        Long assetId,
        Long technicianId) {

    Specification<WorkOrder> spec = (root, query, cb) ->
            cb.conjunction();

    if (status != null) {
        spec = spec.and((root, query, cb) ->
                cb.equal(root.get("status"), status));
    }

    if (priority != null) {
        spec = spec.and((root, query, cb) ->
                cb.equal(root.get("priority"), priority));
    }

    if (assetId != null) {
        spec = spec.and((root, query, cb) ->
                cb.equal(root.get("asset").get("id"), assetId));
    }

    if (technicianId != null) {
        spec = spec.and((root, query, cb) ->
                cb.equal(root.get("technician").get("id"), technicianId));
    }

    return workOrderRepository.findAll(spec);
}


    public WorkOrder getWorkOrderById(Long id) {
        return workOrderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Work order not found"));
    }

    

   
public WorkOrder updateWorkOrder(Long id, WorkOrder request) {
    WorkOrder existing = getWorkOrderById(id);

    WorkOrderStatus currentStatus = existing.getStatus();
    WorkOrderStatus newStatus = request.getStatus();

    if (newStatus != null && newStatus != currentStatus) {
        boolean allowed = switch (currentStatus) {
            case OPEN ->
                newStatus == WorkOrderStatus.ASSIGNED ||
                newStatus == WorkOrderStatus.CANCELLED;

            case ASSIGNED ->
                newStatus == WorkOrderStatus.IN_PROGRESS ||
                newStatus == WorkOrderStatus.CANCELLED;

            case IN_PROGRESS ->
                newStatus == WorkOrderStatus.COMPLETED;

            case COMPLETED, CANCELLED -> false;
        };

        if (!allowed) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid status transition from " +
                currentStatus + " to " + newStatus
            );
        }
    }

    if (request.getPriority() == WorkOrderPriority.CRITICAL
            && existing.getTechnician() == null) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Critical work orders require a technician"
        );
    }

    if (request.getPriority() != null) {
        existing.setPriority(request.getPriority());
    }

    if (request.getTitle() != null) {
        existing.setTitle(request.getTitle());
    }

    if (request.getDescription() != null) {
        existing.setDescription(request.getDescription());
    }

    if (request.getScheduledDate() != null) {
        if (request.getScheduledDate().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Scheduled date cannot be in the past"
            );
        }
        existing.setScheduledDate(request.getScheduledDate());
    }

    if (newStatus != null) {
        existing.setStatus(newStatus);
    }

    return workOrderRepository.save(existing);
}

}
