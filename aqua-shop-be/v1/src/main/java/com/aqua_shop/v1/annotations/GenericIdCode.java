package com.aqua_shop.v1.annotations;

import com.aqua_shop.v1.config.GenericIdGenerator;
import org.hibernate.annotations.IdGeneratorType;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;
import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@IdGeneratorType(GenericIdGenerator.class)
@Retention(RUNTIME)
@Target({FIELD, METHOD})
public @interface GenericIdCode {
    String prefix();
    String seqName();
}