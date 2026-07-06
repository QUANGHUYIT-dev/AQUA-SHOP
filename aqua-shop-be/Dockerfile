FROM eclipse-temurin:17-jdk-alpine

# Thêm chữ v1/ vào đây vì file jar nằm trong aqua-shop-be/v1/target/
ARG JAR_FILE=v1/target/v1-0.0.1-SNAPSHOT.jar
COPY ${JAR_FILE} app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app.jar"]