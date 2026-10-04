package com.store.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "flash_sale_campaign")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashSaleCampaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "campaign_id")
    private Long campaignId;

    @Column(nullable = false)
    @Builder.Default
    private String title = "FLASHSALE TỰU TRƯỜNG";

    @Column(columnDefinition = "TEXT")
    private String disclaimer;

    @Column(name = "start_time")
    @Builder.Default
    private OffsetDateTime startTime = OffsetDateTime.now();

    @Column(name = "end_time")
    @Builder.Default
    private OffsetDateTime endTime = OffsetDateTime.now().plusDays(7);

    @Column(length = 20)
    @Builder.Default
    private String status = "ACTIVE"; // UPCOMING, ACTIVE, ENDED, INACTIVE

    @Column(name = "publish_status", length = 20)
    @Builder.Default
    private String publishStatus = "ACTIVE"; // DRAFT, ACTIVE, PAUSED

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Version
    @Column(name = "version")
    private Long version;

    @Column(name = "updated_by", length = 100)
    @Builder.Default
    private String updatedBy = "Admin";

    @Column(name = "created_at")
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<FlashSaleTimeSlot> timeSlots = new ArrayList<>();

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<FlashSaleItem> products = new ArrayList<>();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}
