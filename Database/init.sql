CREATE TABLE IF NOT EXISTS fingerprints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    browserFingerprint VARCHAR(255) NOT NULL,
    canvasFingerprint VARCHAR(255) NOT NULL,
    hardwareFingerprint VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO fingerprints (browserFingerprint, canvasFingerprint, hardwareFingerprint)
VALUES ('testBrowserFingerprint1', 'testCanvasFingerprint1', 'testHardwareFingerprint1'),
       ('testBrowserFingerprint2', 'testCanvasFingerprint2', 'testHardwareFingerprint2'),
       ('testBrowserFingerprint3', 'testCanvasFingerprint3', 'testHardwareFingerprint3');