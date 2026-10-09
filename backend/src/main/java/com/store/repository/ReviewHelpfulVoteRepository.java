package com.store.repository;

import com.store.entity.ReviewHelpfulVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewHelpfulVoteRepository extends JpaRepository<ReviewHelpfulVote, Long> {
    long countByReviewReviewId(Long reviewId);
    boolean existsByReviewReviewIdAndCustomerCustomerId(Long reviewId, Long customerId);
    Optional<ReviewHelpfulVote> findByReviewReviewIdAndCustomerCustomerId(Long reviewId, Long customerId);
    void deleteByReviewReviewIdAndCustomerCustomerId(Long reviewId, Long customerId);
}
