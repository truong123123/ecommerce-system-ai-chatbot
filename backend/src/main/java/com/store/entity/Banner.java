package com.store.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "banners")
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 500)
    private String headline;

    @Column(columnDefinition = "TEXT")
    private String subHeadline;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "primary_btn_text")
    private String primaryBtnText;

    @Column(name = "primary_btn_link", length = 500)
    private String primaryBtnLink;

    @Column(name = "secondary_btn_text")
    private String secondaryBtnText;

    @Column(name = "secondary_btn_link", length = 500)
    private String secondaryBtnLink;

    @Column(name = "bg_color")
    private String bgColor;

    @Column(name = "text_color")
    private String textColor;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Banner() {}

    public Banner(String title, String headline, String subHeadline, String imageUrl,
                  String primaryBtnText, String primaryBtnLink,
                  String secondaryBtnText, String secondaryBtnLink,
                  String bgColor, String textColor, Integer displayOrder) {
        this.title = title;
        this.headline = headline;
        this.subHeadline = subHeadline;
        this.imageUrl = imageUrl;
        this.primaryBtnText = primaryBtnText;
        this.primaryBtnLink = primaryBtnLink;
        this.secondaryBtnText = secondaryBtnText;
        this.secondaryBtnLink = secondaryBtnLink;
        this.bgColor = bgColor;
        this.textColor = textColor;
        this.displayOrder = displayOrder;
        this.isActive = true;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }

    public String getSubHeadline() { return subHeadline; }
    public void setSubHeadline(String subHeadline) { this.subHeadline = subHeadline; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getPrimaryBtnText() { return primaryBtnText; }
    public void setPrimaryBtnText(String primaryBtnText) { this.primaryBtnText = primaryBtnText; }

    public String getPrimaryBtnLink() { return primaryBtnLink; }
    public void setPrimaryBtnLink(String primaryBtnLink) { this.primaryBtnLink = primaryBtnLink; }

    public String getSecondaryBtnText() { return secondaryBtnText; }
    public void setSecondaryBtnText(String secondaryBtnText) { this.secondaryBtnText = secondaryBtnText; }

    public String getSecondaryBtnLink() { return secondaryBtnLink; }
    public void setSecondaryBtnLink(String secondaryBtnLink) { this.secondaryBtnLink = secondaryBtnLink; }

    public String getBgColor() { return bgColor; }
    public void setBgColor(String bgColor) { this.bgColor = bgColor; }

    public String getTextColor() { return textColor; }
    public void setTextColor(String textColor) { this.textColor = textColor; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
