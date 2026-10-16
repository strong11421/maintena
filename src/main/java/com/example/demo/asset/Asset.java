
package com.example.demo.asset;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "assets")
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "asset_code", nullable = false, unique = true)
    private String assetId;

    @Column(nullable = false)
    private String assetType;

    private String manufacturer;
    private String model;
    private String serialNumber;

    private BigDecimal usageHours;
    private Long usageCycles;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetStatus status = AssetStatus.ACTIVE;

    public Asset() {
    }

    public Long getId() {
        return id;
    }

    public String getAssetId() {
        return assetId;
    }

    public void setAssetId(String assetId) {
        this.assetId = assetId;
    }

    public String getAssetType() {
        return assetType;
    }

    public void setAssetType(String assetType) {
        this.assetType = assetType;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public BigDecimal getUsageHours() {
        return usageHours;
    }

    public void setUsageHours(BigDecimal usageHours) {
        this.usageHours = usageHours;
    }

    public Long getUsageCycles() {
        return usageCycles;
    }

    public void setUsageCycles(Long usageCycles) {
        this.usageCycles = usageCycles;
    }

    public AssetStatus getStatus() {
        return status;
    }

    public void setStatus(AssetStatus status) {
        this.status = status;
    }
}
