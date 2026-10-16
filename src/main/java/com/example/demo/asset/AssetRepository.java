package com.example.demo.asset;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetRepository extends JpaRepository<Asset, Long> {

    boolean existsByAssetId(String assetId);
}