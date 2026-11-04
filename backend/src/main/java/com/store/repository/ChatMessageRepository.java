package com.store.repository;

import com.store.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(UUID sessionId);

    List<ChatMessage> findTop200ByOrderByCreatedAtDesc();

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("DELETE FROM ChatMessage m WHERE m.createdAt < :cutoff")
    int deleteByCreatedAtBefore(@Param("cutoff") OffsetDateTime cutoff);
}
