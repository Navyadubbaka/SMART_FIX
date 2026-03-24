import tensorflow as tf
from tensorflow.keras import layers, models

IMG_SIZE = (224, 224)
BATCH_SIZE = 16
DATASET_DIR = "sample-dataset"
CLASS_NAMES = ["Electrical", "Plumbing", "Mechanical", "Appliance", "Hardware"]


def build_model(num_classes: int):
    model = models.Sequential(
        [
            layers.Input(shape=(224, 224, 3)),
            layers.Conv2D(32, (3, 3), activation="relu"),
            layers.MaxPooling2D(),
            layers.Conv2D(64, (3, 3), activation="relu"),
            layers.MaxPooling2D(),
            layers.Conv2D(128, (3, 3), activation="relu"),
            layers.MaxPooling2D(),
            layers.Flatten(),
            layers.Dense(128, activation="relu"),
            layers.Dropout(0.3),
            layers.Dense(num_classes, activation="softmax"),
        ]
    )
    model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])
    return model


def main():
    train_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR,
        validation_split=0.2,
        subset="training",
        seed=42,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="categorical",
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR,
        validation_split=0.2,
        subset="validation",
        seed=42,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="categorical",
    )

    augment = tf.keras.Sequential(
        [
            layers.RandomFlip("horizontal"),
            layers.RandomRotation(0.1),
            layers.RandomZoom(0.1),
        ]
    )

    train_ds = train_ds.map(lambda x, y: (augment(x, training=True) / 255.0, y))
    val_ds = val_ds.map(lambda x, y: (x / 255.0, y))

    model = build_model(num_classes=len(CLASS_NAMES))
    model.fit(train_ds, validation_data=val_ds, epochs=10)
    model.save("model.h5")
    print("Model saved as model.h5")


if __name__ == "__main__":
    main()
