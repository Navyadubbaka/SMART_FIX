# from flask import Flask,request,jsonify
# import tensorflow as tf
# import numpy as np
# from PIL import Image
# app = Flask(__name__)
# model = tf.keras.models.load_model("model.h5")
# categories = ["Plumbing","Electrical","Carpentry"]
# IMG_SIZE = 224
# def process_image(path):
#  img = Image.open(path).convert("RGB")
#  img = img.resize((IMG_SIZE,IMG_SIZE))

#  img = np.array(img)/255.0
#  img = np.expand_dims(img,axis=0)

#  return img
# @app.route("/predict",methods=["POST"])
# def predict():

#  file = request.files["image"]

#  path = "temp.jpg"
#  file.save(path)

#  img = process_image(path)

#  pred = model.predict(img)

#  index = np.argmax(pred)

#  category = categories[index]

#  return jsonify({
#   "category":category
#  })

# app.run(port=5001)
from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image
import os

app = Flask(__name__)

model = tf.keras.models.load_model("model.h5")

# ✅ AUTO LOAD categories (BEST PRACTICE)
categories = sorted(os.listdir("dataset"))

IMG_SIZE = 224

def process_image(path):
    img = Image.open(path).convert("RGB")
    img = img.resize((IMG_SIZE, IMG_SIZE))
    img = np.array(img) / 255.0
    img = np.expand_dims(img, axis=0)
    return img


@app.route("/predict", methods=["POST"])
def predict():
    try:
        file = request.files["image"]

        path = "temp.jpg"
        file.save(path)

        img = process_image(path)

        pred = model.predict(img)

        index = np.argmax(pred)
        confidence = float(np.max(pred))

        # ✅ Safe check
        if index >= len(categories):
            return jsonify({"error": "Invalid prediction index"}), 500

        category = categories[index]

        print("Prediction:", pred)
        print("Index:", index)
        print("Category:", category)
        print("Confidence:", confidence)

        return jsonify({
            "category": category,
            "confidence": confidence
        })

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": str(e)}), 500


app.run(port=5001)