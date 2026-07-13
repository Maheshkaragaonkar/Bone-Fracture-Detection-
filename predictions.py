import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image

# Dictionary to hold lazily loaded models
_models = {}

def get_model(model_name):
    if model_name not in _models:
        print(f"Loading model lazily: {model_name}...")
        if model_name == 'Parts':
            _models[model_name] = tf.keras.models.load_model("weights/ResNet50_BodyParts.h5", compile=False)
        elif model_name == 'Elbow':
            _models[model_name] = tf.keras.models.load_model("weights/ResNet50_Elbow_frac.h5", compile=False)
        elif model_name == 'Hand':
            _models[model_name] = tf.keras.models.load_model("weights/ResNet50_Hand_frac.h5", compile=False)
        elif model_name == 'Shoulder':
            _models[model_name] = tf.keras.models.load_model("weights/ResNet50_Shoulder_frac.h5", compile=False)
    return _models[model_name]

# categories for each result by index

#   0-Elbow     1-Hand      2-Shoulder
categories_parts = ["Elbow", "Hand", "Shoulder"]

#   0-fractured     1-normal
categories_fracture = ['fractured', 'normal']


# get image and model name, the default model is "Parts"
# Parts - bone type predict model of 3 classes
# otherwise - fracture predict for each part
def predict(img, model="Parts"):
    size = 224
    chosen_model = get_model(model)

    # load image with 224px224p (the training model image size, rgb)
    temp_img = image.load_img(img, target_size=(size, size))
    x = image.img_to_array(temp_img)
    x = np.expand_dims(x, axis=0)
    images = np.vstack([x])
    prediction = np.argmax(chosen_model.predict(images), axis=1)

    # chose the category and get the string prediction
    if model == 'Parts':
        prediction_str = categories_parts[prediction.item()]
    else:
        prediction_str = categories_fracture[prediction.item()]

    return prediction_str

