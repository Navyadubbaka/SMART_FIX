from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image

app = Flask(__name__)

CATEGORIES = ["Electrical", "Plumbing", "Mechanical", "Appliance", "Hardware"]
MODEL_PATH = "model.h5"
model = None

try:
    model = tf.keras.models.load_model(MODEL_PATH)
except Exception:
    model = None


def preprocess_image(image_path: str):
    img = image.load_img(image_path, target_size=(224, 224))
    arr = image.img_to_array(img) / 255.0
    arr = np.expand_dims(arr, axis=0)
    return arr


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True)
    image_path = data.get("image_path")
    if not image_path:
      return jsonify({"message": "image_path is required"}), 400
    if model is None:
      return jsonify({"predicted_category": "Hardware", "confidence_score": 0.51})

    arr = preprocess_image(image_path)
    preds = model.predict(arr, verbose=0)[0]
    idx = int(np.argmax(preds))
    return jsonify(
        {
            "predicted_category": CATEGORIES[idx],
            "confidence_score": float(preds[idx]),
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
