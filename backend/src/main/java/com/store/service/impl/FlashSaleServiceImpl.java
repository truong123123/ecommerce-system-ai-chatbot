package com.store.service.impl;

import com.store.dto.flashsale.*;
import com.store.entity.*;
import com.store.repository.*;
import com.store.service.FlashSaleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
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

    @Override
    @Transactional(readOnly = true)
    public FlashSaleCampaignDto getActiveCampaign() {
        OffsetDateTime now = OffsetDateTime.now();
        List<FlashSaleCampaign> allActive = campaignRepository.findAll().stream()
                .filter(c -> Boolean.TRUE.equals(c.getIsActive()) && !"INACTIVE".equalsIgnoreCase(c.getStatus()) && !"DRAFT".equalsIgnoreCase(c.getStatus()))
                .filter(c -> c.getProducts() != null && !c.getProducts().isEmpty())
                .collect(Collectors.toList());

        if (allActive.isEmpty()) {
            return null;
        }

        // Ưu tiên (a): Đang diễn ra và có ít nhất 1 sản phẩm còn suất mua
        Optional<FlashSaleCampaign> ongoingWithStock = allActive.stream()
                .filter(c -> c.getStartTime() != null && c.getEndTime() != null
                        && !now.isBefore(c.getStartTime()) && !now.isAfter(c.getEndTime()))
                .filter(c -> c.getProducts().stream().anyMatch(i -> {
                    int total = i.getTotalStock() != null ? i.getTotalStock() : 0;
                    int sold = i.getSoldCount() != null ? i.getSoldCount() : 0;
                    return (total - sold) > 0;
                }))
                .min(Comparator.comparing(FlashSaleCampaign::getEndTime));

        if (ongoingWithStock.isPresent()) {
            return mapToDto(ongoingWithStock.get());
        }

        // Ưu tiên (b): Chiến dịch sắp diễn ra gần nhất có sản phẩm
        Optional<FlashSaleCampaign> upcoming = allActive.stream()
                .filter(c -> c.getStartTime() != null && now.isBefore(c.getStartTime()))
                .min(Comparator.comparing(FlashSaleCampaign::getStartTime));

        if (upcoming.isPresent()) {
            return mapToDto(upcoming.get());
        }

        // Ưu tiên (c): Không có chiến dịch phù hợp -> trả về null để trang chủ ẩn
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

    @Override
    @Transactional(readOnly = true)
    public List<FlashSaleCampaignDto> getAdminCampaigns() {
        return campaignRepository.findAll().stream()
                .sorted(Comparator.comparing(FlashSaleCampaign::getCreatedAt).reversed())
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FlashSaleCampaignDto createCampaign(CreateFlashSaleRequest request) {
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("Thời gian kết thúc phải sau thời gian bắt đầu.");
        }

        FlashSaleCampaign campaign = FlashSaleCampaign.builder()
                .title(request.getTitle())
                .disclaimer(request.getDisclaimer() != null ? request.getDisclaimer() : "")
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .isActive(!"INACTIVE".equalsIgnoreCase(request.getStatus()))
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        FlashSaleCampaign saved = campaignRepository.save(campaign);

        if (request.getTimeSlots() != null && !request.getTimeSlots().isEmpty()) {
            for (CreateFlashSaleRequest.TimeSlotInput slotInput : request.getTimeSlots()) {
                FlashSaleTimeSlot slot = FlashSaleTimeSlot.builder()
                        .campaign(saved)
                        .label(slotInput.getLabel())
                        .startTime(slotInput.getStartTime())
                        .endTime(slotInput.getEndTime())
                        .isActive(Boolean.TRUE.equals(slotInput.getIsActive()))
                        .build();
                saved.getTimeSlots().add(slot);
            }
            saved = campaignRepository.save(saved);
        }

        return mapToDto(saved);
    }

    @Override
    @Transactional
    public FlashSaleCampaignDto updateCampaign(Long id, CreateFlashSaleRequest request) {
        FlashSaleCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chiến dịch: " + id));

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("Thời gian kết thúc phải sau thời gian bắt đầu.");
        }

        campaign.setTitle(request.getTitle());
        if (request.getDisclaimer() != null) {
            campaign.setDisclaimer(request.getDisclaimer());
        }
        campaign.setStartTime(request.getStartTime());
        campaign.setEndTime(request.getEndTime());
        if (request.getStatus() != null) {
            campaign.setStatus(request.getStatus());
            campaign.setIsActive(!"INACTIVE".equalsIgnoreCase(request.getStatus()));
        }
        campaign.setUpdatedAt(OffsetDateTime.now());

        FlashSaleCampaign saved = campaignRepository.save(campaign);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public void updateCampaignStatus(Long id, String status) {
        FlashSaleCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chiến dịch: " + id));

        campaign.setStatus(status.toUpperCase());
        campaign.setIsActive(!"INACTIVE".equalsIgnoreCase(status));
        campaign.setUpdatedAt(OffsetDateTime.now());
        campaignRepository.save(campaign);
    }

    @Override
    @Transactional
    public void deleteCampaign(Long id) {
        FlashSaleCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chiến dịch: " + id));

        // Kiểm tra an toàn: nếu đã có item phát sinh lượt mua -> chuyển status sang INACTIVE thay vì xóa cứng
        boolean hasPurchases = campaign.getProducts().stream()
                .anyMatch(p -> p.getSoldCount() != null && p.getSoldCount() > 0);

        if (hasPurchases) {
            campaign.setStatus("INACTIVE");
            campaign.setIsActive(false);
            campaignRepository.save(campaign);
            log.info("Chiến dịch #{} đã có đơn hàng mua, chuyển sang INACTIVE thay vì xoá cứng.", id);
        } else {
            campaignRepository.delete(campaign);
        }
    }

    @Override
    @Transactional
    public FlashSaleItemDto addItemToCampaign(Long campaignId, AddFlashSaleItemRequest request) {
        FlashSaleCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chiến dịch: " + campaignId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm: " + request.getProductId()));

        if (request.getSlotId() == null) {
            throw new IllegalArgumentException("Khung giờ (slotId) là bắt buộc khi thêm sản phẩm vào chiến dịch Flash Sale.");
        }

        FlashSaleTimeSlot slot = timeSlotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khung giờ có ID: " + request.getSlotId()));

        if (slot.getCampaign() == null || !slot.getCampaign().getCampaignId().equals(campaignId)) {
            throw new IllegalArgumentException("Khung giờ #" + request.getSlotId() + " không thuộc chiến dịch Flash Sale #" + campaignId);
        }

        // Kiểm tra trùng sản phẩm trong cùng khung giờ
        boolean existsInSlot = itemRepository.findByTimeSlotId(slot.getId()).stream()
                .anyMatch(p -> p.getProduct() != null && p.getProduct().getProductId().equals(product.getProductId()));
        if (existsInSlot) {
            throw new IllegalArgumentException("Sản phẩm '" + product.getName() + "' đã có trong khung giờ này.");
        }

        // Lấy giá gốc từ sản phẩm
        BigDecimal originalPrice = BigDecimal.ZERO;
        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            originalPrice = product.getVariants().get(0).getSalePrice();
        }
        if (originalPrice == null || originalPrice.compareTo(BigDecimal.ZERO) == 0) {
            originalPrice = request.getSalePrice().multiply(new BigDecimal("1.25")).setScale(0, RoundingMode.HALF_UP);
        }

        if (request.getSalePrice().compareTo(originalPrice) >= 0) {
            throw new IllegalArgumentException("Giá Flash Sale (" + request.getSalePrice() + ") phải thấp hơn giá gốc (" + originalPrice + ").");
        }

        int discountPercent = originalPrice.subtract(request.getSalePrice())
                .divide(originalPrice, 2, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .intValue();

        String imageUrl = "";
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            imageUrl = product.getImages().get(0).getUrl();
        }

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
                .build();

        FlashSaleItem saved = itemRepository.save(item);
        return mapItemToDto(saved);
    }

    @Override
    @Transactional
    public FlashSaleItemDto updateCampaignItem(Long itemId, UpdateFlashSaleItemRequest request) {
        FlashSaleItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm Flash Sale: " + itemId));

        if (request.getSalePrice() != null) {
            if (request.getSalePrice().compareTo(item.getOriginalPrice()) >= 0) {
                throw new IllegalArgumentException("Giá Flash Sale phải thấp hơn giá gốc.");
            }
            item.setSalePrice(request.getSalePrice());
            int discountPercent = item.getOriginalPrice().subtract(request.getSalePrice())
                    .divide(item.getOriginalPrice(), 2, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .intValue();
            item.setDiscountPercent(discountPercent);
        }

        if (request.getTotalStock() != null) {
            if (request.getTotalStock() < item.getSoldCount()) {
                throw new IllegalArgumentException("Tổng số lượng không được nhỏ hơn số lượng đã bán (" + item.getSoldCount() + ").");
            }
            item.setTotalStock(request.getTotalStock());
            if (item.getSoldCount() >= item.getTotalStock()) {
                item.setStatus("SOLD_OUT");
            } else {
                item.setStatus("AVAILABLE");
            }
        }

        if (request.getMaxQuantityPerUser() != null) {
            item.setMaxQuantityPerUser(request.getMaxQuantityPerUser());
        }

        if (request.getSlotId() != null) {
            FlashSaleTimeSlot slot = timeSlotRepository.findById(request.getSlotId()).orElse(null);
            item.setTimeSlot(slot);
        }

        FlashSaleItem saved = itemRepository.save(item);
        return mapItemToDto(saved);
    }

    @Override
    @Transactional
    public void removeItemFromCampaign(Long itemId) {
        itemRepository.deleteById(itemId);
    }

    @Override
    @Transactional
    public FlashSaleTimeSlotDto addSlotToCampaign(Long campaignId, CreateFlashSaleSlotRequest request) {
        FlashSaleCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chiến dịch: " + campaignId));

        validateSlotTimes(campaign, request.getStartTime(), request.getEndTime(), null);

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
        return mapSlotToDto(saved);
    }

    @Override
    @Transactional
    public FlashSaleTimeSlotDto updateCampaignSlot(Long campaignId, Long slotId, CreateFlashSaleSlotRequest request) {
        FlashSaleCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chiến dịch: " + campaignId));

        FlashSaleTimeSlot slot = timeSlotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khung giờ: " + slotId));

        if (slot.getCampaign() == null || !slot.getCampaign().getCampaignId().equals(campaignId)) {
            throw new IllegalArgumentException("Khung giờ #" + slotId + " không thuộc chiến dịch #" + campaignId);
        }

        validateSlotTimes(campaign, request.getStartTime(), request.getEndTime(), slotId);

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
        return mapSlotToDto(saved);
    }

    @Override
    @Transactional
    public void deleteCampaignSlot(Long campaignId, Long slotId) {
        FlashSaleCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chiến dịch: " + campaignId));

        FlashSaleTimeSlot slot = timeSlotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khung giờ: " + slotId));

        if (slot.getCampaign() == null || !slot.getCampaign().getCampaignId().equals(campaignId)) {
            throw new IllegalArgumentException("Khung giờ #" + slotId + " không thuộc chiến dịch #" + campaignId);
        }

        // Validate: Không cho xóa slot đã có sản phẩm nếu chưa gỡ sản phẩm
        List<FlashSaleItem> itemsInSlot = itemRepository.findByTimeSlotId(slotId);
        if (!itemsInSlot.isEmpty()) {
            throw new IllegalArgumentException("Không thể xóa khung giờ đang có " + itemsInSlot.size() + " sản phẩm. Vui lòng gỡ hoặc chuyển sản phẩm sang khung giờ khác trước khi xóa.");
        }

        timeSlotRepository.delete(slot);
    }

    private void validateSlotTimes(FlashSaleCampaign campaign, OffsetDateTime startTime, OffsetDateTime endTime, Long currentSlotId) {
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("Thời gian bắt đầu và kết thúc khung giờ không được để trống.");
        }
        // 1. Validate: end > start
        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("Thời gian kết thúc khung giờ phải sau thời gian bắt đầu.");
        }

        // 2. Validate: slot nằm trong khoảng thời gian của campaign
        if (campaign.getStartTime() != null && startTime.isBefore(campaign.getStartTime())) {
            throw new IllegalArgumentException("Khung giờ không được bắt đầu trước thời gian bắt đầu chiến dịch (" + campaign.getStartTime() + ").");
        }
        if (campaign.getEndTime() != null && endTime.isAfter(campaign.getEndTime())) {
            throw new IllegalArgumentException("Khung giờ không được kết thúc sau thời gian kết thúc chiến dịch (" + campaign.getEndTime() + ").");
        }

        // 3. Validate: các slot trong cùng campaign không chồng lấn
        List<FlashSaleTimeSlot> existingSlots = timeSlotRepository.findByCampaignCampaignIdOrderByStartTimeAsc(campaign.getCampaignId());
        for (FlashSaleTimeSlot other : existingSlots) {
            if (currentSlotId != null && other.getId().equals(currentSlotId)) {
                continue;
            }
            boolean overlap = startTime.isBefore(other.getEndTime()) && endTime.isAfter(other.getStartTime());
            if (overlap) {
                throw new IllegalArgumentException("Khung giờ bị chồng lấn thời gian với khung giờ đã có: '" + other.getLabel() + "' (" + other.getStartTime() + " đến " + other.getEndTime() + ").");
            }
        }
    }

    private String generateSlotLabel(OffsetDateTime start, OffsetDateTime end) {
        return String.format("%02d-%02dh %02d/%02d",
                start.getHour(), end.getHour(), start.getDayOfMonth(), start.getMonthValue());
    }

    @Override
    @Transactional
    public void validateAndLockFlashSalePurchase(Long itemId, Long customerId, int requestedQty) {
        // Áp dụng Khóa Bi Quan (Pessimistic Lock) ngăn chặn Race Condition khi nhiều user đặt mua cùng một lúc
        FlashSaleItem item = itemRepository.findByIdWithLock(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm Flash Sale không tồn tại: " + itemId));

        FlashSaleCampaign campaign = item.getCampaign();
        if (campaign == null || !Boolean.TRUE.equals(campaign.getIsActive()) || !"ACTIVE".equalsIgnoreCase(campaign.getStatus())) {
            throw new IllegalStateException("Chiến dịch Flash Sale hiện không hoạt động.");
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (campaign.getStartTime() != null && now.isBefore(campaign.getStartTime())) {
            throw new IllegalStateException("Chương trình Flash Sale chưa bắt đầu.");
        }
        if (campaign.getEndTime() != null && now.isAfter(campaign.getEndTime())) {
            throw new IllegalStateException("Chương trình Flash Sale đã kết thúc.");
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
                        .purchasedAt(OffsetDateTime.now())
                        .build();
                userPurchaseRepository.save(purchase);
            }
        }
        log.info("Ghi nhận lượt mua Flash Sale thành công: Item #{} +{} suất, đã bán {}/{}", itemId, quantity, item.getSoldCount(), item.getTotalStock());
    }

    private FlashSaleCampaignDto mapToDto(FlashSaleCampaign campaign) {
        List<FlashSaleTimeSlotDto> slotDtos = campaign.getTimeSlots() != null ?
                campaign.getTimeSlots().stream().map(this::mapSlotToDto).collect(Collectors.toList()) : new ArrayList<>();

        List<FlashSaleItemDto> itemDtos = campaign.getProducts() != null ?
                campaign.getProducts().stream().map(this::mapItemToDto).collect(Collectors.toList()) : new ArrayList<>();

        int totalSold = itemDtos.stream().mapToInt(FlashSaleItemDto::getSoldCount).sum();

        OffsetDateTime now = OffsetDateTime.now();
        String computedStatus;
        if (Boolean.FALSE.equals(campaign.getIsActive()) || "INACTIVE".equalsIgnoreCase(campaign.getStatus())) {
            computedStatus = "INACTIVE";
        } else if ("DRAFT".equalsIgnoreCase(campaign.getStatus())) {
            computedStatus = "DRAFT";
        } else if (campaign.getStartTime() != null && now.isBefore(campaign.getStartTime())) {
            computedStatus = "UPCOMING";
        } else if (campaign.getEndTime() != null && now.isAfter(campaign.getEndTime())) {
            computedStatus = "ENDED";
        } else {
            computedStatus = "ACTIVE";
        }

        return FlashSaleCampaignDto.builder()
                .campaignId(campaign.getCampaignId())
                .title(campaign.getTitle())
                .disclaimer(campaign.getDisclaimer())
                .startTime(campaign.getStartTime())
                .endTime(campaign.getEndTime())
                .status(campaign.getStatus())
                .computedStatus(computedStatus)
                .isActive(campaign.getIsActive())
                .createdAt(campaign.getCreatedAt())
                .serverNow(now)
                .timeSlots(slotDtos)
                .products(itemDtos)
                .totalProductsCount(itemDtos.size())
                .totalSoldQuantity(totalSold)
                .totalSlotsCount(slotDtos.size())
                .build();
    }

    private FlashSaleTimeSlotDto mapSlotToDto(FlashSaleTimeSlot slot) {
        OffsetDateTime now = OffsetDateTime.now();
        String status = "upcoming";
        if (slot.getStartTime() != null && slot.getEndTime() != null) {
            if (now.isBefore(slot.getStartTime())) {
                status = "upcoming";
            } else if (!now.isAfter(slot.getEndTime())) {
                status = "live";
            } else {
                status = "ended";
            }
        }
        int productCount = 0;
        if (slot.getId() != null) {
            productCount = itemRepository.findByTimeSlotId(slot.getId()).size();
        }

        return FlashSaleTimeSlotDto.builder()
                .id(slot.getId())
                .campaignId(slot.getCampaign() != null ? slot.getCampaign().getCampaignId() : null)
                .label(slot.getLabel())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .isActive(slot.getIsActive())
                .status(status)
                .productCount(productCount)
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
        if (item.getProduct() != null) {
            slug = item.getProduct().getSlug();
            prodId = item.getProduct().getProductId();
        }

        return FlashSaleItemDto.builder()
                .id(item.getId())
                .campaignId(item.getCampaign() != null ? item.getCampaign().getCampaignId() : null)
                .slotId(item.getTimeSlot() != null ? item.getTimeSlot().getId() : null)
                .productId(prodId)
                .productSlug(slug)
                .name(item.getName())
                .imageUrl(item.getImageUrl())
                .originalPrice(item.getOriginalPrice())
                .salePrice(item.getSalePrice())
                .discountPercent(item.getDiscountPercent())
                .soldCount(item.getSoldCount() != null ? item.getSoldCount() : 0)
                .totalStock(item.getTotalStock() != null ? item.getTotalStock() : 10)
                .maxQuantityPerUser(item.getMaxQuantityPerUser() != null ? item.getMaxQuantityPerUser() : 1)
                .status(item.getStatus())
                .progressPercent(progress)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public FlashSaleSlotsResponseDto getModernSlots() {
        OffsetDateTime serverTime = OffsetDateTime.now();
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
            String imageUrl = "";
            if (product != null && product.getImages() != null && !product.getImages().isEmpty()) {
                imageUrl = product.getImages().stream()
                        .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                        .map(ProductImage::getUrl)
                        .findFirst()
                        .orElse(product.getImages().get(0).getUrl());
            }

            if (imageUrl == null || imageUrl.isEmpty()) {
                imageUrl = "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80";
            }

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

    // =========================================================
    // ADMIN SLOT MANAGEMENT — quản lý flash_sale_slots + flash_sale_slot_products
    // (Đây là dữ liệu thật mà web frontend đang hiển thị)
    // =========================================================

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
        // Kiểm tra chồng lấn với các slot khác
        List<FlashSaleSlot> allSlots = slotRepository.findAll();
        for (FlashSaleSlot existing : allSlots) {
            if (slotsOverlap(request.getStartAt(), request.getEndAt(), existing.getStartAt(), existing.getEndAt())) {
                throw new IllegalArgumentException(
                        "Khung giờ bị chồng lấn với slot hiện có (" + existing.getStartAt() + " - " + existing.getEndAt() + ").");
            }
        }
        FlashSaleSlot slot = FlashSaleSlot.builder()
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .createdAt(OffsetDateTime.now())
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
        // Kiểm tra chồng lấn (bỏ qua chính slot này)
        List<FlashSaleSlot> allSlots = slotRepository.findAll();
        for (FlashSaleSlot existing : allSlots) {
            if (existing.getId().equals(slotId)) continue;
            if (slotsOverlap(request.getStartAt(), request.getEndAt(), existing.getStartAt(), existing.getEndAt())) {
                throw new IllegalArgumentException(
                        "Khung giờ bị chồng lấn với slot hiện có (" + existing.getStartAt() + " - " + existing.getEndAt() + ").");
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
            throw new IllegalArgumentException(
                    "Không thể xóa khung giờ đang có " + slot.getProducts().size() + " sản phẩm. Hãy gỡ sản phẩm trước.");
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

        // Kiểm tra trùng sản phẩm trong cùng slot
        boolean exists = slotProductRepository.findBySlotIdAndProductProductId(slotId, request.getProductId()).isPresent();
        if (exists) {
            throw new IllegalArgumentException(
                    "Sản phẩm '" + product.getName() + "' đã có trong khung giờ này.");
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
            throw new IllegalArgumentException(
                    "Không thể xóa sản phẩm đã có " + sp.getSold() + " lượt mua. Hãy ẩn slot thay vì xóa sản phẩm.");
        }
        slotProductRepository.delete(sp);
    }

    // =========================================================
    // HELPER METHODS
    // =========================================================

    private boolean slotsOverlap(OffsetDateTime s1, OffsetDateTime e1, OffsetDateTime s2, OffsetDateTime e2) {
        return s1.isBefore(e2) && e1.isAfter(s2);
    }

    private AdminSlotDto mapToAdminSlotDto(FlashSaleSlot slot) {
        OffsetDateTime now = OffsetDateTime.now();
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
        String imageUrl = "";
        if (product != null && product.getImages() != null && !product.getImages().isEmpty()) {
            imageUrl = product.getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .map(ProductImage::getUrl)
                    .findFirst()
                    .orElse(product.getImages().get(0).getUrl());
        }
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

        OffsetDateTime now = OffsetDateTime.now();
        if (now.isBefore(slot.getStartAt()) || now.isAfter(slot.getEndAt())) {
            return FlashSaleCheckoutResponse.builder()
                    .code("SLOT_NOT_LIVE")
                    .message("Khung giờ Flash Sale hiện không trong thời gian mở bán.")
                    .build();
        }

        // Kiểm tra mỗi số điện thoại chỉ được mua 1 sản phẩm cùng loại trong cùng 1 slot
        boolean alreadyPurchased = purchaseRepository.existsBySlotIdAndProductIdAndPhone(
                request.getSlotId(), request.getProductId(), request.getPhone());
        if (alreadyPurchased) {
            return FlashSaleCheckoutResponse.builder()
                    .code("ALREADY_PURCHASED")
                    .message("Mỗi số điện thoại chỉ được mua tối đa 1 sản phẩm trong khung giờ này.")
                    .build();
        }

        // Khóa bi quan hàng dữ liệu (SELECT ... FOR UPDATE) để chống Race Condition khi nhiều user đặt mua cùng lúc
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

        // Tăng sold count
        slotProduct.setSold(sold + 1);
        slotProductRepository.save(slotProduct);

        // Lưu thông tin mua hàng vào bảng flash_sale_purchases
        FlashSalePurchase purchase = FlashSalePurchase.builder()
                .slot(slot)
                .product(slotProduct.getProduct())
                .phone(request.getPhone())
                .createdAt(OffsetDateTime.now())
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
