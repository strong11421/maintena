
package com.example.demo.workorder;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface WorkOrderRepository
        extends JpaRepository<WorkOrder, Long>,
                JpaSpecificationExecutor<WorkOrder> {

    boolean existsByWorkOrderNumber(String workOrderNumber);
}

