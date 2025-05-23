package com.cago.persitence.specification;

import com.cago.persitence.entity.Post;
import com.cago.persitence.entity.User;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

import java.util.ArrayList;
import java.util.List;

import lombok.experimental.UtilityClass;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.jpa.domain.Specification;

@UtilityClass
public class PostSpecification {

    public static Specification<Post> searchPost(String name, String topic, String author) {
        return (Root<Post> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> optionalPredicates = new ArrayList<>();
            Predicate statusPredicate = cb.equal(cb.lower(root.get(Post.Fields.status)), "published");

            if (StringUtils.isNotBlank(name)) {
                optionalPredicates.add(cb.like(cb.lower(root.get(Post.Fields.name)),
                        "%" + name.trim().toLowerCase() + "%"));
            }
            if (StringUtils.isNotBlank(topic)) {
                optionalPredicates.add(cb.like(cb.lower(root.get(Post.Fields.topic)),
                        "%" + topic.trim().toLowerCase() + "%"));
            }
            if (StringUtils.isNotBlank(author)) {
                Join<Post, User> authorJoin = root.join("author", JoinType.LEFT);
                optionalPredicates.add(cb.like(cb.lower(authorJoin.get(User.Fields.username)),
                        "%" + author.trim().toLowerCase() + "%"));
            }

            if (!optionalPredicates.isEmpty()) {
                return cb.and(statusPredicate, cb.or(optionalPredicates.toArray(new Predicate[0])));
            }
            return statusPredicate;
        };
    }


}
