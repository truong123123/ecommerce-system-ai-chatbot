package com.store.repository;

import com.store.entity.ReviewReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewReplyRepository extends JpaRepository<ReviewReply, Long> {
    Optional<ReviewReply> findByReviewReviewId(Long reviewId);
    void deleteByReviewReviewId(Long reviewId);
}
