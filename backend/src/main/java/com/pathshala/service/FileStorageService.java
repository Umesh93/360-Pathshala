package com.pathshala.service;

import com.pathshala.dto.AssignmentDtos.Attachment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.ByteArrayInputStream;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;
import java.nio.file.*;
import java.util.*;

@Service
public class FileStorageService {
    private static final Set<String> ALLOWED = Set.of("pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "jpg", "jpeg", "png", "gif", "webp", "bmp", "zip");
    private final Path root;
    private final Path logoRoot;
    private final long maxSize;

    public FileStorageService(@Value("${app.file.storage-dir:${app.assignment.storage-dir:data/files}}") String directory,
                              @Value("${app.school.logo-storage-dir:data/school-assets}") String logoDirectory,
                              @Value("${app.assignment.max-file-size-bytes:10485760}") long maxSize,
                              @Value("${app.school.logo-max-file-size-bytes:2097152}") long schoolLogoMaxSize) {
        this.root = Paths.get(directory).toAbsolutePath().normalize();
        this.logoRoot = Paths.get(logoDirectory).toAbsolutePath().normalize();
        this.maxSize = maxSize;
        this.schoolLogoMaxSize = schoolLogoMaxSize;
        try { Files.createDirectories(root); Files.createDirectories(logoRoot); } catch (IOException e) { throw new IllegalStateException("Cannot initialize file storage", e); }
    }

    public Attachment store(Long schoolId, Long assignmentId, String area, MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Empty file is not allowed");
        if (file.getSize() > maxSize) throw new IllegalArgumentException("File exceeds the configured maximum size");
        String original = Optional.ofNullable(file.getOriginalFilename()).orElse("file").replace('\\', '/');
        original = original.substring(original.lastIndexOf('/') + 1);
        String extension = extension(original);
        if (!ALLOWED.contains(extension)) throw new IllegalArgumentException("Unsupported assignment file type");
        String key = schoolId + "/" + assignmentId + "/" + area + "/" + UUID.randomUUID() + "." + extension;
        Path target = resolve(key);
        try {
            Files.createDirectories(target.getParent());
            file.transferTo(target);
        } catch (IOException e) { throw new IllegalStateException("Could not store assignment file", e); }
        return new Attachment(key, original, Optional.ofNullable(file.getContentType()).orElse("application/octet-stream"), file.getSize());
    }

    public StoredFile load(Attachment attachment) {
        Path path = resolve(attachment.key());
        if (!Files.isRegularFile(path)) throw new IllegalArgumentException("Attachment file is unavailable");
        try { return new StoredFile(Files.readAllBytes(path), attachment.contentType(), attachment.originalName()); }
        catch (IOException e) { throw new IllegalStateException("Could not read assignment file", e); }
    }

    public String storeSchoolLogo(Long schoolId, MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Empty logo file is not allowed");
        if (file.getSize() > schoolLogoMaxSize) throw new IllegalArgumentException("Logo exceeds the configured maximum size");
        try {
            byte[] bytes = file.getBytes();
            LogoType type = LogoType.detect(bytes, extension(Optional.ofNullable(file.getOriginalFilename()).orElse("")));
            String key = "schools/" + schoolId + "/logo/" + UUID.randomUUID() + "." + type.extension;
            Path target = resolveLogo(key);
            Files.createDirectories(target.getParent());
            Files.write(target, bytes, StandardOpenOption.CREATE_NEW);
            return key;
        } catch (IOException e) { throw new IllegalStateException("Could not store school logo", e); }
    }

    public String storeDemoRequestLogo(Long requestId, MultipartFile file) {
        return storeLogo("demo-requests/" + requestId + "/logo/", file);
    }

    public StoredFile loadDemoRequestLogo(String key) {
        return loadLogo(key, "Demo request logo is unavailable");
    }

    public String copyRequestLogoToSchool(String requestKey, Long schoolId) {
        StoredFile source = loadDemoRequestLogo(requestKey);
        String extension = extension(source.originalName());
        String key = "schools/" + schoolId + "/logo/" + UUID.randomUUID() + "." + extension;
        Path target = resolveLogo(key);
        try {
            Files.createDirectories(target.getParent());
            Files.write(target, source.bytes(), StandardOpenOption.CREATE_NEW);
            return key;
        } catch (IOException e) {
            throw new IllegalStateException("Could not copy demo request logo", e);
        }
    }

    private String storeLogo(String prefix, MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Empty logo file is not allowed");
        if (file.getSize() > schoolLogoMaxSize) throw new IllegalArgumentException("Logo exceeds the configured maximum size");
        try {
            byte[] bytes = file.getBytes();
            LogoType type = LogoType.detect(bytes, extension(Optional.ofNullable(file.getOriginalFilename()).orElse("")));
            String key = prefix + UUID.randomUUID() + "." + type.extension;
            Path target = resolveLogo(key);
            Files.createDirectories(target.getParent());
            Files.write(target, bytes, StandardOpenOption.CREATE_NEW);
            return key;
        } catch (IOException e) { throw new IllegalStateException("Could not store logo", e); }
    }

    private StoredFile loadLogo(String key, String unavailableMessage) {
        Path path = resolveLogo(key);
        if (!Files.isRegularFile(path)) throw new IllegalArgumentException(unavailableMessage);
        try {
            byte[] bytes = Files.readAllBytes(path);
            LogoType type = LogoType.detect(bytes, extension(path.getFileName().toString()));
            return new StoredFile(bytes, type.mime, path.getFileName().toString());
        } catch (IOException e) { throw new IllegalStateException("Could not read logo", e); }
    }

    public StoredFile loadSchoolLogo(String key) {
        Path path = resolveLogo(key);
        if (!Files.isRegularFile(path)) throw new IllegalArgumentException("School logo is unavailable");
        try {
            byte[] bytes = Files.readAllBytes(path);
            LogoType type = LogoType.detect(bytes, extension(path.getFileName().toString()));
            return new StoredFile(bytes, type.mime, path.getFileName().toString());
        } catch (IOException e) { throw new IllegalStateException("Could not read school logo", e); }
    }

    public void delete(String key) {
        if (key == null || key.isBlank()) return;
        try { Files.deleteIfExists(key.startsWith("schools/") || key.startsWith("demo-requests/") ? resolveLogo(key) : resolve(key)); }
        catch (IOException e) { throw new IllegalStateException("Could not delete stored file", e); }
    }

    private Path resolve(String key) {
        if (key == null || key.isBlank() || key.contains("..") || Paths.get(key).isAbsolute()) throw new IllegalArgumentException("Invalid attachment key");
        Path path = root.resolve(key).normalize();
        if (!path.startsWith(root)) throw new IllegalArgumentException("Invalid attachment key");
        return path;
    }

    private Path resolveLogo(String key) {
        if (key == null || key.isBlank() || key.contains("..") || Paths.get(key).isAbsolute()) throw new IllegalArgumentException("Invalid logo key");
        Path path = logoRoot.resolve(key).normalize();
        if (!path.startsWith(logoRoot)) throw new IllegalArgumentException("Invalid logo key");
        return path;
    }

    private static String extension(String name) {
        int dot = name.lastIndexOf('.');
        return dot < 0 ? "" : name.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private final long schoolLogoMaxSize;

    private enum LogoType {
        PNG("png", "image/png"), JPEG("jpg", "image/jpeg"), WEBP("webp", "image/webp");
        final String extension, mime;
        LogoType(String extension, String mime) { this.extension = extension; this.mime = mime; }
        static LogoType detect(byte[] b, String ext) {
            LogoType type = b.length >= 8 && (b[0] & 255) == 137 && b[1] == 80 && b[2] == 78 && b[3] == 71
                    && b[4] == 13 && b[5] == 10 && b[6] == 26 && b[7] == 10 ? PNG
                    : b.length >= 3 && (b[0] & 255) == 255 && (b[1] & 255) == 216 && (b[2] & 255) == 255 ? JPEG
                    : b.length >= 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F' && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P' ? WEBP : null;
            if (type == null || !Set.of("png", "jpg", "jpeg", "webp").contains(ext)) throw new IllegalArgumentException("Unsupported or invalid school logo image");
            if (type == PNG && !ext.equals("png") || type == JPEG && !(ext.equals("jpg") || ext.equals("jpeg")) || type == WEBP && !ext.equals("webp")) throw new IllegalArgumentException("Logo extension does not match its image content");
            if (type == PNG || type == JPEG) validateDecodedImage(b, type);
            else validateWebp(b);
            return type;
        }

        private static void validateDecodedImage(byte[] bytes, LogoType type) {
            try {
                BufferedImage image = ImageIO.read(new ByteArrayInputStream(bytes));
                if (image == null || image.getWidth() <= 0 || image.getHeight() <= 0) throw new IllegalArgumentException("Invalid or undecodable school logo image");
                if (type == PNG && !hasExactPngEnd(bytes) || type == JPEG && !hasExactJpegEnd(bytes)) throw new IllegalArgumentException("Invalid or truncated school logo image");
            } catch (IOException e) { throw new IllegalArgumentException("Invalid or undecodable school logo image", e); }
        }

        private static boolean hasExactPngEnd(byte[] b) {
            int p = 8;
            while (p + 12 <= b.length) {
                long length = uint32be(b, p);
                if (length > Integer.MAX_VALUE || p + 12L + length > b.length) return false;
                String chunk = new String(b, p + 4, 4, java.nio.charset.StandardCharsets.US_ASCII);
                p += 12 + (int) length;
                if ("IEND".equals(chunk)) return length == 0 && p == b.length;
            }
            return false;
        }

        private static boolean hasExactJpegEnd(byte[] b) { return b.length >= 4 && (b[b.length - 2] & 255) == 255 && (b[b.length - 1] & 255) == 217; }

        private static void validateWebp(byte[] b) {
            if (b.length < 20 || b[0] != 'R' || b[1] != 'I' || b[2] != 'F' || b[3] != 'F' || b[8] != 'W' || b[9] != 'E' || b[10] != 'B' || b[11] != 'P') throw new IllegalArgumentException("Invalid WebP logo image");
            long riffEnd = 8L + uint32(b, 4);
            if (riffEnd != b.length) throw new IllegalArgumentException("Invalid WebP RIFF length");
            int p = 12; boolean imageChunk = false;
            while (p < b.length) {
                if (p + 8 > b.length) throw new IllegalArgumentException("Invalid WebP chunk");
                long length = uint32(b, p + 4);
                if (length > Integer.MAX_VALUE || p + 8L + length > b.length) throw new IllegalArgumentException("Invalid WebP chunk length");
                String chunk = new String(b, p, 4, java.nio.charset.StandardCharsets.US_ASCII);
                if (Set.of("VP8 ", "VP8L", "VP8X").contains(chunk)) {
                    long minimum = "VP8 ".equals(chunk) ? 10 : "VP8L".equals(chunk) ? 5 : 10;
                    if (length < minimum) throw new IllegalArgumentException("Invalid WebP image chunk");
                    imageChunk = true;
                }
                p += 8 + (int) length + ((length & 1) == 1 ? 1 : 0);
                if (p > b.length) throw new IllegalArgumentException("Invalid WebP padding");
            }
            if (!imageChunk) throw new IllegalArgumentException("WebP image chunk is missing");
        }

        private static long uint32(byte[] b, int p) { return (b[p] & 255L) | ((b[p + 1] & 255L) << 8) | ((b[p + 2] & 255L) << 16) | ((b[p + 3] & 255L) << 24); }
        private static long uint32be(byte[] b, int p) { return ((b[p] & 255L) << 24) | ((b[p + 1] & 255L) << 16) | ((b[p + 2] & 255L) << 8) | (b[p + 3] & 255L); }
    }

    public record StoredFile(byte[] bytes, String contentType, String originalName) {}
}
