package com.store.controller;

import com.store.dto.admin.AdminStaffDto;
import com.store.dto.admin.CreateStaffRequest;
import com.store.dto.admin.UpdateStaffRequest;
import com.store.entity.Staff;
import com.store.repository.StaffRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/staff")
@RequiredArgsConstructor
public class AdminStaffController {

    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<AdminStaffDto>> getAllStaff() {
        List<Staff> staffList = staffRepository.findAll();
        List<AdminStaffDto> dtos = staffList.stream().map(s -> AdminStaffDto.builder()
                .staffId(s.getStaffId())
                .fullName(s.getFullName())
                .email(s.getEmail())
                .role(s.getRole())
                .phone(s.getPhone())
                .isActive(s.getIsActive() != null ? s.getIsActive() : true)
                .hiredAt(s.getHiredAt())
                .lastLoginAt(s.getLastLoginAt())
                .build()
        ).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<?> createStaff(@Valid @RequestBody CreateStaffRequest req) {
        String normalizedEmail = req.getEmail().trim().toLowerCase();
        if (staffRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email nhân viên đã tồn tại trên hệ thống"));
        }

        Staff newStaff = Staff.builder()
                .fullName(req.getFullName().trim())
                .email(normalizedEmail)
                .role(req.getRole())
                .phone(req.getPhone() != null ? req.getPhone().trim() : null)
                .passwordHash(passwordEncoder.encode(req.getPassword().trim()))
                .isActive(true)
                .hiredAt(LocalDate.now())
                .build();

        Staff saved = staffRepository.save(newStaff);

        AdminStaffDto dto = AdminStaffDto.builder()
                .staffId(saved.getStaffId())
                .fullName(saved.getFullName())
                .email(saved.getEmail())
                .role(saved.getRole())
                .phone(saved.getPhone())
                .isActive(saved.getIsActive())
                .hiredAt(saved.getHiredAt())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStaff(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateStaffRequest req
    ) {
        Optional<Staff> staffOpt = staffRepository.findById(id);
        if (staffOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy nhân viên với ID: " + id));
        }

        Staff staff = staffOpt.get();
        staff.setFullName(req.getFullName().trim());
        staff.setRole(req.getRole());
        if (req.getPhone() != null) {
            staff.setPhone(req.getPhone().trim());
        }
        if (req.getPassword() != null && !req.getPassword().trim().isEmpty()) {
            staff.setPasswordHash(passwordEncoder.encode(req.getPassword().trim()));
        }

        Staff saved = staffRepository.save(staff);

        AdminStaffDto dto = AdminStaffDto.builder()
                .staffId(saved.getStaffId())
                .fullName(saved.getFullName())
                .email(saved.getEmail())
                .role(saved.getRole())
                .phone(saved.getPhone())
                .isActive(saved.getIsActive())
                .hiredAt(saved.getHiredAt())
                .lastLoginAt(saved.getLastLoginAt())
                .build();

        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleStaffStatus(@PathVariable Integer id, Authentication auth) {
        Optional<Staff> staffOpt = staffRepository.findById(id);
        if (staffOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy nhân viên với ID: " + id));
        }

        Staff staff = staffOpt.get();
        if (auth != null && staff.getEmail().equalsIgnoreCase(auth.getName())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không thể tự khóa tài khoản của chính mình!"));
        }

        boolean newStatus = !(staff.getIsActive() != null && staff.getIsActive());
        staff.setIsActive(newStatus);
        staffRepository.save(staff);

        return ResponseEntity.ok(Map.of(
                "message", newStatus ? "Đã mở khóa tài khoản nhân viên" : "Đã vô hiệu hóa tài khoản nhân viên",
                "staffId", staff.getStaffId(),
                "isActive", newStatus
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable Integer id, Authentication auth) {
        Optional<Staff> staffOpt = staffRepository.findById(id);
        if (staffOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy nhân viên với ID: " + id));
        }
        Staff staff = staffOpt.get();
        if (auth != null && staff.getEmail().equalsIgnoreCase(auth.getName())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không thể xóa chính tài khoản đang đăng nhập!"));
        }
        staffRepository.delete(staff);
        return ResponseEntity.ok(Map.of("message", "Đã xóa tài khoản nhân viên thành công!"));
    }
}
