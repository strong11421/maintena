package com.example.demo.asset;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AssetService {

    private final AssetRepository assetRepository;

    public AssetService(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    @Transactional
    public Asset createAsset(Asset asset) {
        if (assetRepository.existsByAssetId(asset.getAssetId())) {
            throw new IllegalArgumentException(
                    "Asset ID already exists: " + asset.getAssetId()
            );
        }

        if (asset.getStatus() == null) {
            asset.setStatus(AssetStatus.ACTIVE);
        }

        return assetRepository.save(asset);
    }

    public List<Asset> getAllAssets() {
        return assetRepository.findAll();
    }

    public Asset getAssetById(Long id) {
        return assetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Asset not found with ID: " + id
                ));
    }

    @Transactional
    public Asset updateAsset(Long id, Asset updatedAsset) {
        Asset existingAsset = getAssetById(id);

        if (updatedAsset.getAssetId() != null
                && !updatedAsset.getAssetId().equals(existingAsset.getAssetId())) {

            if (assetRepository.existsByAssetId(updatedAsset.getAssetId())) {
                throw new IllegalArgumentException(
                        "Asset ID already exists: " + updatedAsset.getAssetId()
                );
            }

            existingAsset.setAssetId(updatedAsset.getAssetId());
        }

        if (updatedAsset.getAssetType() != null) {
            existingAsset.setAssetType(updatedAsset.getAssetType());
        }

        existingAsset.setManufacturer(updatedAsset.getManufacturer());
        existingAsset.setModel(updatedAsset.getModel());
        existingAsset.setSerialNumber(updatedAsset.getSerialNumber());

        if (updatedAsset.getUsageHours() != null) {
            existingAsset.setUsageHours(updatedAsset.getUsageHours());
        }

        if (updatedAsset.getUsageCycles() != null) {
            existingAsset.setUsageCycles(updatedAsset.getUsageCycles());
        }

        if (updatedAsset.getStatus() != null) {
            existingAsset.setStatus(updatedAsset.getStatus());
        }

        return assetRepository.save(existingAsset);
    }
}