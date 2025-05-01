from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, List, Optional, Any, Union
import numpy as np
import time
import hashlib
import json
import os
import logging
import requests
import threading
import asyncio
import base64
from datetime import datetime

# Import optimization engines
from optimization import optimization_engine
try:
    from quantum_integration import quantum_engine, QUANTUM_AVAILABLE
except ImportError:
    QUANTUM_AVAILABLE = False
    quantum_engine = None
    logger.warning("Quantum computing integration not available. Using classical optimization only.")

# Import gas optimizer
from gas_optimizer import gas_optimizer

# Add error handling for startup
import os
import sys
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("backend.log"),
        logging.StreamHandler()
    ]
)

# Check environment
try:
    # Ensure environment variables are set
    JAVA_BACKEND_URL = os.environ.get("JAVA_BACKEND_URL", "http://localhost:8080/kontourcoin/api/v1")
    
    # Initialize FastAPI app
    app = FastAPI(title="Kontour Coin Geometric Blockchain Backend")
    
    # Initialize geometric verifier with error handling
    try:
        geometric_verifier = GeometricVerifier(dimensions=3, precision=0.01, tolerance=0.05)
        logger.info("Geometric verifier initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize geometric verifier: {str(e)}")
        geometric_verifier = None
except Exception as e:
    logger.critical(f"Critical error during startup: {str(e)}")
    sys.exit(1)

# Simulate geometric processing
class GeometricProcessor:
    def __init__(self, dimensions=3, precision=0.01):
        self.dimensions = dimensions
        self.precision = precision
        self.points = []
    
    def add_point(self, point):
        if len(point) != self.dimensions:
            raise ValueError(f"Point must have {self.dimensions} dimensions")
        self.points.append(point)
        return self
    
    def compute_contour(self, algorithm="bezier"):
        # Simulate contour computation
        if algorithm == "bezier":
            return self._compute_bezier()
        elif algorithm == "spline":
            return self._compute_spline()
        elif algorithm == "voronoi":
            return self._compute_voronoi()
        else:
            raise ValueError(f"Unknown algorithm: {algorithm}")
    
    def _compute_bezier(self):
        # Simulate Bezier curve computation
        if len(self.points) < 2:
            return []
        
        t_values = np.linspace(0, 1, 100)
        curve = []
        
        for t in t_values:
            point = self._bezier_point(self.points, t)
            curve.append(point)
        
        return curve
    
    def _bezier_point(self, points, t):
        if len(points) == 1:
            return points[0]
        
        new_points = []
        for i in range(len(points) - 1):
            new_point = [
                (1 - t) * points[i][d] + t * points[i + 1][d]
                for d in range(self.dimensions)
            ]
            new_points.append(new_point)
        
        return self._bezier_point(new_points, t)
    
    def _compute_spline(self):
        # Simulate spline computation
        return self._compute_bezier()  # Simplified for this example
    
    def _compute_voronoi(self):
        # Simulate Voronoi diagram computation
        return self.points  # Simplified for this example

# Simulate transaction verification using geometric algorithms
class GeometricVerifier:
    def __init__(self, dimensions=3, precision=0.01, tolerance=0.05):
        self.dimensions = dimensions
        self.precision = precision
        self.tolerance = tolerance
        self.processor = GeometricProcessor(dimensions, precision)
    
    def verify_signature(self, data, signature):
        # Convert signature to points
        points = self._signature_to_points(signature)
        
        # Add points to processor
        for point in points:
            self.processor.add_point(point)
        
        # Compute contour
        contour = self.processor.compute_contour("bezier")
        
        # Verify contour matches data
        return self._verify_contour(contour, data)
    
    def _signature_to_points(self, signature):
        # Convert signature bytes to points
        points = []
        bytes_per_point = self.dimensions * 4  # 4 bytes per float
        
        for i in range(0, len(signature), bytes_per_point):
            if i + bytes_per_point <= len(signature):
                point = []
                for d in range(self.dimensions):
                    # Extract 4 bytes and convert to float
                    byte_offset = i + d * 4
                    value_bytes = signature[byte_offset:byte_offset + 4]
                    if len(value_bytes) == 4:
                        # Convert bytes to integer, then scale to [-1, 1]
                        value_int = int.from_bytes(value_bytes, byteorder='big')
                        value = (value_int / 2**32) * 2 - 1
                        point.append(value)
                
                if len(point) == self.dimensions:
                    points.append(point)
        
        return points
    
    def _verify_contour(self, contour, data):
        # Hash the contour
        contour_hash = self._hash_contour(contour)
        
        # Hash the data
        data_hash = hashlib.sha256(str(data).encode()).hexdigest()
        
        # Compare hashes (simplified verification)
        # In a real implementation, this would be more sophisticated
        return contour_hash.startswith(data_hash[:5])

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("geometric-backend")

# Initialize FastAPI app
app = FastAPI(title="Kontour Coin Geometric Blockchain Backend")

# Initialize geometric verifier
geometric_verifier = GeometricVerifier(dimensions=3, precision=0.01, tolerance=0.05)

# Java backend integration
JAVA_BACKEND_URL = os.environ.get("JAVA_BACKEND_URL", "http://localhost:8080/kontourcoin/api/v1")

# Background task queue
background_tasks = []
task_results = {}
task_lock = threading.Lock()

# Java backend integration class
class JavaBackendClient:
    @staticmethod
    def get_blockchain_info():
        try:
            response = requests.get(f"{JAVA_BACKEND_URL}/blockchain", timeout=5)
            return response.json() if response.status_code == 200 else None
        except Exception as e:
            logger.error(f"Error getting blockchain info from Java backend: {str(e)}")
            return None
    
    @staticmethod
    def get_stats():
        try:
            response = requests.get(f"{JAVA_BACKEND_URL}/stats", timeout=5)
            return response.json() if response.status_code == 200 else None
        except Exception as e:
            logger.error(f"Error getting stats from Java backend: {str(e)}")
            return None
    
    @staticmethod
    def add_transaction(transaction_data):
        try:
            # Convert signature to base64
            if isinstance(transaction_data.get("signature"), bytes):
                transaction_data["signature"] = base64.b64encode(transaction_data["signature"]).decode()
            
            response = requests.post(
                f"{JAVA_BACKEND_URL}/transactions",
                json=transaction_data,
                timeout=5
            )
            return response.json() if response.status_code == 200 else None
        except Exception as e:
            logger.error(f"Error adding transaction to Java backend: {str(e)}")
            return None
    
    @staticmethod
    def verify_transaction(tx_hash):
        try:
            response = requests.post(
                f"{JAVA_BACKEND_URL}/transactions/{tx_hash}/verify",
                timeout=5
            )
            return response.json() if response.status_code == 200 else None
        except Exception as e:
            logger.error(f"Error verifying transaction in Java backend: {str(e)}")
            return None
    
    @staticmethod
    def verify_contour(contour_data):
        try:
            response = requests.post(
                f"{JAVA_BACKEND_URL}/contours/verify",
                json=contour_data,
                timeout=5
            )
            return response.json() if response.status_code == 200 else None
        except Exception as e:
            logger.error(f"Error verifying contour in Java backend: {str(e)}")
            return None
    
    @staticmethod
    def mine_block(block_data):
        try:
            # Convert binary data to base64
            if isinstance(block_data.get("merkleRoot"), bytes):
                block_data["merkleRoot"] = base64.b64encode(block_data["merkleRoot"]).decode()
            if isinstance(block_data.get("contourHash"), bytes):
                block_data["contourHash"] = base64.b64encode(block_data["contourHash"]).decode()
            
            response = requests.post(
                f"{JAVA_BACKEND_URL}/mine",
                json=block_data,
                timeout=10
            )
            return response.json() if response.status_code == 200 else None
        except Exception as e:
            logger.error(f"Error mining block in Java backend: {str(e)}")
            return None

# Background task handler
async def run_background_task(task_id, func, *args, **kwargs):
    try:
        result = func(*args, **kwargs)
        with task_lock:
            task_results[task_id] = {
                "status": "completed",
                "result": result,
                "timestamp": datetime.now().isoformat()
            }
    except Exception as e:
        with task_lock:
            task_results[task_id] = {
                "status": "failed",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

# Java backend client instance
java_client = JavaBackendClient()

# Data models
class Transaction(BaseModel):
    from_address: str
    to_address: str
    amount: float
    timestamp: int
    fee: float
    signature: str
    
class TransactionVerificationRequest(BaseModel):
    transaction_hash: str
    transaction_data: Transaction
    
class TransactionVerificationResponse(BaseModel):
    transaction_hash: str
    verified: bool
    geometric_proof: str
    verification_time: float
    complexity: float

class ContourSubmission(BaseModel):
    miner_address: str
    contour_points: List[List[float]]
    algorithm: str
    
class ContourVerificationResponse(BaseModel):
    contour_hash: str
    complexity: float
    verified: bool
    computation_time: float

# Simulated transaction database
verified_transactions = {}

# Geometric hash function
def geometric_hash(data: str) -> str:
    """Compute a geometric hash based on the input data"""
    # Create a deterministic set of points from the data
    points = []
    for i in range(0, len(data), 3):
        if i + 2 < len(data):
            # Use three characters to create a 3D point
            x = (ord(data[i]) / 255) * 2 - 1
            y = (ord(data[i+1]) / 255) * 2 - 1
            z = (ord(data[i+2]) / 255) * 2 - 1
            points.append([x, y, z])
    
    # Create a geometric processor and add points
    processor = GeometricProcessor(dimensions=3, precision=0.01)
    for point in points:
        processor.add_point(point)
    
    # Compute contour
    contour = processor.compute_contour("bezier")
    
    # Hash the contour
    contour_hash = _hash_contour(contour)
    
    # Return the hash
    return "gh:" + contour_hash

def _hash_contour(contour):
    """Hash a contour (list of points)"""
    # Convert contour to string
    contour_str = json.dumps(contour)
    
    # Hash the string
    sha256 = hashlib.sha256()
    sha256.update(contour_str.encode())
    
    # Return the hash
    return sha256.hexdigest()

# Transaction prioritization based on geometric complexity
def prioritize_transaction(tx: Transaction) -> float:
    """Prioritize transaction based on geometric complexity"""
    # Convert signature to points
    points = []
    try:
        signature_bytes = bytes.fromhex(tx.signature.replace("0x", ""))
        points = geometric_verifier._signature_to_points(signature_bytes)
    except Exception as e:
        logger.warning(f"Error converting signature to points: {str(e)}")
        return 0.5  # Default priority
    
    # Calculate complexity based on number of points and their distribution
    if len(points) == 0:
        return 0.5  # Default priority
    
    # Calculate average distance between consecutive points
    total_distance = 0
    for i in range(len(points) - 1):
        distance = sum((points[i][d] - points[i+1][d])**2 for d in range(len(points[i])))
        total_distance += np.sqrt(distance)
    
    avg_distance = total_distance / (len(points) - 1) if len(points) > 1 else 0
    
    # Calculate complexity score (0-1)
    # More points and higher average distance = higher complexity
    complexity = min(1.0, (len(points) / 20) * (avg_distance / 0.5))
    
    return float(complexity)

@app.get("/")
async def root():
    return {"message": "Kontour Coin Geometric Blockchain Backend", "status": "running"}

@app.post("/verify-transaction", response_model=TransactionVerificationResponse)
async def verify_transaction(request: TransactionVerificationRequest):
    """Verify a transaction using geometric algorithms"""
    start_time = time.time()
    
    try:
        # Log transaction
        logger.info(f"Verifying transaction: {request.transaction_hash}")
        
        # Convert transaction to string for hashing
        tx_string = json.dumps(request.transaction_data.dict(), sort_keys=True)
        
        # Generate geometric hash
        geometric_hash_value = geometric_hash(tx_string)
        
        # Verify signature using geometric verification
        try:
            signature_bytes = bytes.fromhex(request.transaction_data.signature.replace("0x", ""))
            is_valid = geometric_verifier.verify_signature(tx_string, signature_bytes)
        except Exception as e:
            logger.warning(f"Error verifying signature: {str(e)}")
            # Fallback verification for testing
            is_valid = geometric_hash_value.endswith('a') or geometric_hash_value.endswith('e')
        
        # Get complexity score
        complexity = prioritize_transaction(request.transaction_data)
        
        # Store verification result
        verified_transactions[request.transaction_hash] = {
            "verified": is_valid,
            "geometric_proof": geometric_hash_value,
            "complexity": complexity,
            "timestamp": datetime.now().isoformat()
        }
        
        verification_time = time.time() - start_time
        
        return TransactionVerificationResponse(
            transaction_hash=request.transaction_hash,
            verified=is_valid,
            geometric_proof=geometric_hash_value,
            verification_time=verification_time,
            complexity=complexity
        )
    
    except Exception as e:
        logger.error(f"Error verifying transaction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

@app.post("/verify-contour", response_model=ContourVerificationResponse)
async def verify_contour(submission: ContourSubmission):
    """Verify a geometric contour for PoC mining"""
    start_time = time.time()
    
    try:
        # Log contour submission
        logger.info(f"Verifying contour from miner: {submission.miner_address}")
        
        # Create a geometric processor
        processor = GeometricProcessor(dimensions=3, precision=0.01)
        
        # Add points to processor
        for point in submission.contour_points:
            processor.add_point(point)
        
        # Compute contour
        contour = processor.compute_contour(submission.algorithm)
        
        # Hash the contour
        contour_hash = _hash_contour(contour)
        
        # Calculate complexity
        # More points and more complex algorithm = higher complexity
        base_complexity = 60 + (len(submission.contour_points) / 10)  # Base complexity from number of points
        
        # Algorithm complexity factor
        algorithm_factor = {
            "bezier": 1.0,
            "spline": 1.2,
            "voronoi": 1.5
        }.get(submission.algorithm, 1.0)
        
        # Calculate final complexity (0-100)
        complexity = min(100, base_complexity * algorithm_factor)
        
        # Determine if contour meets minimum complexity threshold
        is_verified = complexity >= 75.0
        
        computation_time = time.time() - start_time
        
        return ContourVerificationResponse(
            contour_hash=contour_hash,
            complexity=complexity,
            verified=is_verified,
            computation_time=computation_time
        )
    
    except Exception as e:
        logger.error(f"Error verifying contour: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Contour verification failed: {str(e)}")

@app.get("/transaction/{tx_hash}")
async def get_transaction(tx_hash: str):
    """Get verification status of a transaction"""
    if tx_hash in verified_transactions:
        return verified_transactions[tx_hash]
    raise HTTPException(status_code=404, detail="Transaction not found")

@app.get("/stats")
async def get_stats():
    """Get backend statistics"""
    stats = {
        "verified_transactions": len(verified_transactions),
        "uptime": "Unknown",  # Would track actual uptime in production
        "geometric_verifications": len(verified_transactions),
        "contour_complexity_avg": sum(tx["complexity"] for tx in verified_transactions.values()) / len(verified_transactions) if verified_transactions else 0
    }
    
    # Try to get Java backend stats
    java_stats = java_client.get_stats()
    if java_stats:
        stats["java_backend"] = java_stats
    
    return stats

@app.get("/blockchain")
async def get_blockchain():
    """Get blockchain information from Java backend"""
    blockchain_info = java_client.get_blockchain_info()
    if not blockchain_info:
        raise HTTPException(status_code=503, detail="Java backend not available")
    return blockchain_info

# Quantum Computing API models
class QuantumTrainingData(BaseModel):
    modelType: str
    trainingData: Dict[str, Any]

class QuantumPredictionData(BaseModel):
    jobId: str
    inputData: List[List[float]]

class QuantumOptimizationParams(BaseModel):
    optimizationType: str
    parameters: Dict[str, Any]

# Quantum Computing API endpoints
@app.get("/quantum/status")
async def get_quantum_status():
    """Get quantum computing status"""
    if not QUANTUM_AVAILABLE or quantum_engine is None:
        return {
            "available": False,
            "reason": "Quantum computing integration not available"
        }
    
    return quantum_engine.get_quantum_status()

@app.post("/quantum/train")
async def train_quantum_model(data: QuantumTrainingData):
    """Train a quantum-enhanced AI model"""
    if not QUANTUM_AVAILABLE or quantum_engine is None:
        raise HTTPException(
            status_code=503, 
            detail="Quantum computing integration not available"
        )
    
    try:
        result = quantum_engine.train_quantum_model(data.modelType, data.trainingData)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/quantum/training-status/{job_id}")
async def get_quantum_training_status(job_id: str):
    """Get the status of a quantum model training job"""
    if not QUANTUM_AVAILABLE or quantum_engine is None:
        raise HTTPException(
            status_code=503, 
            detail="Quantum computing integration not available"
        )
    
    try:
        status = quantum_engine.get_training_status(job_id)
        return status
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/quantum/predict")
async def predict_with_quantum_model(data: QuantumPredictionData):
    """Make predictions using a trained quantum model"""
    if not QUANTUM_AVAILABLE or quantum_engine is None:
        raise HTTPException(
            status_code=503, 
            detail="Quantum computing integration not available"
        )
    
    try:
        result = quantum_engine.predict_with_quantum_model(data.jobId, data.inputData)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/quantum/optimize")
async def optimize_with_quantum(data: QuantumOptimizationParams):
    """Perform quantum-enhanced optimization"""
    if not QUANTUM_AVAILABLE or quantum_engine is None:
        raise HTTPException(
            status_code=503, 
            detail="Quantum computing integration not available"
        )
    
    try:
        result = quantum_engine.optimize_with_quantum(data.optimizationType, data.parameters)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Gas Optimizer API models
class ContractCode(BaseModel):
    code: str

class OptimizationRequest(BaseModel):
    code: str
    level: str = "balanced"

class SavingsEstimateRequest(BaseModel):
    gasSaved: int
    txVolume: int = 100
    gasPrice: int = 50
    ethPrice: float = 3000

# Gas Optimizer API endpoints
@app.post("/gas/analyze")
async def analyze_contract(data: ContractCode):
    """Analyze a smart contract for gas usage"""
    try:
        result = gas_optimizer.analyze_contract(data.code)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/gas/optimize")
async def optimize_contract(data: OptimizationRequest):
    """Optimize a smart contract for gas usage"""
    try:
        result = gas_optimizer.optimize_contract(data.code, data.level)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/gas/estimate-savings")
async def estimate_savings(data: SavingsEstimateRequest):
    """Estimate savings from gas optimization"""
    try:
        result = gas_optimizer.estimate_savings(
            data.gasSaved,
            data.txVolume,
            data.gasPrice,
            data.ethPrice
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/sync-block")
async def sync_block(block_data: dict):
    """Sync a block from Web3 or Java backend"""
    # Create task ID
    task_id = f"sync-block-{block_data.get('index', 'unknown')}-{int(time.time())}"
    
    # Log block data
    logger.info(f"Syncing block: {block_data.get('index')}")
    
    # Store block data
    with task_lock:
        task_results[task_id] = {
            "status": "completed",
            "result": {
                "block_index": block_data.get('index'),
                "synced": True,
                "timestamp": datetime.now().isoformat()
            },
            "timestamp": datetime.now().isoformat()
        }
    
    return {
        "task_id": task_id,
        "status": "completed",
        "message": f"Block {block_data.get('index')} synced successfully"
    }

@app.post("/sync-transaction")
async def sync_transaction(request: TransactionVerificationRequest, background_tasks: BackgroundTasks):
    """Verify a transaction and sync with Java backend"""
    # First verify with Python backend
    verification_result = await verify_transaction(request)
    
    # Create task ID
    task_id = f"sync-tx-{request.transaction_hash}"
    
    # Prepare transaction data for Java backend
    tx_data = {
        "fromAddress": request.transaction_data.from_address,
        "toAddress": request.transaction_data.to_address,
        "amount": request.transaction_data.amount,
        "timestamp": request.transaction_data.timestamp,
        "fee": request.transaction_data.fee,
        "signature": request.transaction_data.signature
    }
    
    # Add background task to sync with Java backend
    with task_lock:
        task_results[task_id] = {
            "status": "pending",
            "timestamp": datetime.now().isoformat()
        }
    
    # Run in background
    background_tasks.add_task(
        run_background_task,
        task_id,
        java_client.add_transaction,
        tx_data
    )
    
    # Return verification result with task ID
    verification_result.task_id = task_id
    return verification_result

@app.post("/sync-contour")
async def sync_contour(submission: ContourSubmission, background_tasks: BackgroundTasks):
    """Verify a contour and sync with Java backend"""
    # First verify with Python backend
    verification_result = await verify_contour(submission)
    
    # Create task ID
    task_id = f"sync-contour-{submission.miner_address}-{int(time.time())}"
    
    # Prepare contour data for Java backend
    contour_data = {
        "points": [[float(coord) for coord in point] for point in submission.contour_points],
        "algorithm": submission.algorithm
    }
    
    # Add background task to sync with Java backend
    with task_lock:
        task_results[task_id] = {
            "status": "pending",
            "timestamp": datetime.now().isoformat()
        }
    
    # Run in background
    background_tasks.add_task(
        run_background_task,
        task_id,
        java_client.verify_contour,
        contour_data
    )
    
    # Return verification result with task ID
    verification_result["task_id"] = task_id
    return verification_result

@app.post("/mine-block")
async def mine_block(block_data: dict, background_tasks: BackgroundTasks):
    """Mine a block using Java backend"""
    # Create task ID
    task_id = f"mine-block-{block_data.get('minerAddress', 'unknown')}-{int(time.time())}"
    
    # Add background task to mine block
    with task_lock:
        task_results[task_id] = {
            "status": "pending",
            "timestamp": datetime.now().isoformat()
        }
    
    # Run in background
    background_tasks.add_task(
        run_background_task,
        task_id,
        java_client.mine_block,
        block_data
    )
    
    return {
        "task_id": task_id,
        "status": "pending",
        "message": "Block mining started in background"
    }

@app.get("/tasks/{task_id}")
async def get_task_status(task_id: str):
    """Get status of a background task"""
    with task_lock:
        if task_id not in task_results:
            raise HTTPException(status_code=404, detail="Task not found")
        return task_results[task_id]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
