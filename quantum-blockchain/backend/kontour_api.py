from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Any, Optional
from kontour_coin import KontourCoin, TransactionType
from quantum_kontour_integration import QuantumKontourMode
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

# Initialize Kontour Coin blockchain
kontour = KontourCoin()

# API Models
class AccountRequest(BaseModel):
    pass  # No parameters needed

class TransactionRequest(BaseModel):
    sender: str
    recipient: str
    amount: float
    transaction_type: Optional[str] = "transfer"
    data: Optional[Dict[str, Any]] = None

class MiningRequest(BaseModel):
    miner_address: str

class VerificationRequest(BaseModel):
    transaction_hash: str

class SmartContractDeployRequest(BaseModel):
    owner_address: str
    contract_code: str
    initial_state: Dict[str, Any]

class SmartContractExecuteRequest(BaseModel):
    contract_address: str
    caller_address: str
    function: str
    args: Dict[str, Any]
    amount: Optional[float] = 0

class AITrainingRequest(BaseModel):
    owner_address: str
    model_config: Dict[str, Any]
    training_data: List[Dict[str, Any]]

class AIPredictionRequest(BaseModel):
    model_id: str
    input_data: List[float]

class OptimizationRequest(BaseModel):
    optimization_target: str

class SecurityAnalysisRequest(BaseModel):
    pass  # No parameters needed

# API Endpoints
@app.get("/")
async def root():
    return {"message": "Welcome to Kontour Coin API"}

@app.get("/blockchain/stats")
async def get_blockchain_stats():
    try:
        stats = kontour.get_blockchain_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/accounts/create")
async def create_account(request: AccountRequest):
    try:
        address = kontour.create_account()
        return {"address": address}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/accounts/{address}/balance")
async def get_account_balance(address: str):
    try:
        balance = kontour.get_account_balance(address)
        return {"address": address, "balance": balance}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/transactions/create")
async def create_transaction(request: TransactionRequest):
    try:
        # Convert transaction type string to enum
        tx_type = TransactionType(request.transaction_type)
        
        transaction = kontour.create_transaction(
            sender=request.sender,
            recipient=request.recipient,
            amount=request.amount,
            transaction_type=tx_type,
            data=request.data
        )
        
        if "error" in transaction:
            raise HTTPException(status_code=400, detail=transaction["error"])
        
        return transaction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/mining/mine-block")
async def mine_block(request: MiningRequest):
    try:
        block = kontour.mine_block(request.miner_address)
        
        if "error" in block:
            raise HTTPException(status_code=400, detail=block["error"])
        
        return block
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/transactions/verify")
async def verify_transaction(request: VerificationRequest):
    try:
        result = kontour.verify_transaction(request.transaction_hash)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/smart-contracts/deploy")
async def deploy_smart_contract(request: SmartContractDeployRequest):
    try:
        result = kontour.deploy_smart_contract(
            owner_address=request.owner_address,
            contract_code=request.contract_code,
            initial_state=request.initial_state
        )
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/smart-contracts/execute")
async def execute_smart_contract(request: SmartContractExecuteRequest):
    try:
        result = kontour.execute_smart_contract(
            contract_address=request.contract_address,
            caller_address=request.caller_address,
            function=request.function,
            args=request.args,
            amount=request.amount
        )
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/train")
async def train_ai_model(request: AITrainingRequest):
    try:
        result = kontour.train_ai_model(
            owner_address=request.owner_address,
            model_config=request.model_config,
            training_data=request.training_data
        )
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/predict")
async def predict_with_ai_model(request: AIPredictionRequest):
    try:
        result = kontour.predict_with_ai_model(
            model_id=request.model_id,
            input_data=request.input_data
        )
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/optimization/optimize")
async def optimize_blockchain(request: OptimizationRequest):
    try:
        result = kontour.optimize_blockchain(request.optimization_target)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/security/analyze")
async def analyze_blockchain_security(request: SecurityAnalysisRequest):
    try:
        result = kontour.analyze_blockchain_security()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/blockchain/blocks")
async def get_blockchain():
    try:
        return {"blocks": kontour.blockchain}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/blockchain/pending-transactions")
async def get_pending_transactions():
    try:
        return {"transactions": kontour.pending_transactions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/quantum/performance")
async def get_quantum_performance():
    try:
        return kontour.quantum.get_performance_metrics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)  # Run on port 8001 to avoid conflict with existing API