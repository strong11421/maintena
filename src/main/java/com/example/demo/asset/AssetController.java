package com.example.demo.asset;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.example.demo.workorder.WorkOrder;
import com.example.demo.workorder.WorkOrderRepository;
import java.util.List;
import java.util.List;

@RestController
@RequestMapping("/api/assets")
@CrossOrigin(origins = {"https://maintena-1-1wd3.onrender.com", "http://localhost:5173"})
public class AssetController {

    private final AssetService assetService;
    private final WorkOrderRepository workOrderRepository;

    public AssetController(AssetService assetService, WorkOrderRepository workOrderRepository)  { 
        this.assetService = assetService;
        this.workOrderRepository = workOrderRepository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Asset createAsset(@RequestBody Asset asset) {
        return assetService.createAsset(asset);
    }

    @GetMapping
    public List<Asset> getAllAssets() {
        return assetService.getAllAssets();
    }

    @GetMapping("/{id}")
    public Asset getAssetById(@PathVariable Long id) {
        return assetService.getAssetById(id);
    }
    @GetMapping("/{id}/history")
public List<WorkOrder> getAssetHistory(@PathVariable Long id) {
    return workOrderRepository.findAll(
        (root, query, cb) ->
            cb.equal(root.get("asset").get("id"), id)
    );
}

    @PutMapping("/{id}")
    public Asset updateAsset(
            @PathVariable Long id,
            @RequestBody Asset asset
    ) {
        return assetService.updateAsset(id, asset);
    }
}