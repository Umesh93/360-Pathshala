package com.pathshala.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

class FileStorageServiceTest {
    @TempDir
    Path temporaryDirectory;

    @Test
    void storesPngLogoWithTrustedMimeType() throws Exception {
        FileStorageService storage = storage(1024);
        String key = storage.storeSchoolLogo(7L, file("logo.png", image("png")));

        assertTrue(key.matches("schools/7/logo/[0-9a-f-]+\\.png"));
        assertEquals("image/png", storage.loadSchoolLogo(key).contentType());
    }

    @Test
    void storesJpegLogoWithTrustedMimeType() throws Exception {
        FileStorageService storage = storage(1024);
        String key = storage.storeSchoolLogo(7L, file("logo.jpeg", image("jpg")));

        assertTrue(key.endsWith(".jpg"));
        assertEquals("image/jpeg", storage.loadSchoolLogo(key).contentType());
    }

    @Test
    void storesWebpLogoWithTrustedMimeType() {
        FileStorageService storage = storage(1024);
        String key = storage.storeSchoolLogo(7L, file("logo.webp", minimalWebp()));

        assertEquals("image/webp", storage.loadSchoolLogo(key).contentType());
    }

    @Test
    void rejectsMismatchedOrUnsupportedLogoContent() throws Exception {
        FileStorageService storage = storage(1024);

        assertThrows(IllegalArgumentException.class, () -> storage.storeSchoolLogo(7L,
                file("logo.jpg", image("png"))));
        assertThrows(IllegalArgumentException.class, () -> storage.storeSchoolLogo(7L,
                file("logo.gif", "GIF89a".getBytes())));
        assertThrows(IllegalArgumentException.class, () -> storage.storeSchoolLogo(7L,
                file("logo.png", new byte[] {(byte) 137, 80, 78, 71, 13, 10, 26, 10})));
        byte[] jpeg = image("jpg");
        assertThrows(IllegalArgumentException.class, () -> storage.storeSchoolLogo(7L,
                file("logo.jpg", Arrays.copyOf(jpeg, jpeg.length - 2))));
        assertThrows(IllegalArgumentException.class, () -> storage.storeSchoolLogo(7L,
                file("logo.webp", new byte[] {'R', 'I', 'F', 'F', 4, 0, 0, 0, 'W', 'E', 'B', 'P'})));
    }

    @Test
    void rejectsOversizedLogo() {
        FileStorageService storage = storage(4);

        assertThrows(IllegalArgumentException.class, () -> storage.storeSchoolLogo(7L,
                file("logo.png", new byte[] {(byte) 137, 80, 78, 71, 13, 10, 26, 10})));
    }

    @Test
    void deletesIdempotentlyAndRejectsTraversal() throws Exception {
        FileStorageService storage = storage(1024);
        String key = storage.storeSchoolLogo(7L, file("logo.png", image("png")));

        storage.delete(key);
        storage.delete(key);
        assertFalse(Files.exists(temporaryDirectory.resolve("logos").resolve(key)));
        assertThrows(IllegalArgumentException.class, () -> storage.loadSchoolLogo("../outside.png"));
    }

    private FileStorageService storage(long logoMaxSize) {
        return new FileStorageService(temporaryDirectory.resolve("assignments").toString(), temporaryDirectory.resolve("logos").toString(), 1024, logoMaxSize);
    }

    private MockMultipartFile file(String name, byte[] bytes) {
        return new MockMultipartFile("file", name, "application/octet-stream", bytes);
    }

    private byte[] image(String format) throws Exception {
        BufferedImage image = new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB);
        image.setRGB(0, 0, 0x336699);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        assertTrue(ImageIO.write(image, format, output));
        return output.toByteArray();
    }

    private byte[] minimalWebp() {
        return new byte[] {'R', 'I', 'F', 'F', 22, 0, 0, 0, 'W', 'E', 'B', 'P',
                'V', 'P', '8', 'X', 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
    }
}
