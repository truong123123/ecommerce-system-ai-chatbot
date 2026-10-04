package com.store.service.impl;

import com.store.dto.flashsale.*;
import com.store.entity.*;
import com.store.repository.*;
import com.store.service.FlashSaleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlashSaleServiceImpl implements FlashSaleService {

    private final FlashSaleCampaignRepository campaignRepository;
    private final FlashSaleItemRepository itemRepository;
    private final FlashSaleTimeSlotRepository timeSlotRepository;
    private final FlashSaleUserPurchaseRepository userPurchaseRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final FlashSaleSlotRepository slotRepository;
    private final FlashSaleSlotProductRepository slotProductRepository;
    private final FlashSalePurchaseRepository purchaseRepository;
    private final FlashSaleAuditLogRepository auditLogRepository;
    private final InventoryRepository inventoryRepository;

    private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    // =========================================================
    // PUBLIC API
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public FlashSaleCampaignDto getActiveCampaign() {
        OffsetDateTime now = OffsetDateTime.now(VN_ZONE);
        List<FlashSaleCampaign> allActive = campaignRepository.findAll().stream()
                .filter(c -> {
                    String pub = c.getPublishStatus() != null ? c.getPublishStatus() : c.getStatus();
                    return "ACTIVE".equalsIgnoreCase(pub) && Boolean.TRUE.equals(c.getIsActive());
                })
                .filter(c -> c.getProducts() != null && !c.getProducts().isEmpty())
                .collect(Collectors.toList());

        if (allActive.isEmpty()) {
            return null;
        }

        // Ưu tiên (a): Đang diễn ra (có slot live) và còn suất mua
        Optional<FlashSaleCampaign> ongoingWithStock = allActive.stream()
                .filter(c -> "RUNNING".equalsIgnoreCase(computeRuntimeStatus(c, now)))
                .filter(c -> c.getProducts().stream().anyMatch(i -> {
                    int total = i.getTotalStock() != null ? i.getTotalStock() : 0;
                    int sold = i.getSoldCount() != null ? i.getSoldCount() : 0;
                    return (total - sold) > 0;
                }))
                .min(Comparator.comparing(this::getEffectiveEnd));

        if (ongoingWithStock.isPresent()) {
            return mapToDto(ongoingWithStock.get());
        }

        // Ưu tiên (b): Chiến dịch sắp diễn ra gần nhất có sản phẩm
        Optional<FlashSaleCampaign> upcoming = allActive.stream()
                .filter(c -> {
                    String rts = computeRuntimeStatus(c, now);
                    return "UPCOMING".equalsIgnoreCase(rts) || "WAITING_NEXT".equalsIgnoreCase(rts);
                })
                .min(Comparator.comparing(this::getEffectiveStart));

        if (upcoming.isPresent()) {
            return mapToDto(upcoming.get());
        }

        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlashSaleCampaignDto> getAllCampaigns() {
        return campaignRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FlashSaleCampaignDto getCampaignById(Long id) {
        FlashSaleCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chiến dịch Flash Sale: " + id));
        return mapToDto(campaign);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> checkPurchaseEligibility(Long itemId, Long customerId) {
        FlashSaleItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm Flash Sale: " + itemId));

        int soldCount = item.getSoldCount() != null ? item.getSoldCount() : 0;
        int totalStock = item.getTotalStock() != null ? item.getTotalStock() : 0;
        int remainingStock = Math.max(0, totalStock - soldCount);

        int userPurchased = 0;
        if (customerId != null) {
            userPurchased = userPurchaseRepository.sumPurchasedQuantity(itemId, customerId);
        }

        int maxPerUser = item.getMaxQuantityPerUser() != null ? item.getMaxQuantityPerUser() : 1;
        int userCanBuy = Math.max(0, Math.min(remainingStock, maxPerUser - userPurchased));
        boolean isEligible = remainingStock > 0 && userCanBuy > 0;

        return Map.of(
                "itemId", itemId,
                "remainingStock", remainingStock,
                "userPurchased", userPurchased,
                "maxQuantityPerUser", maxPerUser,
                "userCanBuy", userCanBuy,
                "isEligible", isEligible,
                "salePrice", item.getSalePrice()
        );
    }

    // =========================================================
    // ADMIN CAMPAIGN MANAGEMENT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<FlashSaleCampaignDto> getAdminCampaigns() {
        return campaignRepository.findAll().stream()
                .sorted(Comparator.comparing(FlashSaleCampaign::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getAdminCampaignsPaginated(int page, int size, String sort, String q, String runtimeStatus, String publishStatus) {
        List<FlashSaleCampaign> all = campaignRepository.findAll();
        List<FlashSaleCampaignDto> dtos = all.stream().map(this::mapToDto).collect(Collectors.toList());

        // Tổng thống kê trên toàn bộ campaign
        long runningCount = dtos.stream().filter(c -> "RUNNING".equalsIgnoreCase(c.getRuntimeStatus())).count();
        long upcomingCount = dtos.stream().filter(c -> "UPCOMING".equalsIgnoreCase(c.getRuntimeStatus()) || "WAITING_NEXT".equalsIgnoreCase(c.getRuntimeStatus())).count();
        long endedCount = dtos.stream().filter(c -> "ENDED".equalsIgnoreCase(c.getRuntimeStatus())).count();
        long draftOrPausedCount = dtos.stream().filter(c -> "DRAFT".equalsIgnoreCase(c.getPublishStatus()) || "PAUSED".equalsIgnoreCase(c.getPublishStatus())).count();
        int totalSoldAll = dtos.stream().mapToInt(c -> c.getTotalSoldQuantity() != null ? c.getTotalSoldQuantity() : 0).sum();
        BigDecimal totalRevenueAll = dtos.stream()
                .map(c -> c.getTotalRevenue() != null ? c.getTotalRevenue() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = new HashMap<>();
        stats.put("runningCount", runningCount);
        stats.put("upcomingCount", upcomingCount);
        stats.put("endedCount", endedCount);
        stats.put("draftOrPausedCount", draftOrPausedCount);
        stats.put("totalSoldAll", totalSoldAll);
        stats.put("totalRevenueAll", totalRevenueAll);

        // Lọc theo tìm kiếm từ khoá q (ID hoặc tên)
        if (q != null && !q.trim().isEmpty()) {
            String queryLower = q.trim().toLowerCase();
            dtos = dtos.stream().filter(c ->
                    String.valueOf(c.getCampaignId()).contains(queryLower) ||
                    (c.getTitle() != null && c.getTitle().toLowerCase().contains(queryLower))
            ).collect(Collectors.toList());
        }

        // Lọc theo runtimeStatus
        if (runtimeStatus != null && !runtimeStatus.trim().isEmpty() && !"ALL".equalsIgnoreCase(runtimeStatus)) {
            dtos = dtos.stream().filter(c -> runtimeStatus.equalsIgnoreCase(c.getRuntimeStatus())).collect(Collectors.toList());
        }

        // Lọc theo publishStatus
        if (publishStatus != null && !publishStatus.trim().isEmpty() && !"ALL".equalsIgnoreCase(publishStatus)) {
            dtos = dtos.stream().filter(c -> publishStatus.equalsIgnoreCase(c.getPublishStatus())).collect(Collectors.toList());
        }

        // Sắp xếp
        if ("title_asc".equalsIgnoreCase(sort)) {
            dtos.sort(Comparator.comparing(FlashSaleCampaignDto::getTitle, Comparator.nullsLast(String::compareToIgnoreCase)));
        } else if ("title_desc".equalsIgnoreCase(sort)) {
            dtos.sort(Comparator.comparing(FlashSaleCampaignDto::getTitle, Comparator.nullsLast(String::compareToIgnoreCase)).reversed());
        } else if ("start_asc".equalsIgnoreCase(sort)) {
            dtos.sort(Comparator.comparing(FlashSaleCampaignDto::getCalculatedStartAt, Comparator.nullsLast(Comparator.naturalOrder())));
        } else if ("start_desc".equalsIgnoreCase(sort)) {
            dtos.sort(Comparator.comparing(FlashSaleCampaignDto::getCalculatedStartAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed());
        } else {
            // Mặc định: createdAt desc
            dtos.sort(Comparator.comparing(FlashSaleCampaignDto::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed());
        }

        int totalElements = dtos.size();
        int totalPages = size > 0 ? (int) Math.ceil((double) totalElements / size) : 1;
        int fromIndex = Math.min(page * size, totalElements);
        int toIndex = Math.min(fromIndex + size, totalElements);
        List<FlashSaleCampaignDto> pageContent = dtos.subList(fromIndex, toIndex);

        Map<String, Object> result = new HashMap<>();
        result.put("content", pageContent);
        result.put("page", page);
        result.put("size", size);
        result.put("totalElements", totalElements);
        result.put("totalPages", totalPages);
        result.put("stats", stats);
        return result;
    }

    @Override
    @Transactional
    public FlashSaleCampaignDto createCampaign(CreateFlashSaleRequest request) {
        String pubStatus = request.getPublishStatus() != null ? request.getPublishStatus().toUpperCase() : "DRAFT";
        boolean isActive = "ACTIVE".equalsIgnoreCase(pubStatus);

        FlashSaleCampaign campaign = FlashSaleCampaign.builder()
                .title(request.getTitle())
                .disclaimer(request.getDisclaimer() != null ? request.getDisclaimer() : "")
                .publishStatus(pubStatus)
                .status(pubStatus)
                .isActive(isActive)
                .updatedBy(getCurrentUsername())
                .createdAt(OffsetDateTime.now(VN_ZONE))
                .updatedAt(OffsetDateTime.now(VN_ZONE))
                .build();

        FlashSaleCampaign saved = campaignRepository.save(campaign);

        // Tạo slot ban đầu nếu có gửi kèm
        if (request.getTimeSlots() != null && !request.getTimeSlots().isEmpty()) {
            for (CreateFlashSaleRequest.TimeSlotInput slotInput : request.getTimeSlots()) {
                if (slotInput.getStartTime() == null || slotInput.getEndTime() == null || !slotInput.getEndTime().isAfter(slotInput.getStartTime())) {
                    continue;
                }
                FlashSaleTimeSlot slot = FlashSaleTimeSlot.builder()
                        .campaign(saved)
                        .label(slotInput.getLabel() != null ? slotInput.getLabel() : generateSlotLabel(slotInput.getStartTime(), slotInput.getEndTime()))
                        .startTime(slotInput.getStartTime())
                        .endTime(slotInput.getEndTime())
                        .isActive(Boolean.TRUE.equals(slotInput.getIsActive()))
                        .build();
                saved.getTimeSlots().add(slot);
            }
            saved = campaignRepository.save(saved);
        }

        logAudit(saved.getCampaignId(), "CREATE_CAMPAIGN", "Tạo mới chiến dịch: " + saved.getTitle() + " (publishStatus=" + pubStatus + ")");
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public FlashSaleCampaignDto updateCampaign(Long id, CreateFlashSaleRequest request) {
        FlashSaleCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chiến dịch: " + id));

        campaign.setTitle(request.getTitle());
        if (request.getDisclaimer() != null) {
            campaign.setDisclaimer(request.getDisclaimer());
        }

        String pubStatus = request.getPublishStatus() != null ? request.getPublishStatus().toUpperCase() : request.getStatus();
        if (pubStatus != null) {
            campaign.setPublishStatus(pubStatus);
            campaign.setStatus(pubStatus);
            campaign.setIsActive("ACTIVE".equalsIgnoreCase(pubStatus));
        }

        campaign.setUpdatedBy(getCurrentUsername());
        campaign.setUpdatedAt(OffsetDateTime.now(VN_ZONE));

        FlashSaleCampaign saved = campaignRepository.save(campaign);
        logAudit(id, "UPDATE_CAMPAIGN", "Cập nhật thông tin chiến dịch: " + saved.getTitle());
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public void updateCampaignStatus(Long id, String status) {
        FlashSaleCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chiến dịch: " + id));

        String upper = status.toUpperCase();
        campaign.setPublishStatus(upper);
        campaign.setStatus(upper);
        campaign.setIsActive("ACTIVE".equalsIgnoreCase(upper));
        campaign.setUpdatedBy(getCurrentUsername());
        campaign.setUpdatedAt(OffsetDateTime.now(VN_ZONE));
        campaignRepository.save(campaign);

        logAudit(id, "CHANGE_STATUS", "Đổi trạng thái publishStatus sang: " + upper);
    }

    @Override
    @Transactional
    public void deleteCampaign(Long id) {
        FlashSaleCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chiến dịch: " + id));

        // Kiểm tra an toàn: nếu đã có lượt bán -> KHÔNG cho xoá cứng, chỉ cho Tạm dừng / Lưu trữ
        int totalSold = campaign.getProducts() != null ?
                campaign.getProducts().stream().mapToInt(p -> p.getSoldCount() != null ? p.getSoldCount() : 0).sum() : 0;

        if (totalSold > 0) {
            throw new IllegalStateException("Chiến dịch đã có " + totalSold + " suất bán thành công. Không thể xóa cứng! Vui lòng chuyển trạng thái sang TẠM DỪNG (PAUSED).");
        }

        logAudit(id, "DELETE_CAMPAIGN", "Xóa cứng chiến dịch #" + id + " - " + campaign.getTitle());
        campaignRepository.delete(campaign);
    }

    @Override
    @Transactional
    public FlashSaleCampaignDto duplicateCampaign(Long id, DuplicateCampaignRequest request) {
        FlashSaleCampaign source = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chiến dịch gốc: " + id));

        String newTitle = (request.getNewTitle() != null && !request.getNewTitle().trim().isEmpty())
                ? request.getNewTitle().trim()
                : (source.getTitle() + " (Bản sao)");

        int shiftDays = request.getShiftDays() != null ? request.getShiftDays() : 0;

        FlashSaleCampaign copy = FlashSaleCampaign.builder()
                .title(newTitle)
                .disclaimer(source.getDisclaimer())
                .publishStatus("DRAFT")
                .status("DRAFT")
                .isActive(false)
                .updatedBy(getCurrentUsername())
                .createdAt(OffsetDateTime.now(VN_ZONE))
                .updatedAt(OffsetDateTime.now(VN_ZONE))
                .build();

        FlashSaleCampaign savedCampaign = campaignRepository.save(copy);

        // Nhân bản các slot và sản phẩm
        if (source.getTimeSlots() != null && !source.getTimeSlots().isEmpty()) {
            for (FlashSaleTimeSlot sourceSlot : source.getTimeSlots()) {
                OffsetDateTime newStart = sourceSlot.getStartTime() != null ? sourceSlot.getStartTime().plusDays(shiftDays) : null;
                OffsetDateTime newEnd = sourceSlot.getEndTime() != null ? sourceSlot.getEndTime().plusDays(shiftDays) : null;
                String newLabel = (newStart != null && newEnd != null) ? generateSlotLabel(newStart, newEnd) : sourceSlot.getLabel();

                FlashSaleTimeSlot copySlot = FlashSaleTimeSlot.builder()
                        .campaign(savedCampaign)
                        .label(newLabel)
                        .startTime(newStart)
                        .endTime(newEnd)
                        .isActive(sourceSlot.getIsActive())
                        .build();

                FlashSaleTimeSlot savedSlot = timeSlotRepository.save(copySlot);

                if (Boolean.TRUE.equals(request.getCopyProducts()) || request.getCopyProducts() == null) {
                    List<FlashSaleItem> sourceItems = itemRepository.findByTimeSlotId(sourceSlot.getId());
                    for (FlashSaleItem sourceItem : sourceItems) {
                        FlashSaleItem copyItem = FlashSaleItem.builder()
                                .campaign(savedCampaign)
                                .timeSlot(savedSlot)
                                .product(sourceItem.getProduct())
                                .name(sourceItem.getName())
                                .imageUrl(sourceItem.getImageUrl())
                                .originalPrice(sourceItem.getOriginalPrice())
                                .salePrice(sourceItem.getSalePrice())
                                .discountPercent(sourceItem.getDiscountPercent())
                                .soldCount(0)
                                .totalStock(sourceItem.getTotalStock())
                                .maxQuantityPerUser(sourceItem.getMaxQuantityPerUser())
                                .status("AVAILABLE")
                                .displayOrder(sourceItem.getDisplayOrder() != null ? sourceItem.getDisplayOrder() : 0)
                                .build();
                        itemRepository.save(copyItem);
                    }
                }
            }
        }

        logAudit(savedCampaign.getCampaignId(), "DUPLICATE_CAMPAIGN", "Nhân bản từ chiến dịch #" + id + ", tịnh tiến " + shiftDays + " ngày.");
        return mapToDto(campaignRepository.findById(savedCampaign.getCampaignId()).orElse(savedCampaign));
    }

    // =========================================================
    // ADMIN SLOT MANAGEMENT
    // =========================================================

    @Override
    @Transactional
    public FlashSaleTimeSlotDto addSlotToCampaign(Long campaignId, CreateFlashSaleSlotRequest request) {
        FlashSaleCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chiến dịch: " + campaignId));

        validateSlotTimes(request.getStartTime(), request.getEndTime());

        String label = request.getLabel();
        if (label == null || label.trim().isEmpty()) {
            label = generateSlotLabel(request.getStartTime(), request.getEndTime());
        }

        FlashSaleTimeSlot slot = FlashSaleTimeSlot.builder()
                .campaign(campaign)
                .label(label.trim())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        FlashSaleTimeSlot saved = timeSlotRepository.save(slot);
        logAudit(campaignId, "ADD_SLOT", "Thêm khung giờ: " + saved.getLabel());
        return mapSlotToDto(saved);
    }

    @Override
    @Transactional
    public BulkCreateSlotsPreviewResponse bulkCreateSlots(Long campaignId, BulkCreateSlotsRequest request) {
        FlashSaleCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chiến dịch: " + campaignId));

        LocalDate startDay = LocalDate.parse(request.getStartDate());
        LocalDate endDay = LocalDate.parse(request.getEndDate());
        LocalTime dailyStart = LocalTime.parse(request.getDailyStartTime());
        LocalTime dailyEnd = LocalTime.parse(request.getDailyEndTime());

        if (endDay.isBefore(startDay)) {
            throw new IllegalArgumentException("Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.");
        }
        if (request.getSlotDurationMinutes() == null || request.getSlotDurationMinutes() <= 0) {
            throw new IllegalArgumentException("Thời lượng mỗi slot phải lớn hơn 0 phút.");
        }

        List<FlashSaleTimeSlotDto> previewDtos = new ArrayList<>();
        List<FlashSaleTimeSlot> slotsToSave = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        List<FlashSaleTimeSlot> existingSlots = timeSlotRepository.findByCampaignCampaignIdOrderByStartTimeAsc(campaignId);

        for (LocalDate day = startDay; !day.isAfter(endDay); day = day.plusDays(1)) {
            int dow = day.getDayOfWeek().getValue(); // 1 = Thứ 2 .. 7 = Chủ Nhật
            if (request.getDaysOfWeek() != null && !request.getDaysOfWeek().isEmpty() && !request.getDaysOfWeek().contains(dow)) {
                continue;
            }

            LocalTime curTime = dailyStart;
            while (true) {
                LocalTime nextTime = curTime.plusMinutes(request.getSlotDurationMinutes());
                OffsetDateTime slotStart = day.atTime(curTime).atZone(VN_ZONE).toOffsetDateTime();
                OffsetDateTime slotEnd;
                boolean isOvernight = false;

                if (nextTime.isBefore(curTime) || nextTime.equals(LocalTime.MIDNIGHT) || dailyEnd.isBefore(dailyStart)) {
                    slotEnd = day.plusDays(1).atTime(nextTime).atZone(VN_ZONE).toOffsetDateTime();
                    isOvernight = true;
                } else {
                    slotEnd = day.atTime(nextTime).atZone(VN_ZONE).toOffsetDateTime();
                }

                OffsetDateTime dailyEndDt = day.atTime(dailyEnd).atZone(VN_ZONE).toOffsetDateTime();
                if (dailyEnd.isBefore(dailyStart)) {
                    dailyEndDt = day.plusDays(1).atTime(dailyEnd).atZone(VN_ZONE).toOffsetDateTime();
                }
                if (slotEnd.isAfter(dailyEndDt)) {
                    break;
                }

                String label = generateSlotLabel(slotStart, slotEnd);

                // Kiểm tra chồng lấn giờ với slot đã có
                for (FlashSaleTimeSlot existing : existingSlots) {
                    if (existing.getStartTime() != null && existing.getEndTime() != null) {
                        if (slotStart.isBefore(existing.getEndTime()) && slotEnd.isAfter(existing.getStartTime())) {
                            warnings.add("Slot [" + label + "] chồng giờ với slot đã có: '" + existing.getLabel() + "'");
                        }
                    }
                }

                FlashSaleTimeSlot newSlot = FlashSaleTimeSlot.builder()
                        .campaign(campaign)
                        .label(label)
                        .startTime(slotStart)
                        .endTime(slotEnd)
                        .isActive(true)
                        .build();

                slotsToSave.add(newSlot);
                previewDtos.add(FlashSaleTimeSlotDto.builder()
                        .label(label)
                        .startTime(slotStart)
                        .endTime(slotEnd)
                        .isActive(true)
                        .isOvernight(isOvernight)
                        .status("upcoming")
                        .productCount(0)
                        .build());

                int gap = (request.getBreakMinutes() != null && request.getBreakMinutes() > 0) ? request.getBreakMinutes() : 0;
                curTime = nextTime.plusMinutes(gap);
                if (curTime.isBefore(nextTime) || curTime.isAfter(dailyEnd)) {
                    break;
                }
            }
        }

        if (!Boolean.TRUE.equals(request.getDryRun())) {
            for (FlashSaleTimeSlot s : slotsToSave) {
                timeSlotRepository.save(s);
            }
            logAudit(campaignId, "BULK_CREATE_SLOTS", "Đã tạo hàng loạt " + slotsToSave.size() + " khung giờ.");
        }

        return BulkCreateSlotsPreviewResponse.builder()
                .slots(previewDtos)
                .totalSlots(previewDtos.size())
                .warnings(warnings)
                .isDryRun(Boolean.TRUE.equals(request.getDryRun()))
                .build();
    }

    @Override
    @Transactional
    public FlashSaleTimeSlotDto updateCampaignSlot(Long campaignId, Long slotId, CreateFlashSaleSlotRequest request) {
        FlashSaleTimeSlot slot = timeSlotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khung giờ: " + slotId));

        if (slot.getCampaign() == null || !slot.getCampaign().getCampaignId().equals(campaignId)) {
            throw new IllegalArgumentException("Khung giờ #" + slotId + " không thuộc chiến dịch #" + campaignId);
        }

        validateSlotTimes(request.getStartTime(), request.getEndTime());

        OffsetDateTime now = OffsetDateTime.now(VN_ZONE);
        String currentSlotStatus = getSlotStatus(slot, now);

        if ("ended".equalsIgnoreCase(currentSlotStatus)) {
            throw new IllegalStateException("Khung giờ đã kết thúc. Khóa chỉnh sửa!");
        }

        if ("live".equalsIgnoreCase(currentSlotStatus)) {
            // Không được đổi start time khi slot đang live
            if (!slot.getStartTime().isEqual(request.getStartTime())) {
                throw new IllegalStateException("Khung giờ đang diễn ra (RUNNING), không được phép thay đổi thời gian bắt đầu.");
            }
            logAudit(campaignId, "UPDATE_SLOT_WHILE_RUNNING", "Điều chỉnh thời gian kết thúc slot đang chạy: #" + slotId);
        }

        String label = request.getLabel();
        if (label == null || label.trim().isEmpty()) {
            label = generateSlotLabel(request.getStartTime(), request.getEndTime());
        }

        slot.setLabel(label.trim());
        slot.setStartTime(request.getStartTime());
        slot.setEndTime(request.getEndTime());
        if (request.getIsActive() != null) {
            slot.setIsActive(request.getIsActive());
        }

        FlashSaleTimeSlot saved = timeSlotRepository.save(slot);
        logAudit(campaignId, "UPDATE_SLOT", "Cập nhật khung giờ #" + slotId + " (" + saved.getLabel() + ")");
        return mapSlotToDto(saved);
    }

    @Override
    @Transactional
    public void deleteCampaignSlot(Long campaignId, Long slotId) {
        FlashSaleTimeSlot slot = timeSlotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khung giờ: " + slotId));

        if (slot.getCampaign() == null || !slot.getCampaign().getCampaignId().equals(campaignId)) {
            throw new IllegalArgumentException("Khung giờ #" + slotId + " không thuộc chiến dịch #" + campaignId);
        }

        OffsetDateTime now = OffsetDateTime.now(VN_ZONE);
        if ("live".equalsIgnoreCase(getSlotStatus(slot, now))) {
            throw new IllegalStateException("Khung giờ đang diễn ra (RUNNING), không thể xóa.");
        }

        List<FlashSaleItem> itemsInSlot = itemRepository.findByTimeSlotId(slotId);
        int totalSold = itemsInSlot.stream().mapToInt(i -> i.getSoldCount() != null ? i.getSoldCount() : 0).sum();
        if (totalSold > 0) {
            throw new IllegalStateException("Khung giờ đã có " + totalSold + " suất đã bán thành công. Không thể xóa cứng!");
        }

        // Xóa các sản phẩm trong slot trước nếu số lượng bán = 0
        for (FlashSaleItem item : itemsInSlot) {
            itemRepository.delete(item);
        }

        timeSlotRepository.delete(slot);
        logAudit(campaignId, "DELETE_SLOT", "Xóa khung giờ #" + slotId + " (" + slot.getLabel() + ")");
    }

    @Override
    @Transactional
    public FlashSaleTimeSlotDto duplicateSlot(Long campaignId, Long slotId, OffsetDateTime targetStartTime) {
        FlashSaleCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chiến dịch: " + campaignId));

        FlashSaleTimeSlot source = timeSlotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khung giờ gốc: " + slotId));

        Duration duration = Duration.between(source.getStartTime(), source.getEndTime());
        OffsetDateTime targetEndTime = targetStartTime.plus(duration);

        FlashSaleTimeSlot copySlot = FlashSaleTimeSlot.builder()
                .campaign(campaign)
                .label(generateSlotLabel(targetStartTime, targetEndTime))
                .startTime(targetStartTime)
                .endTime(targetEndTime)
                .isActive(true)
                .build();

        FlashSaleTimeSlot savedSlot = timeSlotRepository.save(copySlot);

        // Sao chép sản phẩm sang slot mới với sold = 0
        List<FlashSaleItem> sourceItems = itemRepository.findByTimeSlotId(source.getId());
        for (FlashSaleItem item : sourceItems) {
            FlashSaleItem copyItem = FlashSaleItem.builder()
                    .campaign(campaign)
                    .timeSlot(savedSlot)
                    .product(item.getProduct())
                    .name(item.getName())
                    .imageUrl(item.getImageUrl())
                    .originalPrice(item.getOriginalPrice())
                    .salePrice(item.getSalePrice())
                    .discountPercent(item.getDiscountPercent())
                    .soldCount(0)
                    .totalStock(item.getTotalStock())
                    .maxQuantityPerUser(item.getMaxQuantityPerUser())
                    .status("AVAILABLE")
                    .displayOrder(item.getDisplayOrder() != null ? item.getDisplayOrder() : 0)
                    .build();
            itemRepository.save(copyItem);
        }

        logAudit(campaignId, "DUPLICATE_SLOT", "Nhân bản khung giờ #" + slotId + " sang slot mới #" + savedSlot.getId() + " (" + savedSlot.getLabel() + ")");
        return mapSlotToDto(savedSlot);
    }

    @Override
    @Transactional
    public void copyProductsFromSlot(Long campaignId, Long targetSlotId, Long sourceSlotId) {
        FlashSaleTimeSlot targetSlot = timeSlotRepository.findById(targetSlotId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khung giờ đích: " + targetSlotId));

        FlashSaleCampaign campaign = targetSlot.getCampaign();
        List<FlashSaleItem> sourceItems = itemRepository.findByTimeSlotId(sourceSlotId);
        List<FlashSaleItem> targetItems = itemRepository.findByTimeSlotId(targetSlotId);

        Set<Long> existingProdIds = targetItems.stream()
                .map(i -> i.getProduct() != null ? i.getProduct().getProductId() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        int count = 0;
        for (FlashSaleItem sourceItem : sourceItems) {
            if (sourceItem.getProduct() != null && !existingProdIds.contains(sourceItem.getProduct().getProductId())) {
                FlashSaleItem newItem = FlashSaleItem.builder()
                        .campaign(campaign)
                        .timeSlot(targetSlot)
                        .product(sourceItem.getProduct())
                        .name(sourceItem.getName())
                        .imageUrl(sourceItem.getImageUrl())
                        .originalPrice(sourceItem.getOriginalPrice())
                        .salePrice(sourceItem.getSalePrice())
                        .discountPercent(sourceItem.getDiscountPercent())
                        .soldCount(0)
                        .totalStock(sourceItem.getTotalStock())
                        .maxQuantityPerUser(sourceItem.getMaxQuantityPerUser())
                        .status("AVAILABLE")
                        .displayOrder(targetItems.size() + count)
                        .build();
                itemRepository.save(newItem);
                count++;
            }
        }

        logAudit(campaignId, "COPY_PRODUCTS_FROM_SLOT", "Sao chép " + count + " sản phẩm từ slot #" + sourceSlotId + " sang slot #" + targetSlotId);
    }

    // =========================================================
    // ADMIN PRODUCT MANAGEMENT
    // =========================================================

    @Override
    @Transactional
    public FlashSaleItemDto addItemToCampaign(Long campaignId, AddFlashSaleItemRequest request) {
        FlashSaleCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chiến dịch: " + campaignId));

        if (request.getSlotId() == null) {
            throw new IllegalArgumentException("Vui lòng chọn khung giờ (slotId).");
        }

        FlashSaleTimeSlot slot = timeSlotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khung giờ: " + request.getSlotId()));

        OffsetDateTime now = OffsetDateTime.now(VN_ZONE);
        if ("ended".equalsIgnoreCase(getSlotStatus(slot, now))) {
            throw new IllegalStateException("Khung giờ đã kết thúc. Không thể thêm sản phẩm.");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm: " + request.getProductId()));

        boolean existsInSlot = itemRepository.findByTimeSlotId(slot.getId()).stream()
                .anyMatch(p -> p.getProduct() != null && p.getProduct().getProductId().equals(product.getProductId()));
        if (existsInSlot) {
            throw new IllegalArgumentException("Sản phẩm '" + product.getName() + "' đã có trong khung giờ này.");
        }

        BigDecimal originalPrice = resolveProductOriginalPrice(product, request.getSalePrice());
        if (request.getSalePrice().compareTo(originalPrice) >= 0) {
            throw new IllegalArgumentException("Giá Flash Sale (" + request.getSalePrice() + ") phải thấp hơn giá gốc (" + originalPrice + ").");
        }
        if (request.getTotalStock() == null || request.getTotalStock() <= 0) {
            throw new IllegalArgumentException("Số suất Flash Sale phải lớn hơn 0.");
        }

        int discountPercent = originalPrice.subtract(request.getSalePrice())
                .divide(originalPrice, 2, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .intValue();

        String imageUrl = resolveProductImage(product);

        List<FlashSaleItem> currentItems = itemRepository.findByTimeSlotId(slot.getId());
        int displayOrder = currentItems.size();

        FlashSaleItem item = FlashSaleItem.builder()
                .campaign(campaign)
                .timeSlot(slot)
                .product(product)
                .name(product.getName())
                .imageUrl(imageUrl)
                .originalPrice(originalPrice)
                .salePrice(request.getSalePrice())
                .discountPercent(discountPercent)
                .soldCount(0)
                .totalStock(request.getTotalStock())
                .maxQuantityPerUser(request.getMaxQuantityPerUser() != null ? request.getMaxQuantityPerUser() : 1)
                .status("AVAILABLE")
                .displayOrder(displayOrder)
                .build();

        FlashSaleItem saved = itemRepository.save(item);
        logAudit(campaignId, "ADD_PRODUCT", "Thêm sản phẩm '" + product.getName() + "' vào slot #" + slot.getId());
        return mapItemToDto(saved);
    }

    @Override
    @Transactional
    public List<FlashSaleItemDto> addProductsBatchToSlot(Long campaignId, Long slotId, AddSlotProductsBatchRequest request) {
        FlashSaleCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chiến dịch: " + campaignId));

        FlashSaleTimeSlot slot = timeSlotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khung giờ: " + slotId));

        OffsetDateTime now = OffsetDateTime.now(VN_ZONE);
        if ("ended".equalsIgnoreCase(getSlotStatus(slot, now))) {
            throw new IllegalStateException("Khung giờ đã kết thúc. Không thể thêm sản phẩm.");
        }

        List<FlashSaleItem> existing = itemRepository.findByTimeSlotId(slotId);
        Set<Long> existingProdIds = existing.stream()
                .map(i -> i.getProduct() != null ? i.getProduct().getProductId() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<FlashSaleItemDto> results = new ArrayList<>();
        int orderIndex = existing.size();

        for (AddSlotProductsBatchRequest.ProductItemRequest itemReq : request.getItems()) {
            if (existingProdIds.contains(itemReq.getProductId())) {
                continue; // bỏ qua nếu đã có trong slot
            }

            Product product = productRepository.findById(itemReq.getProductId()).orElse(null);
            if (product == null) continue;

            BigDecimal originalPrice = itemReq.getOriginalPrice() != null ? itemReq.getOriginalPrice() : resolveProductOriginalPrice(product, itemReq.getSalePrice());
            BigDecimal salePrice = itemReq.getSalePrice();

            if (salePrice == null || salePrice.compareTo(BigDecimal.ZERO) <= 0) {
                if (itemReq.getDiscountPercent() != null && itemReq.getDiscountPercent() > 0) {
                    BigDecimal factor = BigDecimal.valueOf(100 - itemReq.getDiscountPercent()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                    salePrice = originalPrice.multiply(factor).setScale(0, RoundingMode.HALF_UP);
                } else {
                    salePrice = originalPrice.multiply(new BigDecimal("0.8")).setScale(0, RoundingMode.HALF_UP);
                }
            }

            if (salePrice.compareTo(originalPrice) >= 0) {
                salePrice = originalPrice.multiply(new BigDecimal("0.9")).setScale(0, RoundingMode.HALF_UP);
            }

            int discountPercent = originalPrice.subtract(salePrice)
                    .divide(originalPrice, 2, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .intValue();

            int quota = itemReq.getTotalStock() != null && itemReq.getTotalStock() > 0 ? itemReq.getTotalStock() : 10;
            int maxPerUser = itemReq.getMaxQuantityPerUser() != null ? itemReq.getMaxQuantityPerUser() : 1;

            FlashSaleItem item = FlashSaleItem.builder()
                    .campaign(campaign)
                    .timeSlot(slot)
                    .product(product)
                    .name(product.getName())
                    .imageUrl(resolveProductImage(product))
                    .originalPrice(originalPrice)
                    .salePrice(salePrice)
                    .discountPercent(discountPercent)
                    .soldCount(0)
                    .totalStock(quota)
                    .maxQuantityPerUser(maxPerUser)
                    .status("AVAILABLE")
                    .displayOrder(orderIndex++)
                    .build();

            FlashSaleItem saved = itemRepository.save(item);
            results.add(mapItemToDto(saved));
        }

        logAudit(campaignId, "ADD_PRODUCTS_BATCH", "Thêm hàng loạt " + results.size() + " sản phẩm vào slot #" + slotId);
        return results;
    }

    @Override
    @Transactional
    public FlashSaleItemDto updateCampaignItem(Long itemId, UpdateFlashSaleItemRequest request) {
        FlashSaleItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm Flash Sale: " + itemId));

        FlashSaleTimeSlot slot = item.getTimeSlot();
        OffsetDateTime now = OffsetDateTime.now(VN_ZONE);
        String slotStatus = slot != null ? getSlotStatus(slot, now) : "upcoming";

        if ("ended".equalsIgnoreCase(slotStatus)) {
            throw new IllegalStateException("Khung giờ đã kết thúc. Không thể sửa thông tin sản phẩm.");
        }

        if (request.getSalePrice() != null) {
            if (request.getSalePrice().compareTo(item.getOriginalPrice()) >= 0) {
                throw new IllegalArgumentException("Giá Flash Sale phải thấp hơn giá gốc (" + item.getOriginalPrice() + ").");
            }
            if ("live".equalsIgnoreCase(slotStatus)) {
                logAudit(item.getCampaign() != null ? item.getCampaign().getCampaignId() : null,
                        "UPDATE_PRICE_WHILE_RUNNING", "Đổi giá Flash Sale sản phẩm #" + itemId + " khi slot đang chạy: " + item.getSalePrice() + " -> " + request.getSalePrice());
            }
            item.setSalePrice(request.getSalePrice());
            int discountPercent = item.getOriginalPrice().subtract(request.getSalePrice())
                    .divide(item.getOriginalPrice(), 2, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .intValue();
            item.setDiscountPercent(discountPercent);
        }

        if (request.getTotalStock() != null) {
            int currentSold = item.getSoldCount() != null ? item.getSoldCount() : 0;
            if (request.getTotalStock() < currentSold) {
                throw new IllegalArgumentException("Số lượng suất không được nhỏ hơn số lượng đã bán (" + currentSold + ").");
            }
            item.setTotalStock(request.getTotalStock());
            if (currentSold >= item.getTotalStock()) {
                item.setStatus("SOLD_OUT");
            } else if (!"STOPPED".equalsIgnoreCase(item.getStatus())) {
                item.setStatus("AVAILABLE");
            }
        }

        if (request.getMaxQuantityPerUser() != null) {
            item.setMaxQuantityPerUser(request.getMaxQuantityPerUser());
        }

        FlashSaleItem saved = itemRepository.save(item);
        logAudit(saved.getCampaign() != null ? saved.getCampaign().getCampaignId() : null,
                "UPDATE_PRODUCT", "Cập nhật sản phẩm #" + itemId + " (" + saved.getName() + ")");
        return mapItemToDto(saved);
    }

    @Override
    @Transactional
    public void reorderSlotProducts(Long campaignId, Long slotId, ReorderSlotProductsRequest request) {
        if (request.getItemIds() == null || request.getItemIds().isEmpty()) return;

        List<FlashSaleItem> items = itemRepository.findByTimeSlotId(slotId);
        Map<Long, FlashSaleItem> itemMap = items.stream().collect(Collectors.toMap(FlashSaleItem::getId, i -> i));

        int order = 0;
        for (Long itemId : request.getItemIds()) {
            FlashSaleItem item = itemMap.get(itemId);
            if (item != null) {
                item.setDisplayOrder(order++);
                itemRepository.save(item);
            }
        }
        logAudit(campaignId, "REORDER_PRODUCTS", "Sắp xếp lại thứ tự hiển thị sản phẩm trong slot #" + slotId);
    }

    @Override
    @Transactional
    public void removeItemFromCampaign(Long itemId) {
        FlashSaleItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm Flash Sale: " + itemId));

        int sold = item.getSoldCount() != null ? item.getSoldCount() : 0;
        Long campaignId = item.getCampaign() != null ? item.getCampaign().getCampaignId() : null;

        if (sold > 0) {
            // Không xóa cứng, chuyển sang ngừng bán
            item.setStatus("STOPPED");
            itemRepository.save(item);
            logAudit(campaignId, "STOP_PRODUCT", "Sản phẩm #" + itemId + " đã bán " + sold + " suất -> Chuyển sang STOPPED (Ngừng bán)");
            throw new IllegalStateException("Sản phẩm đã có " + sold + " lượt mua thành công. Không thể xóa cứng, hệ thống đã chuyển sang trạng thái 'Ngừng bán'.");
        }

        logAudit(campaignId, "REMOVE_PRODUCT", "Xóa sản phẩm #" + itemId + " khỏi chiến dịch.");
        itemRepository.delete(item);
    }

    // =========================================================
    // ADMIN REPORTING & AUDIT LOG
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public FlashSaleReportDto getCampaignReport(Long campaignId) {
        FlashSaleCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chiến dịch: " + campaignId));

        List<FlashSaleTimeSlot> slots = timeSlotRepository.findByCampaignCampaignIdOrderByStartTimeAsc(campaignId);
        List<FlashSaleItem> items = itemRepository.findByCampaignCampaignId(campaignId);

        int totalQuota = items.stream().mapToInt(i -> i.getTotalStock() != null ? i.getTotalStock() : 0).sum();
        int totalSold = items.stream().mapToInt(i -> i.getSoldCount() != null ? i.getSoldCount() : 0).sum();
        double sellThroughRate = totalQuota > 0 ? ((double) totalSold / totalQuota) * 100.0 : 0.0;

        BigDecimal totalRevenue = items.stream()
                .map(i -> {
                    BigDecimal price = i.getSalePrice() != null ? i.getSalePrice() : BigDecimal.ZERO;
                    int sold = i.getSoldCount() != null ? i.getSoldCount() : 0;
                    return price.multiply(BigDecimal.valueOf(sold));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Báo cáo theo từng slot
        OffsetDateTime now = OffsetDateTime.now(VN_ZONE);
        List<FlashSaleReportDto.SlotReportItem> slotReports = slots.stream().map(s -> {
            List<FlashSaleItem> slotItems = items.stream()
                    .filter(i -> s.getId().equals(i.getTimeSlot() != null ? i.getTimeSlot().getId() : null))
                    .collect(Collectors.toList());

            int sq = slotItems.stream().mapToInt(i -> i.getTotalStock() != null ? i.getTotalStock() : 0).sum();
            int ss = slotItems.stream().mapToInt(i -> i.getSoldCount() != null ? i.getSoldCount() : 0).sum();
            double str = sq > 0 ? ((double) ss / sq) * 100.0 : 0.0;
            BigDecimal sRev = slotItems.stream()
                    .map(i -> (i.getSalePrice() != null ? i.getSalePrice() : BigDecimal.ZERO).multiply(BigDecimal.valueOf(i.getSoldCount() != null ? i.getSoldCount() : 0)))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            return FlashSaleReportDto.SlotReportItem.builder()
                    .slotId(s.getId())
                    .label(s.getLabel())
                    .timeRange(s.getStartTime() + " - " + s.getEndTime())
                    .status(getSlotStatus(s, now))
                    .productCount(slotItems.size())
                    .quota(sq)
                    .sold(ss)
                    .sellThroughRate(Math.round(str * 10.0) / 10.0)
                    .revenue(sRev)
                    .build();
        }).collect(Collectors.toList());

        // Báo cáo theo từng sản phẩm
        List<FlashSaleReportDto.ProductReportItem> productReports = items.stream().map(i -> {
            int q = i.getTotalStock() != null ? i.getTotalStock() : 0;
            int s = i.getSoldCount() != null ? i.getSoldCount() : 0;
            double str = q > 0 ? ((double) s / q) * 100.0 : 0.0;
            BigDecimal rev = (i.getSalePrice() != null ? i.getSalePrice() : BigDecimal.ZERO).multiply(BigDecimal.valueOf(s));

            String sku = "";
            Integer inv = 0;
            if (i.getProduct() != null && i.getProduct().getVariants() != null && !i.getProduct().getVariants().isEmpty()) {
                ProductVariant v = i.getProduct().getVariants().get(0);
                sku = v.getSku();
                try {
                    inv = inventoryRepository.getAvailableStockByVariantId(v.getVariantId());
                } catch (Exception ignored) {}
            }

            return FlashSaleReportDto.ProductReportItem.builder()
                    .itemId(i.getId())
                    .productId(i.getProduct() != null ? i.getProduct().getProductId() : null)
                    .productName(i.getName())
                    .sku(sku)
                    .imageUrl(i.getImageUrl())
                    .originalPrice(i.getOriginalPrice())
                    .salePrice(i.getSalePrice())
                    .quota(q)
                    .sold(s)
                    .sellThroughRate(Math.round(str * 10.0) / 10.0)
                    .revenue(rev)
                    .availableInventory(inv != null ? inv : 0)
                    .build();
        }).collect(Collectors.toList());

        return FlashSaleReportDto.builder()
                .campaignId(campaignId)
                .campaignTitle(campaign.getTitle())
                .totalSlots(slots.size())
                .totalProducts(items.size())
                .totalQuota(totalQuota)
                .totalSold(totalSold)
                .sellThroughRate(Math.round(sellThroughRate * 10.0) / 10.0)
                .totalRevenue(totalRevenue)
                .cancelledReservations(0)
                .slotReports(slotReports)
                .productReports(productReports)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlashSaleAuditLogDto> getCampaignAuditLogs(Long campaignId) {
        List<FlashSaleAuditLog> logs = auditLogRepository.findByCampaignIdOrderByCreatedAtDesc(campaignId);
        return logs.stream().map(l -> FlashSaleAuditLogDto.builder()
                .id(l.getId())
                .campaignId(l.getCampaignId())
                .action(l.getAction())
                .details(l.getDetails())
                .performedBy(l.getPerformedBy())
                .createdAt(l.getCreatedAt())
                .build()
        ).collect(Collectors.toList());
    }

    // =========================================================
    // CONCURRENCY & PURCHASE
    // =========================================================

    @Override
    @Transactional
    public void validateAndLockFlashSalePurchase(Long itemId, Long customerId, int requestedQty) {
        FlashSaleItem item = itemRepository.findByIdWithLock(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm Flash Sale không tồn tại: " + itemId));

        FlashSaleCampaign campaign = item.getCampaign();
        String pubStatus = campaign != null && campaign.getPublishStatus() != null ? campaign.getPublishStatus() : (campaign != null ? campaign.getStatus() : "");
        if (campaign == null || !Boolean.TRUE.equals(campaign.getIsActive()) || !"ACTIVE".equalsIgnoreCase(pubStatus)) {
            throw new IllegalStateException("Chiến dịch Flash Sale hiện không hoạt động.");
        }

        OffsetDateTime now = OffsetDateTime.now(VN_ZONE);
        FlashSaleTimeSlot slot = item.getTimeSlot();
        if (slot != null) {
            if (now.isBefore(slot.getStartTime()) || now.isAfter(slot.getEndTime())) {
                throw new IllegalStateException("Khung giờ Flash Sale hiện không trong thời gian mở bán.");
            }
        }

        int sold = item.getSoldCount() != null ? item.getSoldCount() : 0;
        int stock = item.getTotalStock() != null ? item.getTotalStock() : 0;

        if (sold + requestedQty > stock) {
            throw new IllegalStateException("Rất tiếc! Số lượng ưu đãi Flash Sale cho sản phẩm này đã được bán hết.");
        }

        if (customerId != null) {
            int purchasedAlready = userPurchaseRepository.sumPurchasedQuantity(itemId, customerId);
            int maxPerUser = item.getMaxQuantityPerUser() != null ? item.getMaxQuantityPerUser() : 1;
            if (purchasedAlready + requestedQty > maxPerUser) {
                throw new IllegalStateException("Bạn đã đạt giới hạn tối đa được mua (" + maxPerUser + " suất) cho ưu đãi Flash Sale này.");
            }
        }
    }

    @Override
    @Transactional
    public void recordFlashSalePurchase(Long itemId, Long customerId, Long orderId, int quantity) {
        FlashSaleItem item = itemRepository.findByIdWithLock(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm Flash Sale không tồn tại: " + itemId));

        item.setSoldCount(item.getSoldCount() + quantity);
        if (item.getSoldCount() >= item.getTotalStock()) {
            item.setStatus("SOLD_OUT");
        }
        itemRepository.save(item);

        if (customerId != null) {
            Customer customer = customerRepository.findById(customerId).orElse(null);
            Order order = orderId != null ? orderRepository.findById(orderId).orElse(null) : null;

            if (customer != null) {
                FlashSaleUserPurchase purchase = FlashSaleUserPurchase.builder()
                        .item(item)
                        .customer(customer)
                        .order(order)
                        .quantity(quantity)
                        .purchasedAt(OffsetDateTime.now(VN_ZONE))
                        .build();
                userPurchaseRepository.save(purchase);
            }
        }
        log.info("Ghi nhận lượt mua Flash Sale thành công: Item #{} +{} suất, đã bán {}/{}", itemId, quantity, item.getSoldCount(), item.getTotalStock());
    }

    // =========================================================
    // MAPPING & HELPER METHODS
    // =========================================================

    private FlashSaleCampaignDto mapToDto(FlashSaleCampaign campaign) {
        List<FlashSaleItemDto> itemDtos = campaign.getProducts() != null ?
                campaign.getProducts().stream()
                        .sorted(Comparator.comparing(FlashSaleItem::getDisplayOrder, Comparator.nullsLast(Comparator.naturalOrder())))
                        .map(this::mapItemToDto)
                        .collect(Collectors.toList()) : new ArrayList<>();

        List<FlashSaleTimeSlotDto> slotDtos = campaign.getTimeSlots() != null ?
                campaign.getTimeSlots().stream()
                        .sorted(Comparator.comparing(FlashSaleTimeSlot::getStartTime, Comparator.nullsLast(Comparator.naturalOrder())))
                        .map(slot -> {
                            FlashSaleTimeSlotDto dto = mapSlotToDto(slot);
                            List<FlashSaleItemDto> slotProducts = itemDtos.stream()
                                    .filter(i -> slot.getId() != null && slot.getId().equals(i.getSlotId()))
                                    .collect(Collectors.toList());
                            dto.setProducts(slotProducts);
                            return dto;
                        }).collect(Collectors.toList()) : new ArrayList<>();

        int totalSold = itemDtos.stream().mapToInt(FlashSaleItemDto::getSoldCount).sum();
        int totalQuota = itemDtos.stream().mapToInt(FlashSaleItemDto::getTotalStock).sum();

        BigDecimal totalRevenue = itemDtos.stream()
                .map(i -> (i.getSalePrice() != null ? i.getSalePrice() : BigDecimal.ZERO).multiply(BigDecimal.valueOf(i.getSoldCount())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        OffsetDateTime now = OffsetDateTime.now(VN_ZONE);
        String runtimeStatus = computeRuntimeStatus(campaign, now);
        String publishStatus = campaign.getPublishStatus() != null ? campaign.getPublishStatus() : (campaign.getStatus() != null ? campaign.getStatus() : "DRAFT");

        OffsetDateTime calculatedStartAt = getEffectiveStart(campaign);
        OffsetDateTime calculatedEndAt = getEffectiveEnd(campaign);

        return FlashSaleCampaignDto.builder()
                .campaignId(campaign.getCampaignId())
                .title(campaign.getTitle())
                .disclaimer(campaign.getDisclaimer())
                .startTime(campaign.getStartTime())
                .endTime(campaign.getEndTime())
                .calculatedStartAt(calculatedStartAt)
                .calculatedEndAt(calculatedEndAt)
                .status(campaign.getStatus())
                .publishStatus(publishStatus)
                .runtimeStatus(runtimeStatus)
                .computedStatus(runtimeStatus)
                .isActive(campaign.getIsActive())
                .createdAt(campaign.getCreatedAt())
                .serverNow(now)
                .version(campaign.getVersion())
                .updatedBy(campaign.getUpdatedBy())
                .timeSlots(slotDtos)
                .products(itemDtos)
                .totalProductsCount(itemDtos.size())
                .totalSoldQuantity(totalSold)
                .totalSlotsCount(slotDtos.size())
                .totalQuota(totalQuota)
                .totalRevenue(totalRevenue)
                .build();
    }

    private FlashSaleTimeSlotDto mapSlotToDto(FlashSaleTimeSlot slot) {
        OffsetDateTime now = OffsetDateTime.now(VN_ZONE);
        String status = getSlotStatus(slot, now);

        boolean isOvernight = false;
        if (slot.getStartTime() != null && slot.getEndTime() != null) {
            isOvernight = slot.getStartTime().toLocalDate().isBefore(slot.getEndTime().toLocalDate());
        }

        List<FlashSaleItem> slotItems = slot.getId() != null ? itemRepository.findByTimeSlotId(slot.getId()) : Collections.emptyList();
        int productCount = slotItems.size();
        int totalSold = slotItems.stream().mapToInt(i -> i.getSoldCount() != null ? i.getSoldCount() : 0).sum();
        int totalQuota = slotItems.stream().mapToInt(i -> i.getTotalStock() != null ? i.getTotalStock() : 0).sum();
        BigDecimal revenue = slotItems.stream()
                .map(i -> (i.getSalePrice() != null ? i.getSalePrice() : BigDecimal.ZERO).multiply(BigDecimal.valueOf(i.getSoldCount() != null ? i.getSoldCount() : 0)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return FlashSaleTimeSlotDto.builder()
                .id(slot.getId())
                .campaignId(slot.getCampaign() != null ? slot.getCampaign().getCampaignId() : null)
                .label(slot.getLabel())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .isActive(slot.getIsActive())
                .status(status)
                .isOvernight(isOvernight)
                .productCount(productCount)
                .totalSold(totalSold)
                .totalQuota(totalQuota)
                .revenue(revenue)
                .version(slot.getVersion())
                .build();
    }

    private FlashSaleItemDto mapItemToDto(FlashSaleItem item) {
        double progress = 0.0;
        if (item.getTotalStock() != null && item.getTotalStock() > 0) {
            int sold = item.getSoldCount() != null ? item.getSoldCount() : 0;
            progress = Math.min(100.0, ((double) sold / item.getTotalStock()) * 100.0);
        }

        String slug = "";
        Long prodId = null;
        String sku = "";
        Integer availableInv = 0;

        if (item.getProduct() != null) {
            slug = item.getProduct().getSlug();
            prodId = item.getProduct().getProductId();
            if (item.getProduct().getVariants() != null && !item.getProduct().getVariants().isEmpty()) {
                ProductVariant v = item.getProduct().getVariants().get(0);
                sku = v.getSku();
                try {
                    availableInv = inventoryRepository.getAvailableStockByVariantId(v.getVariantId());
                } catch (Exception ignored) {}
            }
        }

        return FlashSaleItemDto.builder()
                .id(item.getId())
                .campaignId(item.getCampaign() != null ? item.getCampaign().getCampaignId() : null)
                .slotId(item.getTimeSlot() != null ? item.getTimeSlot().getId() : null)
                .productId(prodId)
                .productSlug(slug)
                .name(item.getName())
                .sku(sku)
                .imageUrl(item.getImageUrl())
                .originalPrice(item.getOriginalPrice())
                .salePrice(item.getSalePrice())
                .discountPercent(item.getDiscountPercent())
                .soldCount(item.getSoldCount() != null ? item.getSoldCount() : 0)
                .totalStock(item.getTotalStock() != null ? item.getTotalStock() : 10)
                .maxQuantityPerUser(item.getMaxQuantityPerUser() != null ? item.getMaxQuantityPerUser() : 1)
                .status(item.getStatus())
                .progressPercent(progress)
                .displayOrder(item.getDisplayOrder() != null ? item.getDisplayOrder() : 0)
                .availableInventory(availableInv != null ? availableInv : 0)
                .version(item.getVersion())
                .build();
    }

    private String computeRuntimeStatus(FlashSaleCampaign campaign, OffsetDateTime now) {
        List<FlashSaleTimeSlot> slots = campaign.getTimeSlots();
        if (slots == null || slots.isEmpty()) {
            return "NO_SLOT";
        }

        List<OffsetDateTime> starts = slots.stream().map(FlashSaleTimeSlot::getStartTime).filter(Objects::nonNull).toList();
        List<OffsetDateTime> ends = slots.stream().map(FlashSaleTimeSlot::getEndTime).filter(Objects::nonNull).toList();

        if (starts.isEmpty() || ends.isEmpty()) {
            return "NO_SLOT";
        }

        OffsetDateTime minStart = Collections.min(starts);
        OffsetDateTime maxEnd = Collections.max(ends);

        if (now.isBefore(minStart)) {
            return "UPCOMING";
        }

        boolean hasLiveSlot = slots.stream().anyMatch(s ->
                s.getStartTime() != null && s.getEndTime() != null &&
                !now.isBefore(s.getStartTime()) && !now.isAfter(s.getEndTime())
        );
        if (hasLiveSlot) {
            return "RUNNING";
        }

        boolean hasUpcomingSlot = slots.stream().anyMatch(s ->
                s.getStartTime() != null && now.isBefore(s.getStartTime())
        );
        if (hasUpcomingSlot) {
            return "WAITING_NEXT";
        }

        if (now.isAfter(maxEnd)) {
            return "ENDED";
        }

        return "ENDED";
    }

    private String getSlotStatus(FlashSaleTimeSlot slot, OffsetDateTime now) {
        if (slot.getStartTime() == null || slot.getEndTime() == null) return "upcoming";
        if (now.isBefore(slot.getStartTime())) return "upcoming";
        if (!now.isAfter(slot.getEndTime())) return "live";
        return "ended";
    }

    private OffsetDateTime getEffectiveStart(FlashSaleCampaign campaign) {
        if (campaign.getTimeSlots() != null && !campaign.getTimeSlots().isEmpty()) {
            return campaign.getTimeSlots().stream()
                    .map(FlashSaleTimeSlot::getStartTime)
                    .filter(Objects::nonNull)
                    .min(Comparator.naturalOrder())
                    .orElse(campaign.getStartTime());
        }
        return campaign.getStartTime();
    }

    private OffsetDateTime getEffectiveEnd(FlashSaleCampaign campaign) {
        if (campaign.getTimeSlots() != null && !campaign.getTimeSlots().isEmpty()) {
            return campaign.getTimeSlots().stream()
                    .map(FlashSaleTimeSlot::getEndTime)
                    .filter(Objects::nonNull)
                    .max(Comparator.naturalOrder())
                    .orElse(campaign.getEndTime());
        }
        return campaign.getEndTime();
    }

    private void validateSlotTimes(OffsetDateTime startTime, OffsetDateTime endTime) {
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("Thời gian bắt đầu và kết thúc khung giờ không được để trống.");
        }
        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("Thời gian kết thúc khung giờ phải sau thời gian bắt đầu.");
        }
    }

    private String generateSlotLabel(OffsetDateTime start, OffsetDateTime end) {
        return String.format("%02d-%02dh %02d/%02d",
                start.getHour(), end.getHour(), start.getDayOfMonth(), start.getMonthValue());
    }

    private BigDecimal resolveProductOriginalPrice(Product product, BigDecimal fallbackSalePrice) {
        BigDecimal price = BigDecimal.ZERO;
        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            price = product.getVariants().get(0).getSalePrice();
        }
        if (price == null || price.compareTo(BigDecimal.ZERO) == 0) {
            if (fallbackSalePrice != null && fallbackSalePrice.compareTo(BigDecimal.ZERO) > 0) {
                price = fallbackSalePrice.multiply(new BigDecimal("1.25")).setScale(0, RoundingMode.HALF_UP);
            } else {
                price = new BigDecimal("1000000");
            }
        }
        return price;
    }

    private String resolveProductImage(Product product) {
        if (product != null && product.getImages() != null && !product.getImages().isEmpty()) {
            return product.getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .map(ProductImage::getUrl)
                    .findFirst()
                    .orElse(product.getImages().get(0).getUrl());
        }
        return "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80";
    }

    private String getCurrentUsername() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null && !auth.getName().isBlank()) {
                return auth.getName();
            }
        } catch (Exception ignored) {}
        return "Admin";
    }

    private void logAudit(Long campaignId, String action, String details) {
        if (campaignId == null) return;
        try {
            FlashSaleAuditLog audit = FlashSaleAuditLog.builder()
                    .campaignId(campaignId)
                    .action(action)
                    .details(details)
                    .performedBy(getCurrentUsername())
                    .createdAt(OffsetDateTime.now(VN_ZONE))
                    .build();
            auditLogRepository.save(audit);
        } catch (Exception e) {
            log.warn("Không thể lưu FlashSaleAuditLog: {}", e.getMessage());
        }
    }

    // =========================================================
    // LEGACY / MULTI-SLOT COMPATIBILITY
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public FlashSaleSlotsResponseDto getModernSlots() {
        OffsetDateTime serverTime = OffsetDateTime.now(VN_ZONE);
        List<FlashSaleSlot> slots = slotRepository.findAllByIsActiveTrueOrderByStartAtAsc();

        List<FlashSaleSlotDto> slotDtos = slots.stream().map(slot -> {
            String status;
            if (serverTime.isBefore(slot.getStartAt())) {
                status = "upcoming";
            } else if (serverTime.isAfter(slot.getEndAt())) {
                status = "ended";
            } else {
                status = "live";
            }

            return FlashSaleSlotDto.builder()
                    .id(slot.getId())
                    .startAt(slot.getStartAt())
                    .endAt(slot.getEndAt())
                    .status(status)
                    .build();
        }).collect(Collectors.toList());

        return FlashSaleSlotsResponseDto.builder()
                .serverTime(serverTime)
                .slots(slotDtos)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlashSaleProductDto> getProductsBySlotId(Long slotId) {
        List<FlashSaleSlotProduct> slotProducts = slotProductRepository.findBySlotIdWithProduct(slotId);

        return slotProducts.stream().map(sp -> {
            Product product = sp.getProduct();
            String imageUrl = resolveProductImage(product);
            int sold = sp.getSold() != null ? sp.getSold() : 0;
            int quota = sp.getQuota() != null ? sp.getQuota() : 0;
            int remaining = Math.max(0, quota - sold);

            return FlashSaleProductDto.builder()
                    .productId(product != null ? product.getProductId() : null)
                    .name(product != null ? product.getName() : "Sản phẩm Flash Sale")
                    .image(imageUrl)
                    .salePrice(sp.getSalePrice())
                    .originalPrice(sp.getOriginalPrice())
                    .quota(quota)
                    .sold(sold)
                    .remaining(remaining)
                    .slug(product != null ? product.getSlug() : "")
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminSlotDto> getAdminSlots() {
        List<FlashSaleSlot> slots = slotRepository.findAll(
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "startAt"));
        return slots.stream().map(this::mapToAdminSlotDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AdminSlotDto getAdminSlotById(Long slotId) {
        FlashSaleSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khung giờ Flash Sale: " + slotId));
        return mapToAdminSlotDtoWithProducts(slot);
    }

    @Override
    @Transactional
    public AdminSlotDto createSlot(CreateSlotRequest request) {
        if (!request.getEndAt().isAfter(request.getStartAt())) {
            throw new IllegalArgumentException("Thời gian kết thúc phải sau thời gian bắt đầu.");
        }
        List<FlashSaleSlot> allSlots = slotRepository.findAll();
        for (FlashSaleSlot existing : allSlots) {
            if (slotsOverlap(request.getStartAt(), request.getEndAt(), existing.getStartAt(), existing.getEndAt())) {
                throw new IllegalArgumentException("Khung giờ bị chồng lấn với slot hiện có (" + existing.getStartAt() + " - " + existing.getEndAt() + ").");
            }
        }
        FlashSaleSlot slot = FlashSaleSlot.builder()
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .createdAt(OffsetDateTime.now(VN_ZONE))
                .build();
        FlashSaleSlot saved = slotRepository.save(slot);
        return mapToAdminSlotDtoWithProducts(saved);
    }

    @Override
    @Transactional
    public AdminSlotDto updateSlot(Long slotId, CreateSlotRequest request) {
        FlashSaleSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khung giờ Flash Sale: " + slotId));
        if (!request.getEndAt().isAfter(request.getStartAt())) {
            throw new IllegalArgumentException("Thời gian kết thúc phải sau thời gian bắt đầu.");
        }
        List<FlashSaleSlot> allSlots = slotRepository.findAll();
        for (FlashSaleSlot existing : allSlots) {
            if (existing.getId().equals(slotId)) continue;
            if (slotsOverlap(request.getStartAt(), request.getEndAt(), existing.getStartAt(), existing.getEndAt())) {
                throw new IllegalArgumentException("Khung giờ bị chồng lấn với slot hiện có (" + existing.getStartAt() + " - " + existing.getEndAt() + ").");
            }
        }
        slot.setStartAt(request.getStartAt());
        slot.setEndAt(request.getEndAt());
        if (request.getIsActive() != null) slot.setIsActive(request.getIsActive());
        FlashSaleSlot saved = slotRepository.save(slot);
        return mapToAdminSlotDtoWithProducts(saved);
    }

    @Override
    @Transactional
    public void deleteSlot(Long slotId) {
        FlashSaleSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khung giờ Flash Sale: " + slotId));
        if (slot.getProducts() != null && !slot.getProducts().isEmpty()) {
            throw new IllegalArgumentException("Không thể xóa khung giờ đang có " + slot.getProducts().size() + " sản phẩm. Hãy gỡ sản phẩm trước.");
        }
        slotRepository.delete(slot);
    }

    @Override
    @Transactional
    public AdminSlotProductDto addProductToSlot(Long slotId, AddSlotProductRequest request) {
        FlashSaleSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khung giờ Flash Sale: " + slotId));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm: " + request.getProductId()));

        boolean exists = slotProductRepository.findBySlotIdAndProductProductId(slotId, request.getProductId()).isPresent();
        if (exists) {
            throw new IllegalArgumentException("Sản phẩm '" + product.getName() + "' đã có trong khung giờ này.");
        }

        if (request.getSalePrice() >= request.getOriginalPrice()) {
            throw new IllegalArgumentException("Giá Flash Sale phải thấp hơn giá gốc.");
        }

        FlashSaleSlotProduct sp = FlashSaleSlotProduct.builder()
                .slot(slot)
                .product(product)
                .salePrice(request.getSalePrice())
                .originalPrice(request.getOriginalPrice())
                .quota(request.getQuota())
                .sold(0)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();
        FlashSaleSlotProduct saved = slotProductRepository.save(sp);
        return mapToAdminSlotProductDto(saved);
    }

    @Override
    @Transactional
    public AdminSlotProductDto updateSlotProduct(Long productEntryId, AddSlotProductRequest request) {
        FlashSaleSlotProduct sp = slotProductRepository.findById(productEntryId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm trong khung giờ: " + productEntryId));

        if (request.getSalePrice() != null) {
            long origPrice = request.getOriginalPrice() != null ? request.getOriginalPrice() : sp.getOriginalPrice();
            if (request.getSalePrice() >= origPrice) {
                throw new IllegalArgumentException("Giá Flash Sale phải thấp hơn giá gốc.");
            }
            sp.setSalePrice(request.getSalePrice());
        }
        if (request.getOriginalPrice() != null) sp.setOriginalPrice(request.getOriginalPrice());
        if (request.getQuota() != null) {
            if (request.getQuota() < sp.getSold()) {
                throw new IllegalArgumentException("Số lượng không được nhỏ hơn số đã bán (" + sp.getSold() + ").");
            }
            sp.setQuota(request.getQuota());
        }
        if (request.getSortOrder() != null) sp.setSortOrder(request.getSortOrder());

        FlashSaleSlotProduct saved = slotProductRepository.save(sp);
        return mapToAdminSlotProductDto(saved);
    }

    @Override
    @Transactional
    public void removeSlotProduct(Long productEntryId) {
        FlashSaleSlotProduct sp = slotProductRepository.findById(productEntryId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm trong khung giờ: " + productEntryId));
        if (sp.getSold() != null && sp.getSold() > 0) {
            throw new IllegalArgumentException("Không thể xóa sản phẩm đã có " + sp.getSold() + " lượt mua.");
        }
        slotProductRepository.delete(sp);
    }

    private boolean slotsOverlap(OffsetDateTime s1, OffsetDateTime e1, OffsetDateTime s2, OffsetDateTime e2) {
        return s1.isBefore(e2) && e1.isAfter(s2);
    }

    private AdminSlotDto mapToAdminSlotDto(FlashSaleSlot slot) {
        OffsetDateTime now = OffsetDateTime.now(VN_ZONE);
        String status;
        if (now.isBefore(slot.getStartAt())) status = "upcoming";
        else if (now.isAfter(slot.getEndAt())) status = "ended";
        else status = "live";

        int productCount = slot.getProducts() != null ? slot.getProducts().size() : 0;
        int totalSold = slot.getProducts() != null ? slot.getProducts().stream().mapToInt(sp -> sp.getSold() != null ? sp.getSold() : 0).sum() : 0;
        int totalQuota = slot.getProducts() != null ? slot.getProducts().stream().mapToInt(sp -> sp.getQuota() != null ? sp.getQuota() : 0).sum() : 0;

        return AdminSlotDto.builder()
                .id(slot.getId())
                .startAt(slot.getStartAt())
                .endAt(slot.getEndAt())
                .isActive(slot.getIsActive())
                .status(status)
                .productCount(productCount)
                .totalSold(totalSold)
                .totalQuota(totalQuota)
                .build();
    }

    private AdminSlotDto mapToAdminSlotDtoWithProducts(FlashSaleSlot slot) {
        AdminSlotDto dto = mapToAdminSlotDto(slot);
        List<AdminSlotProductDto> products = slot.getProducts() != null ?
                slot.getProducts().stream().map(this::mapToAdminSlotProductDto).collect(Collectors.toList())
                : new ArrayList<>();
        dto.setProducts(products);
        return dto;
    }

    private AdminSlotProductDto mapToAdminSlotProductDto(FlashSaleSlotProduct sp) {
        Product product = sp.getProduct();
        String imageUrl = resolveProductImage(product);
        return AdminSlotProductDto.builder()
                .id(sp.getId())
                .productId(product != null ? product.getProductId() : null)
                .name(product != null ? product.getName() : "")
                .image(imageUrl)
                .slug(product != null ? product.getSlug() : "")
                .salePrice(sp.getSalePrice())
                .originalPrice(sp.getOriginalPrice())
                .quota(sp.getQuota())
                .sold(sp.getSold())
                .sortOrder(sp.getSortOrder())
                .build();
    }

    @Override
    @Transactional
    public FlashSaleCheckoutResponse checkoutSlotProduct(FlashSaleCheckoutRequest request) {
        FlashSaleSlot slot = slotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new IllegalArgumentException("Khung giờ Flash Sale không tồn tại: " + request.getSlotId()));

        if (!Boolean.TRUE.equals(slot.getIsActive())) {
            return FlashSaleCheckoutResponse.builder()
                    .code("SLOT_NOT_LIVE")
                    .message("Khung giờ Flash Sale hiện không hoạt động.")
                    .build();
        }

        OffsetDateTime now = OffsetDateTime.now(VN_ZONE);
        if (now.isBefore(slot.getStartAt()) || now.isAfter(slot.getEndAt())) {
            return FlashSaleCheckoutResponse.builder()
                    .code("SLOT_NOT_LIVE")
                    .message("Khung giờ Flash Sale hiện không trong thời gian mở bán.")
                    .build();
        }

        boolean alreadyPurchased = purchaseRepository.existsBySlotIdAndProductIdAndPhone(
                request.getSlotId(), request.getProductId(), request.getPhone());
        if (alreadyPurchased) {
            return FlashSaleCheckoutResponse.builder()
                    .code("ALREADY_PURCHASED")
                    .message("Mỗi số điện thoại chỉ được mua tối đa 1 sản phẩm trong khung giờ này.")
                    .build();
        }

        FlashSaleSlotProduct slotProduct = slotProductRepository.findBySlotIdAndProductIdWithLock(
                request.getSlotId(), request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không thuộc khung giờ Flash Sale này."));

        int sold = slotProduct.getSold() != null ? slotProduct.getSold() : 0;
        int quota = slotProduct.getQuota() != null ? slotProduct.getQuota() : 0;

        if (sold >= quota) {
            return FlashSaleCheckoutResponse.builder()
                    .code("SOLD_OUT")
                    .message("Rất tiếc! Số lượng suất ưu đãi cho sản phẩm này đã được bán hết.")
                    .build();
        }

        slotProduct.setSold(sold + 1);
        slotProductRepository.save(slotProduct);

        FlashSalePurchase purchase = FlashSalePurchase.builder()
                .slot(slot)
                .product(slotProduct.getProduct())
                .phone(request.getPhone())
                .createdAt(OffsetDateTime.now(VN_ZONE))
                .build();
        purchase = purchaseRepository.save(purchase);

        int remaining = Math.max(0, quota - (sold + 1));
        log.info("Đặt mua Flash Sale thành công: Slot #{} Product #{} Phone {} - Còn lại {}/{}",
                request.getSlotId(), request.getProductId(), request.getPhone(), remaining, quota);

        return FlashSaleCheckoutResponse.builder()
                .code("SUCCESS")
                .message("Đặt mua ưu đãi Flash Sale thành công!")
                .purchaseId(purchase.getId())
                .productId(slotProduct.getProduct().getProductId())
                .productName(slotProduct.getProduct().getName())
                .salePrice(slotProduct.getSalePrice())
                .remaining(remaining)
                .build();
    }
}
