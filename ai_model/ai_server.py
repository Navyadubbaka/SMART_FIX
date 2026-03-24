from flask import Flask,request,jsonify
import tensorflow as tf
import numpy as np
from PIL import Image

app = Flask(__name__)

model = tf.keras.models.load_model("model.h5")

categories = ["Plumbing","Electrical","Carpentry"]
IMG_SIZE = 224
def process_image(path):

 img = Image.open(path).convert("RGB")
 img = img.resize((IMG_SIZE,IMG_SIZE))

 img = np.array(img)/255.0
 img = np.expand_dims(img,axis=0)

 return img


@app.route("/predict",methods=["POST"])
def predict():

 file = request.files["image"]

 path = "temp.jpg"
 file.save(path)

 img = process_image(path)

 pred = model.predict(img)

 index = np.argmax(pred)

 category = categories[index]

 return jsonify({
  "category":category
 })


app.run(port=5001)