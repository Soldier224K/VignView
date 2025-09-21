from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
import cv2
import numpy as np
from PIL import Image
import tensorflow as tf
from ultralytics import YOLO
import logging
import os
from datetime import datetime
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Load AI models
models = {}
model_status = {
    'issue-detection': 'loading',
    'pothole-detection': 'loading',
    'garbage-detection': 'loading'
}

# Issue categories and their corresponding models
ISSUE_CATEGORIES = {
    'pothole': 'pothole-detection',
    'garbage': 'garbage-detection',
    'sewage': 'issue-detection',
    'street_light': 'issue-detection',
    'traffic_signal': 'issue-detection',
    'road_damage': 'issue-detection',
    'water_leak': 'issue-detection',
    'illegal_dumping': 'garbage-detection',
    'other': 'issue-detection'
}

def load_models():
    """Load AI models for issue detection"""
    try:
        # Load YOLOv8 model for general issue detection
        models['issue-detection'] = YOLO('yolov8n.pt')  # Using nano model for faster inference
        model_status['issue-detection'] = 'loaded'
        logger.info("Issue detection model loaded successfully")
        
        # Load specialized models if available
        model_paths = {
            'pothole-detection': './models/pothole_detection.pt',
            'garbage-detection': './models/garbage_detection.pt'
        }
        
        for model_name, model_path in model_paths.items():
            if os.path.exists(model_path):
                try:
                    models[model_name] = YOLO(model_path)
                    model_status[model_name] = 'loaded'
                    logger.info(f"{model_name} model loaded successfully")
                except Exception as e:
                    logger.warning(f"Failed to load {model_name}: {e}")
                    model_status[model_name] = 'unavailable'
            else:
                logger.info(f"{model_name} model not found, using general model")
                model_status[model_name] = 'unavailable'
                
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        model_status['issue-detection'] = 'error'

def preprocess_image(image_data):
    """Preprocess image for AI analysis"""
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert to numpy array
        image_array = np.array(image)
        
        return image_array
    except Exception as e:
        logger.error(f"Error preprocessing image: {e}")
        raise

def detect_issues_yolo(image_array, model_name='issue-detection'):
    """Detect issues using YOLO model"""
    try:
        if model_name not in models or model_status[model_name] != 'loaded':
            model_name = 'issue-detection'  # Fallback to general model
        
        model = models[model_name]
        results = model(image_array)
        
        detected_issues = []
        
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    # Get bounding box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    confidence = box.conf[0].cpu().numpy()
                    class_id = int(box.cls[0].cpu().numpy())
                    
                    # Map class ID to issue type
                    issue_type = map_class_to_issue_type(class_id, model_name)
                    
                    if confidence > 0.5:  # Confidence threshold
                        detected_issues.append({
                            'type': issue_type,
                            'confidence': float(confidence),
                            'bounding_box': {
                                'x1': float(x1),
                                'y1': float(y1),
                                'x2': float(x2),
                                'y2': float(y2)
                            }
                        })
        
        return detected_issues
    except Exception as e:
        logger.error(f"Error in YOLO detection: {e}")
        return []

def map_class_to_issue_type(class_id, model_name):
    """Map YOLO class ID to issue type"""
    # This is a simplified mapping - in a real implementation,
    # you would train custom models with specific civic issue classes
    
    if model_name == 'pothole-detection':
        return 'pothole'
    elif model_name == 'garbage-detection':
        return 'garbage'
    else:
        # General model mapping
        general_mapping = {
            0: 'other',      # person
            1: 'other',      # bicycle
            2: 'other',      # car
            3: 'other',      # motorcycle
            4: 'other',      # airplane
            5: 'other',      # bus
            6: 'other',      # train
            7: 'other',      # truck
            8: 'other',      # boat
            9: 'other',      # traffic light
            10: 'other',     # fire hydrant
            11: 'other',     # stop sign
            12: 'other',     # parking meter
            13: 'other',     # bench
            14: 'other',     # bird
            15: 'other',     # cat
            16: 'other',     # dog
            17: 'other',     # horse
            18: 'other',     # sheep
            19: 'other',     # cow
            20: 'other',     # elephant
            21: 'other',     # bear
            22: 'other',     # zebra
            23: 'other',     # giraffe
            24: 'other',     # backpack
            25: 'other',     # umbrella
            26: 'other',     # handbag
            27: 'other',     # tie
            28: 'other',     # suitcase
            29: 'other',     # frisbee
            30: 'other',     # skis
            31: 'other',     # snowboard
            32: 'other',     # sports ball
            33: 'other',     # kite
            34: 'other',     # baseball bat
            35: 'other',     # baseball glove
            36: 'other',     # skateboard
            37: 'other',     # surfboard
            38: 'other',     # tennis racket
            39: 'other',     # bottle
            40: 'garbage',   # wine glass
            41: 'other',     # cup
            42: 'other',     # fork
            43: 'other',     # knife
            44: 'other',     # spoon
            45: 'other',     # bowl
            46: 'other',     # banana
            47: 'other',     # apple
            48: 'other',     # sandwich
            49: 'other',     # orange
            50: 'other',     # broccoli
            51: 'other',     # carrot
            52: 'other',     # hot dog
            53: 'other',     # pizza
            54: 'other',     # donut
            55: 'other',     # cake
            56: 'other',     # chair
            57: 'other',     # couch
            58: 'other',     # potted plant
            59: 'other',     # bed
            60: 'other',     # dining table
            61: 'other',     # toilet
            62: 'other',     # tv
            63: 'other',     # laptop
            64: 'other',     # mouse
            65: 'other',     # remote
            66: 'other',     # keyboard
            67: 'other',     # cell phone
            68: 'other',     # microwave
            69: 'other',     # oven
            70: 'other',     # toaster
            71: 'other',     # sink
            72: 'other',     # refrigerator
            73: 'other',     # book
            74: 'other',     # clock
            75: 'other',     # vase
            76: 'other',     # scissors
            77: 'other',     # teddy bear
            78: 'other',     # hair drier
            79: 'other',     # toothbrush
        }
        return general_mapping.get(class_id, 'other')

def analyze_image_quality(image_array):
    """Analyze image quality for better detection"""
    try:
        # Convert to grayscale for analysis
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        
        # Calculate image quality metrics
        blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
        brightness = np.mean(gray)
        contrast = np.std(gray)
        
        quality_score = min(1.0, (blur_score / 1000) * (brightness / 128) * (contrast / 64))
        
        return {
            'blur_score': float(blur_score),
            'brightness': float(brightness),
            'contrast': float(contrast),
            'quality_score': float(quality_score)
        }
    except Exception as e:
        logger.error(f"Error analyzing image quality: {e}")
        return {
            'blur_score': 0,
            'brightness': 0,
            'contrast': 0,
            'quality_score': 0
        }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'models': model_status
    })

@app.route('/status', methods=['GET'])
def get_status():
    """Get AI service status"""
    return jsonify({
        'status': 'online',
        'models': model_status,
        'available_models': list(models.keys()),
        'issue_categories': list(ISSUE_CATEGORIES.keys())
    })

@app.route('/analyze', methods=['POST'])
def analyze_image():
    """Analyze image for civic issues"""
    try:
        start_time = datetime.now()
        
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({
                'error': 'Image data required',
                'detected_issues': [],
                'confidence': 0,
                'processing_time': 0
            }), 400
        
        # Preprocess image
        image_array = preprocess_image(data['image'])
        
        # Analyze image quality
        quality_metrics = analyze_image_quality(image_array)
        
        # Detect issues
        detected_issues = detect_issues_yolo(image_array, data.get('model', 'issue-detection'))
        
        # Calculate overall confidence
        overall_confidence = 0
        if detected_issues:
            overall_confidence = sum(issue['confidence'] for issue in detected_issues) / len(detected_issues)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        result = {
            'detected_issues': detected_issues,
            'confidence': float(overall_confidence),
            'processing_time': float(processing_time),
            'image_quality': quality_metrics,
            'timestamp': start_time.isoformat()
        }
        
        logger.info(f"Analysis completed: {len(detected_issues)} issues detected in {processing_time:.2f}s")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in image analysis: {e}")
        return jsonify({
            'error': str(e),
            'detected_issues': [],
            'confidence': 0,
            'processing_time': 0
        }), 500

@app.route('/detect', methods=['POST'])
def detect_specific_issue():
    """Detect specific issue type in image"""
    try:
        data = request.get_json()
        if not data or 'image' not in data or 'issue_type' not in data:
            return jsonify({
                'error': 'Image data and issue type required',
                'detected': False,
                'confidence': 0,
                'bounding_boxes': []
            }), 400
        
        issue_type = data['issue_type']
        model_name = ISSUE_CATEGORIES.get(issue_type, 'issue-detection')
        
        # Preprocess image
        image_array = preprocess_image(data['image'])
        
        # Detect specific issue
        detected_issues = detect_issues_yolo(image_array, model_name)
        
        # Filter for specific issue type
        filtered_issues = [issue for issue in detected_issues if issue['type'] == issue_type]
        
        result = {
            'detected': len(filtered_issues) > 0,
            'confidence': max([issue['confidence'] for issue in filtered_issues], default=0),
            'bounding_boxes': [issue['bounding_box'] for issue in filtered_issues],
            'count': len(filtered_issues),
            'issue_type': issue_type
        }
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in specific issue detection: {e}")
        return jsonify({
            'error': str(e),
            'detected': False,
            'confidence': 0,
            'bounding_boxes': []
        }), 500

@app.route('/batch-analyze', methods=['POST'])
def batch_analyze():
    """Analyze multiple images in batch"""
    try:
        data = request.get_json()
        if not data or 'images' not in data:
            return jsonify({'error': 'Images data required'}), 400
        
        images = data['images']
        results = []
        
        for i, image_data in enumerate(images):
            try:
                # Preprocess image
                image_array = preprocess_image(image_data)
                
                # Detect issues
                detected_issues = detect_issues_yolo(image_array, data.get('model', 'issue-detection'))
                
                # Calculate confidence
                confidence = 0
                if detected_issues:
                    confidence = sum(issue['confidence'] for issue in detected_issues) / len(detected_issues)
                
                results.append({
                    'image_index': i,
                    'detected_issues': detected_issues,
                    'confidence': float(confidence),
                    'status': 'success'
                })
                
            except Exception as e:
                logger.error(f"Error processing image {i}: {e}")
                results.append({
                    'image_index': i,
                    'detected_issues': [],
                    'confidence': 0,
                    'status': 'error',
                    'error': str(e)
                })
        
        return jsonify({
            'results': results,
            'total_processed': len(images),
            'successful': len([r for r in results if r['status'] == 'success'])
        })
        
    except Exception as e:
        logger.error(f"Error in batch analysis: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/retrain', methods=['POST'])
def retrain_model():
    """Retrain AI model with new data"""
    try:
        data = request.get_json()
        if not data or 'training_data' not in data:
            return jsonify({'error': 'Training data required'}), 400
        
        # This is a placeholder for model retraining
        # In a real implementation, you would:
        # 1. Validate training data
        # 2. Preprocess data
        # 3. Train model
        # 4. Validate model
        # 5. Deploy new model
        
        return jsonify({
            'status': 'retraining_started',
            'message': 'Model retraining initiated',
            'training_data_size': len(data['training_data'])
        })
        
    except Exception as e:
        logger.error(f"Error in model retraining: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Load models on startup
    load_models()
    
    # Start Flask app
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)