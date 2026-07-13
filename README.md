# Bone-Fracture-Detection

An AI-powered web application that detects bone fractures from X-ray images using **TensorFlow**, **ResNet50**, and **Flask**. The system first identifies the body part (Elbow, Hand, or Shoulder) and then predicts whether the bone is **Fractured** or **Normal**.

---

## 📌 Features

- Upload X-ray images through a web interface
- Automatic body part classification
- Fracture detection using dedicated deep learning models
- Interactive Flask web application
- Drag-and-drop image upload
- Session history tracking
- Download diagnosis report
- Responsive user interface

---

## 🛠️ Tech Stack

- Python
- Flask
- TensorFlow / Keras
- ResNet50 (Transfer Learning)
- NumPy
- Pandas
- Matplotlib
- Scikit-learn
- HTML
- CSS
- JavaScript

---

## 📂 Project Structure

```
Bone-Fracture-Detection/
│
├── app.py                     # Flask application
├── predictions.py             # Prediction logic
├── prediction_test.py         # Test script
├── training_parts.py          # Train body part classifier
├── training_fracture.py       # Train fracture models
├── requirements.txt
│
├── templates/
│   └── index.html
│
├── static/
│   ├── css/
│   └── js/
│
├── uploads/
├── images/
├── Dataset/
├── weights/
│   ├── ResNet50_BodyParts.h5
│   ├── ResNet50_Elbow_frac.h5
│   ├── ResNet50_Hand_frac.h5
│   └── ResNet50_Shoulder_frac.h5
│
└── README.md
```

---

## 🧠 Working

The application performs prediction in two stages:

### Step 1: Body Part Classification

The uploaded X-ray image is classified into one of the following:

- Elbow
- Hand
- Shoulder

### Step 2: Fracture Detection

After identifying the body part, the corresponding trained ResNet50 model predicts whether the image is:

- Fractured
- Normal

The final diagnosis is displayed on the web interface.

---

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/Bone-Fracture-Detection.git

cd Bone-Fracture-Detection
```

### Create Virtual Environment

```bash
python -m venv venv
```

Activate environment

Windows

```bash
venv\Scripts\activate
```

Linux/Mac

```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

## ▶️ Run Application

```bash
python app.py
```

Open your browser

```
http://127.0.0.1:5000
```

---

## 📊 Model Architecture

- Transfer Learning using ResNet50
- Input Size: **224 × 224 RGB**
- Optimizer: Adam
- Loss Function: Categorical Crossentropy
- Early Stopping
- Separate models for:

  - Body Part Classification
  - Elbow Fracture Detection
  - Hand Fracture Detection
  - Shoulder Fracture Detection

---

## 📁 Dataset

The project expects the dataset in the following format:

```
Dataset/

├── train/
├── test/

    ├── Elbow/
    ├── Hand/
    └── Shoulder/

        ├── patient001/
        │
        ├── positive/
        └── negative/
```

---

## 📸 Supported Image Formats

- JPG
- JPEG
- PNG
- WEBP

Maximum upload size:

**16 MB**

---

## 📦 Required Libraries

```
Flask
TensorFlow
NumPy
Pandas
Matplotlib
Scikit-learn
Pillow
Colorama
```



## 👨‍💻 Author

**Mahesh Karagaonkar**

Artificial Intelligence | Machine Learning | Data Science

---

## 📄 License

This project is developed for educational and research purposes.

```

This README is based on the uploaded Flask application, prediction pipeline, training scripts, frontend, and dependency files. 
