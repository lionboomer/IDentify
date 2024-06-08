const tf = require('@tensorflow/tfjs-node');

// Laden des Modells
let model;
(async () => {
  model = await tf.loadLayersModel('file://model/fingerprint_model.h5');
  console.log('Model loaded successfully');
})();

// API-Endpunkt für Vorhersagen
app.post('/predict', async (req, res) => {
  const { fingerprint } = req.body;

  if (!fingerprint) {
    return res.status(400).send('Missing fingerprint');
  }

  const imgBuffer = Buffer.from(fingerprint.split(',')[1], 'base64');
  const img = tf.node.decodeImage(imgBuffer);
  const resizedImg = tf.image.resizeBilinear(img, [35, 280]);
  const input = resizedImg.expandDims(0);

  const prediction = model.predict(input);
  const result = prediction.dataSync()[0];

  res.json({ prediction: result });
});
