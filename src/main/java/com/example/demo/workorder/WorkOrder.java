
package com.example.demo.workorder;

import com.example.demo.asset.Asset;
import com.example.demo.technician.Technician;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "work_orders",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_work_order_number",
            columnNames = "work_order_number"
        )
    }
)
public class WorkOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "work_order_number", nullable = false)
    private String workOrderNumber;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(optional = false)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @ManyToOne
    @JoinColumn(name = "technician_id")
    private Technician technician;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkOrderStatus status = WorkOrderStatus.OPEN;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkOrderPriority priority = WorkOrderPriority.MEDIUM;

    @Column(nullable = false)
    private String maintenanceType;

    @Column(nullable = false)
    private LocalDate scheduledDate;

    private LocalDateTime createdAt;

    public WorkOrder() {
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();

        if (status == null) {
            status = WorkOrderStatus.OPEN;
        }

        if (priority == null) {
            priority = WorkOrderPriority.MEDIUM;
        }
    }

    public Long getId() {
        return id;
    }

    public String getWorkOrderNumber() {
        return workOrderNumber;
    }

    public void setWorkOrderNumber(String workOrderNumber) {
        this.workOrderNumber = workOrderNumber;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Asset getAsset() {
        return asset;
    }

    public void setAsset(Asset asset) {
        this.asset = asset;
    }

    public Technician getTechnician() {
        return technician;
    }

    public void setTechnician(Technician technician) {
        this.technician = technician;
    }

    public WorkOrderStatus getStatus() {
        return status;
    }

    public void setStatus(WorkOrderStatus status) {
        this.status = status;
    }

    public WorkOrderPriority getPriority() {
        return priority;
    }

    public void setPriority(WorkOrderPriority priority) {
        this.priority = priority;
    }

    public String getMaintenanceType() {
        return maintenanceType;
    }

    public void setMaintenanceType(String maintenanceType) {
        this.maintenanceType = maintenanceType;
    }

    public LocalDate getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDate scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
