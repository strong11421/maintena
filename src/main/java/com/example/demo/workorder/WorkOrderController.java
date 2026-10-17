
package com.example.demo.workorder;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-orders")
@CrossOrigin(origins = {"https://maintena-1-1wd3.onrender.com", "http://localhost:5173"})
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    public WorkOrderController(WorkOrderService workOrderService) {
        this.workOrderService = workOrderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkOrder createWorkOrder(@RequestBody WorkOrder workOrder) {
        return workOrderService.createWorkOrder(workOrder);
    }

    @GetMapping
    public List<WorkOrder> getAllWorkOrders(
            @RequestParam(required = false) WorkOrderStatus status,
            @RequestParam(required = false) WorkOrderPriority priority,
            @RequestParam(required = false) Long assetId,
            @RequestParam(required = false) Long technicianId) {

        return workOrderService.getWorkOrders(
                status, priority, assetId, technicianId);
    }

    @GetMapping("/{id}")
    public WorkOrder getWorkOrderById(@PathVariable Long id) {
        return workOrderService.getWorkOrderById(id);
    }

    @PutMapping("/{id}")
    public WorkOrder updateWorkOrder(
            @PathVariable Long id,
            @RequestBody WorkOrder workOrder) {
        return workOrderService.updateWorkOrder(id, workOrder);
    }
}

