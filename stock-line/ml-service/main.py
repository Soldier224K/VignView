import os
import io
import base64
import json
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from PIL import Image
import cv2
import requests
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Stock Line ML Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ProductDetection(BaseModel):
    product_name: str
    confidence: float
    bounding_box: List[float]
    category: str
    estimated_quantity: int

class StockForecast(BaseModel):
    product_id: str
    product_name: str
    current_stock: int
    predicted_demand: int
    restock_recommendation: bool
    confidence: float
    factors: List[str]

class ImageAnalysisRequest(BaseModel):
    image_data: str  # base64 encoded image
    shop_category: str
    location: Optional[str] = None

class WeatherData(BaseModel):
    temperature: float
    humidity: float
    weather_condition: str
    location: str
    timestamp: datetime

# Global variables for models (in production, these would be loaded from files)
product_categories = {
    'grocery': ['rice', 'wheat', 'oil', 'sugar', 'salt', 'spices', 'vegetables', 'fruits', 'milk', 'bread'],
    'pharmacy': ['tablets', 'syrup', 'injection', 'cream', 'powder', 'capsules', 'drops', 'inhaler'],
    'clothing': ['shirt', 'pants', 'dress', 'shoes', 'hat', 'jacket', 'socks', 'underwear'],
    'stationery': ['pen', 'pencil', 'notebook', 'paper', 'stapler', 'calculator', 'ruler', 'eraser'],
    'hardware': ['screw', 'nail', 'hammer', 'saw', 'drill', 'wrench', 'pliers', 'tape'],
    'paints': ['paint', 'brush', 'roller', 'primer', 'thinner', 'varnish', 'stain', 'sealer']
}

# Mock ML models (in production, these would be actual trained models)
class MockProductDetector:
    def __init__(self):
        self.categories = product_categories
    
    def detect_products(self, image: np.ndarray, shop_category: str) -> List[ProductDetection]:
        """Mock product detection - in production, this would use YOLO or similar"""
        detections = []
        
        # Simulate detection based on shop category
        if shop_category in self.categories:
            products = self.categories[shop_category]
            
            # Simulate detecting 2-5 products
            num_products = np.random.randint(2, 6)
            selected_products = np.random.choice(products, num_products, replace=False)
            
            for i, product in enumerate(selected_products):
                detection = ProductDetection(
                    product_name=product,
                    confidence=np.random.uniform(0.7, 0.95),
                    bounding_box=[
                        np.random.uniform(0, 0.7),  # x
                        np.random.uniform(0, 0.7),  # y
                        np.random.uniform(0.2, 0.3),  # width
                        np.random.uniform(0.2, 0.3)   # height
                    ],
                    category=shop_category,
                    estimated_quantity=np.random.randint(1, 20)
                )
                detections.append(detection)
        
        return detections

class MockForecaster:
    def __init__(self):
        self.weather_api_key = os.getenv('OPENWEATHER_API_KEY')
    
    async def get_weather_data(self, location: str) -> Optional[WeatherData]:
        """Get weather data from OpenWeatherMap API"""
        if not self.weather_api_key:
            return None
        
        try:
            url = f"http://api.openweathermap.org/data/2.5/weather"
            params = {
                'q': location,
                'appid': self.weather_api_key,
                'units': 'metric'
            }
            
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                return WeatherData(
                    temperature=data['main']['temp'],
                    humidity=data['main']['humidity'],
                    weather_condition=data['weather'][0]['main'],
                    location=location,
                    timestamp=datetime.now()
                )
        except Exception as e:
            print(f"Weather API error: {e}")
        
        return None
    
    def forecast_demand(self, 
                       product_name: str, 
                       current_stock: int,
                       historical_sales: List[Dict],
                       weather_data: Optional[WeatherData] = None,
                       shop_category: str = 'grocery') -> StockForecast:
        """Mock demand forecasting - in production, this would use time series models"""
        
        # Base demand calculation
        base_demand = np.random.randint(5, 25)
        
        # Weather-based adjustments
        weather_factor = 1.0
        if weather_data:
            if weather_data.weather_condition.lower() in ['rain', 'drizzle']:
                if shop_category == 'grocery' and 'umbrella' in product_name.lower():
                    weather_factor = 1.5
                elif shop_category == 'pharmacy' and 'cold' in product_name.lower():
                    weather_factor = 1.3
            
            if weather_data.temperature > 30:
                if 'cold' in product_name.lower() or 'ice' in product_name.lower():
                    weather_factor = 1.4
                elif 'hot' in product_name.lower():
                    weather_factor = 0.7
        
        # Seasonal adjustments (mock)
        current_month = datetime.now().month
        seasonal_factor = 1.0
        
        if current_month in [12, 1, 2]:  # Winter
            if 'winter' in product_name.lower() or 'warm' in product_name.lower():
                seasonal_factor = 1.3
        elif current_month in [6, 7, 8]:  # Summer
            if 'summer' in product_name.lower() or 'cool' in product_name.lower():
                seasonal_factor = 1.3
        
        predicted_demand = int(base_demand * weather_factor * seasonal_factor)
        restock_recommendation = current_stock < predicted_demand * 1.5
        
        factors = []
        if weather_data:
            factors.append(f"Weather: {weather_data.weather_condition}")
        factors.append(f"Seasonal trend: {seasonal_factor:.1f}x")
        factors.append(f"Historical average: {base_demand}")
        
        return StockForecast(
            product_id=f"prod_{hash(product_name) % 10000}",
            product_name=product_name,
            current_stock=current_stock,
            predicted_demand=predicted_demand,
            restock_recommendation=restock_recommendation,
            confidence=np.random.uniform(0.6, 0.9),
            factors=factors
        )

# Initialize models
detector = MockProductDetector()
forecaster = MockForecaster()

@app.get("/")
async def root():
    return {"message": "Stock Line ML Service", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/analyze-image")
async def analyze_image(request: ImageAnalysisRequest):
    """Analyze uploaded image for product detection"""
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image_data)
        image = Image.open(io.BytesIO(image_data))
        image_array = np.array(image)
        
        # Convert to OpenCV format
        if len(image_array.shape) == 3:
            image_array = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
        
        # Detect products
        detections = detector.detect_products(image_array, request.shop_category)
        
        return {
            "status": "success",
            "detections": [detection.dict() for detection in detections],
            "total_products": len(detections),
            "shop_category": request.shop_category
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image analysis failed: {str(e)}")

@app.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    shop_category: str = "grocery",
    location: str = None
):
    """Upload and analyze image file"""
    try:
        # Read image file
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        image_array = np.array(image)
        
        # Convert to OpenCV format
        if len(image_array.shape) == 3:
            image_array = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
        
        # Detect products
        detections = detector.detect_products(image_array, shop_category)
        
        return {
            "status": "success",
            "filename": file.filename,
            "detections": [detection.dict() for detection in detections],
            "total_products": len(detections),
            "shop_category": shop_category
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image upload failed: {str(e)}")

@app.post("/forecast-demand")
async def forecast_demand(
    product_name: str,
    current_stock: int,
    shop_category: str = "grocery",
    location: str = None,
    historical_sales: List[Dict] = []
):
    """Generate demand forecast for a product"""
    try:
        weather_data = None
        if location:
            weather_data = await forecaster.get_weather_data(location)
        
        forecast = forecaster.forecast_demand(
            product_name=product_name,
            current_stock=current_stock,
            historical_sales=historical_sales,
            weather_data=weather_data,
            shop_category=shop_category
        )
        
        return {
            "status": "success",
            "forecast": forecast.dict()
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Forecast failed: {str(e)}")

@app.post("/batch-forecast")
async def batch_forecast(
    products: List[Dict[str, Any]],
    shop_category: str = "grocery",
    location: str = None
):
    """Generate forecasts for multiple products"""
    try:
        weather_data = None
        if location:
            weather_data = await forecaster.get_weather_data(location)
        
        forecasts = []
        for product in products:
            forecast = forecaster.forecast_demand(
                product_name=product['name'],
                current_stock=product['current_stock'],
                historical_sales=product.get('historical_sales', []),
                weather_data=weather_data,
                shop_category=shop_category
            )
            forecasts.append(forecast.dict())
        
        return {
            "status": "success",
            "forecasts": forecasts,
            "total_products": len(forecasts)
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Batch forecast failed: {str(e)}")

@app.get("/weather/{location}")
async def get_weather(location: str):
    """Get weather data for a location"""
    try:
        weather_data = await forecaster.get_weather_data(location)
        if weather_data:
            return {
                "status": "success",
                "weather": weather_data.dict()
            }
        else:
            return {
                "status": "error",
                "message": "Weather data not available"
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Weather fetch failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)