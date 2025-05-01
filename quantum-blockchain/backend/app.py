from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Any, Optional
from quantum.quantum_circuit import QuantumTransactionVerifier
from quantum.grover_mining import QuantumMiner
from quantum.phase_estimation import QuantumPhaseEstimator
from quantum_circuit_optimizer import QuantumCircuitOptimizer
from quantum_ml import QuantumMLModel, QuantumMLAlgorithm
import hashlib
import time

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TransactionRequest(BaseModel):
    sender: str
    recipient: str
    amount: int
    fee: int
    timestamp: int
    balance: int
    expected_hash: str

class MiningRequest(BaseModel):
    block_data: str
    target_difficulty: int
    max_iterations: int = 100

class DifficultyRequest(BaseModel):
    network_load: float

class CircuitGenerationRequest(BaseModel):
    num_qubits: int
    complexity: str

class CircuitOptimizationRequest(BaseModel):
    circuit: Dict[str, Any]
    technique: str
    model_id: Optional[str] = None
    learning_rate: Optional[float] = 0.001
    epochs: Optional[int] = 50

class StateEvolutionRequest(BaseModel):
    circuit: Dict[str, Any]

class CircuitDiagramRequest(BaseModel):
    circuit: Dict[str, Any]

class FidelityRequest(BaseModel):
    circuit1: Dict[str, Any]
    circuit2: Dict[str, Any]

class WorkflowRequest(BaseModel):
    difficulty: int = 4
    auto_mine: bool = True
    verification_algorithm: str = "bezier"

class Web3TransactionRequest(BaseModel):
    transaction_hash: str
    from_address: str
    to_address: str
    value: str
    gas_used: Optional[str] = None
    block_number: Optional[int] = None

class QuantumMLTrainingRequest(BaseModel):
    model_id: str
    dataset: Dict[str, Any]
    hyperparams: Dict[str, Any] = {}

class QuantumMLPredictionRequest(BaseModel):
    model_id: str
    input_data: Dict[str, Any]

# Helper function for algorithm descriptions
def get_algorithm_description(algorithm: QuantumMLAlgorithm) -> str:
    descriptions = {
        QuantumMLAlgorithm.QNN: "Quantum Neural Networks use quantum circuits with trainable parameters to perform machine learning tasks, leveraging quantum effects for potentially exponential speedups.",
        QuantumMLAlgorithm.VQE: "Variational Quantum Eigensolver is a hybrid quantum-classical algorithm for finding the ground state energy of molecules and materials.",
        QuantumMLAlgorithm.QAOA: "Quantum Approximate Optimization Algorithm is designed to find approximate solutions to combinatorial optimization problems.",
        QuantumMLAlgorithm.QSVM: "Quantum Support Vector Machine uses quantum feature maps to classify data in a high-dimensional Hilbert space.",
        QuantumMLAlgorithm.QBM: "Quantum Boltzmann Machine is a quantum version of the classical Boltzmann machine, used for generative modeling and sampling.",
        QuantumMLAlgorithm.QGAN: "Quantum Generative Adversarial Network combines quantum and classical components to generate data distributions."
    }
    return descriptions.get(algorithm, "No description available")

# Initialize components
verifier = QuantumTransactionVerifier()
miner = QuantumMiner()
estimator = QuantumPhaseEstimator()
circuit_optimizer = QuantumCircuitOptimizer()
quantum_ml = QuantumMLModel()

# Workflow state
workflow_running = False
workflow_stats = {
    "transactions_processed": 0,
    "blocks_mined": 0,
    "sync_errors": 0,
    "contours_verified": 0
}

@app.post("/verify_transaction")
async def verify_transaction(request: TransactionRequest):
    try:
        # Prepare transaction data
        tx_data = f"{request.sender}:{request.recipient}:{request.amount}:{request.fee}:{request.timestamp}".encode()
        expected_hash = bytes.fromhex(request.expected_hash)
        key_seed = int(hashlib.sha256(tx_data).hexdigest(), 16) % 2**32

        # Run quantum verification
        is_valid = verifier.verify_transaction(tx_data, request.balance, expected_hash, key_seed)
        
        # Update workflow stats if workflow is running
        if workflow_running:
            workflow_stats["transactions_processed"] += 1
        
        return {
            "valid": is_valid,
            "circuit_diagram": str(verifier.get_circuit_diagram()),
            "tx_hash": hashlib.sha256(tx_data).hexdigest()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/mine_block")
async def mine_block(request: MiningRequest):
    try:
        # Run Grover's algorithm for mining
        nonce, hash_value = miner.find_nonce(
            request.block_data.encode(),
            request.target_difficulty,
            request.max_iterations
        )
        
        # Update workflow stats if workflow is running
        if workflow_running:
            workflow_stats["blocks_mined"] += 1
        
        return {
            "nonce": nonce,
            "hash_value": hash_value,
            "circuit_diagram": str(miner.get_circuit_diagram())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/estimate_difficulty")
async def estimate_difficulty(request: DifficultyRequest):
    try:
        # Run quantum phase estimation for difficulty adjustment
        difficulty = estimator.estimate_phase(request.network_load)
        
        return {
            "difficulty": difficulty,
            "circuit_diagram": str(estimator.get_circuit_diagram())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Workflow management endpoints
@app.post("/workflow/start")
async def start_workflow(request: WorkflowRequest):
    global workflow_running
    try:
        workflow_running = True
        return {"status": "started", "config": request.dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/workflow/stop")
async def stop_workflow():
    global workflow_running
    try:
        workflow_running = False
        return {"status": "stopped"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/workflow/status")
async def get_workflow_status():
    try:
        return {"running": workflow_running}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/workflow/stats")
async def get_workflow_stats():
    try:
        return workflow_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Quantum circuit optimization endpoints
@app.post("/quantum/generate_circuit")
async def generate_circuit(request: CircuitGenerationRequest):
    try:
        circuit = circuit_optimizer.generate_random_circuit(
            request.num_qubits,
            request.complexity
        )
        return {"circuit": circuit}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/quantum/optimize_circuit")
async def optimize_circuit(request: CircuitOptimizationRequest):
    try:
        result = circuit_optimizer.optimize_circuit(
            request.circuit,
            request.technique,
            request.model_id,
            request.learning_rate,
            request.epochs
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/quantum/state_evolution")
async def get_state_evolution(request: StateEvolutionRequest):
    try:
        states = circuit_optimizer.get_state_evolution(request.circuit)
        return {"states": states}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/quantum/circuit_diagram")
async def get_circuit_diagram(request: CircuitDiagramRequest):
    try:
        # Convert to Qiskit circuit and get diagram
        qiskit_circuit = circuit_optimizer._layers_to_circuit(request.circuit)
        diagram = qiskit_circuit.draw(output='text')
        return {"diagram": str(diagram)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/quantum/calculate_fidelity")
async def calculate_fidelity(request: FidelityRequest):
    try:
        # In a real implementation, we would calculate the actual fidelity
        # between the two circuits. For now, we'll return a simulated value.
        fidelity = 0.8 + 0.2 * (1 - abs(request.circuit1["depth"] - request.circuit2["depth"]) / 
                               max(request.circuit1["depth"], request.circuit2["depth"]))
        return {"fidelity": fidelity}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/quantum/available_models")
async def get_available_models():
    try:
        models = []
        for model_id, model_info in circuit_optimizer.available_models.items():
            models.append({
                "id": model_id,
                "name": model_info["name"],
                "type": model_info["type"],
                "parameters": model_info["parameters"]
            })
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/web3/verify_transaction")
async def verify_web3_transaction(request: Web3TransactionRequest):
    try:
        # In a real implementation, this would verify the transaction on the blockchain
        # For now, we'll simulate verification
        
        # Simulate transaction verification
        is_valid = True
        confirmation_blocks = 3
        
        # Generate a simulated receipt
        receipt = {
            "transaction_hash": request.transaction_hash,
            "from_address": request.from_address,
            "to_address": request.to_address,
            "value": request.value,
            "gas_used": request.gas_used or "100000",
            "block_number": request.block_number or 12345678,
            "confirmations": confirmation_blocks,
            "timestamp": int(time.time()),
            "status": "confirmed",
            "is_valid": is_valid
        }
        
        return receipt
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Quantum Machine Learning endpoints
@app.get("/quantum-ml/available_models")
async def get_available_qml_models():
    try:
        models = []
        for model_id, model_info in quantum_ml.available_models.items():
            models.append({
                "id": model_id,
                "name": model_info["name"],
                "type": model_info["type"],
                "algorithm": model_info["algorithm"],
                "parameters": model_info["parameters"]
            })
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/quantum-ml/train")
async def train_quantum_ml_model(request: QuantumMLTrainingRequest):
    try:
        result = quantum_ml.train_quantum_model(
            request.model_id,
            request.dataset,
            request.hyperparams
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/quantum-ml/predict")
async def predict_with_quantum_ml(request: QuantumMLPredictionRequest):
    try:
        result = quantum_ml.predict(
            request.model_id,
            request.input_data
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/quantum-ml/algorithms")
async def get_quantum_ml_algorithms():
    try:
        algorithms = [
            {
                "id": algo.value,
                "name": algo.name,
                "description": get_algorithm_description(algo)
            }
            for algo in QuantumMLAlgorithm
        ]
        return {"algorithms": algorithms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 