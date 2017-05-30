package ch.fhnw.cere.repository.repositories;


import ch.fhnw.cere.repository.models.CategoryFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface CategoryFeedbackRepository extends JpaRepository<CategoryFeedback, Long> {
    List<CategoryFeedback> findByFeedbackId(@Param("feedbackId") long feedbackId);
}
