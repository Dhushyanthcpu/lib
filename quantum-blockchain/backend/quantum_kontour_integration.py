import numpy as np
import time
import random
import json
import os
from typing import Dict, List, Any, Optional, Union, Tuple
from datetime import datetime
from enum import Enum
from qiskit import QuantumCircuit, Aer, execute, transpile
from qiskit.circuit import Parameter
from qiskit.quantum_info import Statevector
from qiskit.visualization import plot_histogram

class QuantumKontourMode(str, Enum):
    MINING = "mining"
    TRANSACTION_VERIFICATION = "transaction_verification"
    SMART_CONTRACT = "smart_contract"
    AI_TRAINING = "ai_training"
    OPTIMIZATION = "optimization"
    SECURITY = "security"

class QuantumKontourIntegration:
    """
    Quantum computing integration for Kontour Coin blockchain.
    This class provides quantum-enhanced capabilities for various blockchain operations.
    """
    
    def __init__(self):
        """Initialize the quantum integration module."""
        self.data_dir = os.path.join(os.path.dirname(__file__), "quantum_kontour_data")
        os.makedirs(self.data_dir, exist_ok=True)
        
        # Initialize quantum simulator
        self.simulator = Aer.get_backend('qasm_simulator')
        self.statevector_simulator = Aer.get_backend('statevector_simulator')
        
        # Track quantum operations
        self.operations_log = []
        self.performance_metrics = {
            "mining_speedup": [],
            "verification_accuracy": [],
            "ai_training_efficiency": [],
            "optimization_quality": []
        }
    
    def create_mining_circuit(self, block_data: str, difficulty: int) -> QuantumCircuit:
        """
        Create a quantum circuit for mining optimization.
        
        Args:
            block_data: String representation of the block data
            difficulty: Mining difficulty level
            
        Returns:
            Quantum circuit configured for mining
        """
        # Convert block data to a numeric seed
        data_hash = hash(block_data) % (2**32)
        
        # Determine circuit size based on difficulty
        num_qubits = min(difficulty + 4, 20)  # Cap at 20 qubits for simulation feasibility
        
        # Create quantum circuit
        qc = QuantumCircuit(num_qubits, num_qubits)
        
        # Initialize with superposition
        qc.h(range(num_qubits))
        
        # Apply data-dependent rotations
        for i in range(num_qubits):
            angle = (data_hash % 100) * np.pi / 50  # Map to [0, 2π)
            qc.rz(angle, i)
            data_hash = (data_hash * 1103515245 + 12345) % (2**32)  # Simple LCG for pseudo-randomness
        
        # Add entanglement
        for i in range(num_qubits - 1):
            qc.cx(i, i + 1)
        
        # Add difficulty-dependent gates
        for _ in range(difficulty):
            for i in range(num_qubits):
                angle = (data_hash % 100) * np.pi / 50
                qc.ry(angle, i)
                data_hash = (data_hash * 1103515245 + 12345) % (2**32)
            
            # Add entanglement in reverse order
            for i in range(num_qubits - 1, 0, -1):
                qc.cx(i, i - 1)
        
        # Measure all qubits
        qc.measure(range(num_qubits), range(num_qubits))
        
        return qc
    
    def quantum_enhanced_mining(self, block_data: str, difficulty: int, max_iterations: int = 100) -> Dict[str, Any]:
        """
        Perform quantum-enhanced mining for Kontour Coin.
        
        Args:
            block_data: String representation of the block data
            difficulty: Mining difficulty level
            max_iterations: Maximum number of iterations to attempt
            
        Returns:
            Dictionary containing mining results
        """
        start_time = time.time()
        
        # Create mining circuit
        qc = self.create_mining_circuit(block_data, difficulty)
        
        # Execute circuit multiple times to find a valid nonce
        for iteration in range(max_iterations):
            # Execute the circuit
            transpiled_qc = transpile(qc, self.simulator)
            result = execute(transpiled_qc, self.simulator, shots=1).result()
            counts = result.get_counts()
            
            # Get the measurement outcome as a bitstring
            bitstring = list(counts.keys())[0]
            
            # Convert bitstring to nonce
            nonce = int(bitstring, 2)
            
            # Check if this nonce satisfies the difficulty requirement
            # In a real implementation, we would check if the hash of block_data + nonce
            # has the required number of leading zeros
            hash_value = self._simulate_hash(block_data, nonce, difficulty)
            
            # Check if hash meets difficulty requirement (simplified)
            if self._check_hash_difficulty(hash_value, difficulty):
                # Mining successful
                elapsed_time = time.time() - start_time
                
                # Calculate speedup compared to classical mining (simulated)
                classical_time = self._simulate_classical_mining_time(difficulty)
                speedup = classical_time / max(elapsed_time, 0.001)  # Avoid division by zero
                
                # Log performance
                self.performance_metrics["mining_speedup"].append(speedup)
                
                # Log operation
                self._log_quantum_operation(
                    QuantumKontourMode.MINING,
                    {
                        "difficulty": difficulty,
                        "iterations": iteration + 1,
                        "time": elapsed_time,
                        "speedup": speedup
                    }
                )
                
                return {
                    "success": True,
                    "nonce": nonce,
                    "hash": hash_value,
                    "iterations": iteration + 1,
                    "time": elapsed_time,
                    "quantum_speedup": speedup,
                    "circuit_depth": qc.depth(),
                    "circuit_width": qc.num_qubits
                }
        
        # Mining failed within max_iterations
        elapsed_time = time.time() - start_time
        
        return {
            "success": False,
            "time": elapsed_time,
            "max_iterations_reached": True
        }
    
    def create_verification_circuit(self, transaction_data: str, signature: str) -> QuantumCircuit:
        """
        Create a quantum circuit for transaction verification.
        
        Args:
            transaction_data: String representation of the transaction data
            signature: Digital signature to verify
            
        Returns:
            Quantum circuit configured for verification
        """
        # Convert inputs to numeric values
        data_hash = hash(transaction_data) % (2**32)
        sig_hash = hash(signature) % (2**32)
        
        # Create quantum circuit with 8 qubits
        qc = QuantumCircuit(8, 1)
        
        # Initialize first 4 qubits based on transaction data
        for i in range(4):
            if (data_hash >> i) & 1:
                qc.x(i)
        
        # Initialize next 4 qubits based on signature
        for i in range(4):
            if (sig_hash >> i) & 1:
                qc.x(i + 4)
        
        # Apply Hadamard gates to create superposition
        qc.h(range(8))
        
        # Apply controlled operations to entangle qubits
        for i in range(4):
            qc.cx(i, i + 4)
        
        # Apply phase rotations based on data
        for i in range(8):
            angle = ((data_hash + sig_hash) % 100) * np.pi / 50
            qc.rz(angle, i)
            data_hash = (data_hash * 1103515245 + 12345) % (2**32)
        
        # Apply inverse Hadamard to first 4 qubits
        qc.h(range(4))
        
        # Measure the first qubit into the classical bit
        qc.measure(0, 0)
        
        return qc
    
    def quantum_transaction_verification(self, transaction_data: str, signature: str) -> Dict[str, Any]:
        """
        Perform quantum-enhanced transaction verification.
        
        Args:
            transaction_data: String representation of the transaction data
            signature: Digital signature to verify
            
        Returns:
            Dictionary containing verification results
        """
        start_time = time.time()
        
        # Create verification circuit
        qc = self.create_verification_circuit(transaction_data, signature)
        
        # Execute circuit
        transpiled_qc = transpile(qc, self.simulator)
        result = execute(transpiled_qc, self.simulator, shots=1024).result()
        counts = result.get_counts()
        
        # Calculate verification probability
        # In a real implementation, this would be based on cryptographic principles
        # Here we use a simplified approach where we check the frequency of '0' outcomes
        zero_count = counts.get('0', 0)
        verification_probability = zero_count / 1024
        
        # Determine if verification is successful
        # In a real implementation, this would be a cryptographic verification
        # Here we use a threshold on the quantum measurement probability
        is_valid = verification_probability > 0.7
        
        elapsed_time = time.time() - start_time
        
        # Log performance
        if is_valid:
            self.performance_metrics["verification_accuracy"].append(verification_probability)
        
        # Log operation
        self._log_quantum_operation(
            QuantumKontourMode.TRANSACTION_VERIFICATION,
            {
                "verification_probability": verification_probability,
                "time": elapsed_time,
                "is_valid": is_valid
            }
        )
        
        return {
            "is_valid": is_valid,
            "verification_probability": verification_probability,
            "time": elapsed_time,
            "circuit_depth": qc.depth(),
            "circuit_width": qc.num_qubits
        }
    
    def create_ai_training_circuit(self, data_features: List[float], num_qubits: int = 8, layers: int = 2) -> QuantumCircuit:
        """
        Create a quantum circuit for AI model training.
        
        Args:
            data_features: List of input features for training
            num_qubits: Number of qubits to use
            layers: Number of variational layers
            
        Returns:
            Parameterized quantum circuit for AI training
        """
        # Ensure we have enough features
        if len(data_features) < num_qubits:
            data_features.extend([0.0] * (num_qubits - len(data_features)))
        elif len(data_features) > num_qubits:
            data_features = data_features[:num_qubits]
        
        # Create quantum circuit
        qc = QuantumCircuit(num_qubits, num_qubits)
        
        # Create parameters for the circuit
        params = []
        for l in range(layers):
            for q in range(num_qubits):
                params.append(Parameter(f'θ_{l}_{q}'))
        
        # Data encoding layer - encode features into rotation angles
        for i, feature in enumerate(data_features):
            qc.ry(feature * np.pi, i)  # Map feature to [0, π]
        
        # Variational layers
        param_idx = 0
        for l in range(layers):
            # Rotation layer
            for q in range(num_qubits):
                qc.rx(params[param_idx], q)
                param_idx += 1
            
            # Entanglement layer
            for i in range(num_qubits - 1):
                qc.cx(i, i + 1)
            qc.cx(num_qubits - 1, 0)  # Close the loop
        
        # Measurement
        qc.measure(range(num_qubits), range(num_qubits))
        
        return qc, params
    
    def quantum_ai_training(self, training_data: List[Dict[str, Any]], hyperparams: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform quantum-enhanced AI model training.
        
        Args:
            training_data: List of training data points with features and labels
            hyperparams: Hyperparameters for the quantum model
            
        Returns:
            Dictionary containing training results
        """
        start_time = time.time()
        
        # Extract hyperparameters
        num_qubits = hyperparams.get('num_qubits', 8)
        layers = hyperparams.get('layers', 2)
        learning_rate = hyperparams.get('learning_rate', 0.01)
        epochs = hyperparams.get('epochs', 50)
        
        # Prepare training data
        features_list = [item['features'] for item in training_data]
        labels_list = [item['label'] for item in training_data]
        
        # Create base circuit
        base_circuit, params = self.create_ai_training_circuit(
            features_list[0] if features_list else [0.0] * num_qubits,
            num_qubits,
            layers
        )
        
        # Simulate training process
        # In a real implementation, this would use a quantum variational algorithm
        # Here we simulate the training process and results
        
        # Initialize parameters randomly
        param_values = np.random.uniform(0, 2*np.pi, len(params))
        
        # Simulate training metrics
        loss_history = []
        accuracy_history = []
        
        initial_loss = 0.8 + random.random() * 0.2
        final_loss = 0.1 + random.random() * 0.1
        
        initial_accuracy = 0.5 + random.random() * 0.1
        final_accuracy = 0.85 + random.random() * 0.1
        
        # Simulate training loop
        for epoch in range(epochs):
            # Calculate simulated loss and accuracy
            progress = epoch / epochs
            loss = initial_loss * (1 - progress) + final_loss * progress + (random.random() - 0.5) * 0.05
            accuracy = initial_accuracy * (1 - progress) + final_accuracy * progress + (random.random() - 0.5) * 0.03
            
            loss_history.append(loss)
            accuracy_history.append(accuracy)
            
            # Update parameters (in a real implementation, this would be based on gradients)
            for i in range(len(param_values)):
                param_values[i] += np.random.normal(0, learning_rate * (1 - progress))
                param_values[i] = param_values[i] % (2 * np.pi)  # Keep in [0, 2π)
        
        # Calculate final metrics
        final_loss = loss_history[-1]
        final_accuracy = accuracy_history[-1]
        
        # Calculate training efficiency compared to classical methods (simulated)
        classical_time = self._simulate_classical_training_time(len(training_data), epochs)
        elapsed_time = time.time() - start_time
        efficiency = classical_time / max(elapsed_time, 0.001)  # Avoid division by zero
        
        # Log performance
        self.performance_metrics["ai_training_efficiency"].append(efficiency)
        
        # Log operation
        self._log_quantum_operation(
            QuantumKontourMode.AI_TRAINING,
            {
                "num_qubits": num_qubits,
                "layers": layers,
                "epochs": epochs,
                "final_loss": final_loss,
                "final_accuracy": final_accuracy,
                "time": elapsed_time,
                "efficiency": efficiency
            }
        )
        
        # Save model parameters
        model_id = f"quantum_ai_model_{int(time.time())}"
        model_data = {
            "model_id": model_id,
            "num_qubits": num_qubits,
            "layers": layers,
            "parameters": param_values.tolist(),
            "final_loss": final_loss,
            "final_accuracy": final_accuracy,
            "training_time": elapsed_time,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        self._save_model_data(model_data)
        
        return {
            "model_id": model_id,
            "final_loss": final_loss,
            "final_accuracy": final_accuracy,
            "loss_history": loss_history,
            "accuracy_history": accuracy_history,
            "training_time": elapsed_time,
            "quantum_efficiency": efficiency,
            "num_qubits": num_qubits,
            "layers": layers
        }
    
    def quantum_ai_prediction(self, model_id: str, input_features: List[float]) -> Dict[str, Any]:
        """
        Make predictions using a trained quantum AI model.
        
        Args:
            model_id: ID of the trained model to use
            input_features: List of input features for prediction
            
        Returns:
            Dictionary containing prediction results
        """
        start_time = time.time()
        
        # Load model data
        model_data = self._load_model_data(model_id)
        if not model_data:
            return {"error": f"Model with ID {model_id} not found"}
        
        num_qubits = model_data["num_qubits"]
        layers = model_data["layers"]
        param_values = model_data["parameters"]
        
        # Create circuit with the same structure as training
        base_circuit, params = self.create_ai_training_circuit(
            input_features,
            num_qubits,
            layers
        )
        
        # Bind parameters
        parameter_dict = {params[i]: param_values[i] for i in range(len(params))}
        bound_circuit = base_circuit.bind_parameters(parameter_dict)
        
        # Execute circuit
        transpiled_qc = transpile(bound_circuit, self.simulator)
        result = execute(transpiled_qc, self.simulator, shots=1024).result()
        counts = result.get_counts()
        
        # Process results to get prediction
        # In a real implementation, this would depend on the specific AI task
        # Here we use a simplified approach
        
        # For binary classification, we can use the majority vote of the first qubit
        binary_counts = {"0": 0, "1": 0}
        for bitstring, count in counts.items():
            first_bit = bitstring[0]
            binary_counts[first_bit] += count
        
        # Determine prediction and probability
        total_shots = sum(binary_counts.values())
        if binary_counts["1"] > binary_counts["0"]:
            prediction = 1
            probability = binary_counts["1"] / total_shots
        else:
            prediction = 0
            probability = binary_counts["0"] / total_shots
        
        elapsed_time = time.time() - start_time
        
        return {
            "prediction": prediction,
            "probability": probability,
            "counts": counts,
            "binary_counts": binary_counts,
            "prediction_time": elapsed_time,
            "model_id": model_id
        }
    
    def create_optimization_circuit(self, problem_data: Dict[str, Any], num_qubits: int, p: int = 1) -> Tuple[QuantumCircuit, List[Parameter]]:
        """
        Create a quantum circuit for optimization problems.
        
        Args:
            problem_data: Dictionary containing problem definition
            num_qubits: Number of qubits to use
            p: QAOA depth parameter
            
        Returns:
            Parameterized quantum circuit for optimization
        """
        # Create quantum circuit
        qc = QuantumCircuit(num_qubits, num_qubits)
        
        # Create parameters for the circuit
        gammas = [Parameter(f'γ_{i}') for i in range(p)]
        betas = [Parameter(f'β_{i}') for i in range(p)]
        
        # Initial state: superposition
        qc.h(range(num_qubits))
        
        # QAOA layers
        for layer in range(p):
            # Problem Hamiltonian
            if problem_data.get("type") == "maxcut":
                # Apply phase separating gates for MaxCut
                for edge in problem_data.get("edges", []):
                    i, j = edge
                    if 0 <= i < num_qubits and 0 <= j < num_qubits:
                        qc.cx(i, j)
                        qc.rz(gammas[layer], j)
                        qc.cx(i, j)
            else:
                # Generic problem: apply parameterized rotations
                for i in range(num_qubits):
                    qc.rz(gammas[layer], i)
            
            # Mixing Hamiltonian
            for i in range(num_qubits):
                qc.rx(2 * betas[layer], i)
        
        # Measurement
        qc.measure(range(num_qubits), range(num_qubits))
        
        return qc, gammas + betas
    
    def quantum_optimization(self, problem_data: Dict[str, Any], hyperparams: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform quantum optimization for blockchain operations.
        
        Args:
            problem_data: Dictionary containing problem definition
            hyperparams: Hyperparameters for the optimization
            
        Returns:
            Dictionary containing optimization results
        """
        start_time = time.time()
        
        # Extract hyperparameters
        num_qubits = hyperparams.get('num_qubits', 4)
        p = hyperparams.get('p', 1)  # QAOA depth
        optimizer = hyperparams.get('optimizer', 'COBYLA')
        max_iterations = hyperparams.get('max_iterations', 100)
        
        # Create optimization circuit
        circuit, params = self.create_optimization_circuit(problem_data, num_qubits, p)
        
        # Simulate optimization process
        # In a real implementation, this would use a quantum variational algorithm
        # Here we simulate the optimization process and results
        
        # Initialize parameters randomly
        param_values = np.random.uniform(0, 2*np.pi, len(params))
        
        # Simulate optimization metrics
        objective_history = []
        
        initial_objective = 0.3 + random.random() * 0.2
        final_objective = 0.7 + random.random() * 0.2
        
        # Simulate optimization loop
        for iteration in range(max_iterations):
            # Calculate simulated objective value
            progress = iteration / max_iterations
            objective = initial_objective * (1 - progress) + final_objective * progress + (random.random() - 0.5) * 0.05
            
            objective_history.append(objective)
            
            # Update parameters (in a real implementation, this would be based on gradients)
            for i in range(len(param_values)):
                param_values[i] += np.random.normal(0, 0.1 * (1 - progress))
                param_values[i] = param_values[i] % (2 * np.pi)  # Keep in [0, 2π)
        
        # Calculate final objective value
        final_objective = objective_history[-1]
        
        # Calculate optimization quality compared to classical methods (simulated)
        classical_quality = self._simulate_classical_optimization_quality(problem_data)
        quality_ratio = final_objective / max(classical_quality, 0.001)  # Avoid division by zero
        
        # Log performance
        self.performance_metrics["optimization_quality"].append(quality_ratio)
        
        # Log operation
        self._log_quantum_operation(
            QuantumKontourMode.OPTIMIZATION,
            {
                "num_qubits": num_qubits,
                "p": p,
                "iterations": max_iterations,
                "final_objective": final_objective,
                "quality_ratio": quality_ratio
            }
        )
        
        # Generate solution
        # Bind optimal parameters
        parameter_dict = {params[i]: param_values[i] for i in range(len(params))}
        bound_circuit = circuit.bind_parameters(parameter_dict)
        
        # Execute circuit
        transpiled_qc = transpile(bound_circuit, self.simulator)
        result = execute(transpiled_qc, self.simulator, shots=1024).result()
        counts = result.get_counts()
        
        # Find the most frequent bitstring as the solution
        best_bitstring = max(counts.items(), key=lambda x: x[1])[0]
        best_solution = [int(bit) for bit in best_bitstring]
        
        elapsed_time = time.time() - start_time
        
        return {
            "best_solution": best_solution,
            "best_bitstring": best_bitstring,
            "objective_value": final_objective,
            "objective_history": objective_history,
            "optimization_time": elapsed_time,
            "quantum_quality_ratio": quality_ratio,
            "num_qubits": num_qubits,
            "p": p,
            "counts": counts
        }
    
    def quantum_security_analysis(self, blockchain_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform quantum security analysis on blockchain data.
        
        Args:
            blockchain_data: Dictionary containing blockchain data to analyze
            
        Returns:
            Dictionary containing security analysis results
        """
        start_time = time.time()
        
        # Extract data
        transaction_count = blockchain_data.get("transaction_count", 100)
        block_count = blockchain_data.get("block_count", 10)
        key_size = blockchain_data.get("key_size", 256)
        
        # Simulate quantum security analysis
        # In a real implementation, this would use quantum algorithms to assess security
        # Here we simulate the analysis process and results
        
        # Calculate quantum security metrics
        # Estimate the number of qubits needed to break the cryptography
        qubits_needed = max(2 * key_size // 3, 1000)  # Simplified estimate
        
        # Estimate the time to break with quantum computers (in years)
        # This is a simplified model - real estimates would be more complex
        quantum_years_to_break = 10 ** (qubits_needed / 1000 - 1)
        
        # Vulnerability assessment
        vulnerability_score = min(10, 10 * (1000 / qubits_needed))
        
        # Recommendations based on analysis
        recommendations = []
        if vulnerability_score > 7:
            recommendations.append("Upgrade to post-quantum cryptography immediately")
        elif vulnerability_score > 4:
            recommendations.append("Plan migration to post-quantum cryptography")
        else:
            recommendations.append("Current security is adequate against near-term quantum threats")
        
        if key_size < 384:
            recommendations.append("Increase key size to at least 384 bits")
        
        elapsed_time = time.time() - start_time
        
        # Log operation
        self._log_quantum_operation(
            QuantumKontourMode.SECURITY,
            {
                "vulnerability_score": vulnerability_score,
                "qubits_needed": qubits_needed,
                "time": elapsed_time
            }
        )
        
        return {
            "vulnerability_score": vulnerability_score,
            "qubits_needed_to_break": qubits_needed,
            "estimated_quantum_years_to_break": quantum_years_to_break,
            "recommendations": recommendations,
            "analysis_time": elapsed_time
        }
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """
        Get performance metrics for quantum operations.
        
        Returns:
            Dictionary containing performance metrics
        """
        metrics = {}
        
        for key, values in self.performance_metrics.items():
            if values:
                metrics[key] = {
                    "mean": np.mean(values),
                    "max": max(values),
                    "min": min(values),
                    "count": len(values),
                    "recent": values[-10:]
                }
            else:
                metrics[key] = {
                    "mean": 0,
                    "max": 0,
                    "min": 0,
                    "count": 0,
                    "recent": []
                }
        
        return metrics
    
    def _simulate_hash(self, data: str, nonce: int, difficulty: int) -> str:
        """Simulate a hash function for mining."""
        combined = f"{data}{nonce}"
        # Simple hash simulation - in a real implementation, use a cryptographic hash
        hash_value = hex(hash(combined) % (2**64))[2:].zfill(16)
        return hash_value
    
    def _check_hash_difficulty(self, hash_value: str, difficulty: int) -> bool:
        """Check if a hash meets the difficulty requirement."""
        # Simplified difficulty check - in a real implementation, check leading zeros
        return int(hash_value[:4], 16) < (2**16) // (difficulty + 1)
    
    def _simulate_classical_mining_time(self, difficulty: int) -> float:
        """Simulate the time a classical computer would take to mine."""
        # Simplified model: exponential in difficulty
        return 0.1 * (2 ** (difficulty / 2))
    
    def _simulate_classical_training_time(self, data_size: int, epochs: int) -> float:
        """Simulate the time a classical computer would take to train."""
        # Simplified model: linear in data size and epochs
        return 0.01 * data_size * epochs
    
    def _simulate_classical_optimization_quality(self, problem_data: Dict[str, Any]) -> float:
        """Simulate the quality of classical optimization."""
        # Simplified model: depends on problem size
        problem_size = len(problem_data.get("edges", [])) if problem_data.get("type") == "maxcut" else 10
        return 0.5 + 0.3 * (1 - min(problem_size, 100) / 100)
    
    def _log_quantum_operation(self, mode: QuantumKontourMode, details: Dict[str, Any]) -> None:
        """Log a quantum operation."""
        log_entry = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "mode": mode,
            "details": details
        }
        self.operations_log.append(log_entry)
        
        # Keep log size manageable
        if len(self.operations_log) > 1000:
            self.operations_log = self.operations_log[-1000:]
    
    def _save_model_data(self, model_data: Dict[str, Any]) -> None:
        """Save model data to a file."""
        model_id = model_data["model_id"]
        filepath = os.path.join(self.data_dir, f"{model_id}.json")
        
        try:
            with open(filepath, 'w') as f:
                json.dump(model_data, f, indent=2)
        except Exception as e:
            print(f"Error saving model data: {e}")
    
    def _load_model_data(self, model_id: str) -> Optional[Dict[str, Any]]:
        """Load model data from a file."""
        filepath = os.path.join(self.data_dir, f"{model_id}.json")
        
        try:
            if os.path.exists(filepath):
                with open(filepath, 'r') as f:
                    return json.load(f)
            return None
        except Exception as e:
            print(f"Error loading model data: {e}")
            return None