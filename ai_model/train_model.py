import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator

IMG_SIZE = 224
BATCH_SIZE = 32

train = ImageDataGenerator(rescale=1./255,validation_split=0.2)

train_data = train.flow_from_directory(
 "dataset",
 target_size=(IMG_SIZE,IMG_SIZE),
 batch_size=BATCH_SIZE,
 subset="training"
)

val_data = train.flow_from_directory(
 "dataset",
 target_size=(IMG_SIZE,IMG_SIZE),
 batch_size=BATCH_SIZE,
 subset="validation"
)

model = tf.keras.Sequential([
 tf.keras.layers.Conv2D(32,(3,3),activation='relu',input_shape=(IMG_SIZE,IMG_SIZE,3)),
 tf.keras.layers.MaxPooling2D(),

 tf.keras.layers.Conv2D(64,(3,3),activation='relu'),
 tf.keras.layers.MaxPooling2D(),

 tf.keras.layers.Conv2D(128,(3,3),activation='relu'),
 tf.keras.layers.MaxPooling2D(),

 tf.keras.layers.Flatten(),
 tf.keras.layers.Dense(128,activation='relu'),
 tf.keras.layers.Dense(3,activation='softmax')
])

model.compile(
 optimizer="adam",
 loss="categorical_crossentropy",
 metrics=["accuracy"]
)

model.fit(train_data,validation_data=val_data,epochs=10)

model.save("model.h5")