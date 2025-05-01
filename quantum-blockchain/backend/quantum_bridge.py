from flask import Flask, request, jsonify
from flask_cors import CORS
from quantum_processor import QuantumProcessor
import json

app = Flask(__name__)
CORS(app)

quantum_processor = QuantumProcessor()

@app.route('/api/quantum/key-distribution', methods=['POST'])
def generate_quantum_key():
    data = request.json
    length = data.get('length', 256)
    key = quantum_processor.quantum_key_distribution(length)
    return jsonify({'key': key})

@app.route('/api/quantum/entanglement', methods=['POST'])
def create_entanglement():
    data = request.json
    qubit1 = data.get('qubit1', 0)
    qubit2 = data.get('qubit2', 1)
    circuit = quantum_processor.quantum_entanglement(qubit1, qubit2)
    state = quantum_processor.get_quantum_state(circuit)
    return jsonify({'state': state.tolist()})

@app.route('/api/quantum/error-correction', methods=['POST'])
def apply_error_correction():
    data = request.json
    qubit = data.get('qubit', 0)
    circuit = quantum_processor.create_quantum_circuit()
    circuit = quantum_processor.quantum_error_correction(circuit, qubit)
    state = quantum_processor.get_quantum_state(circuit)
    return jsonify({'state': state.tolist()})

@app.route('/api/quantum/superposition', methods=['POST'])
def create_superposition():
    data = request.json
    qubit = data.get('qubit', 0)
    circuit = quantum_processor.quantum_superposition(qubit)
    state = quantum_processor.get_quantum_state(circuit)
    return jsonify({'state': state.tolist()})

@app.route('/api/quantum/execute', methods=['POST'])
def execute_circuit():
    data = request.json
    circuit_data = data.get('circuit', {})
    shots = data.get('shots', 1000)
    
    # Recreate circuit from data
    circuit = quantum_processor.create_quantum_circuit()
    for operation in circuit_data.get('operations', []):
        if operation['type'] == 'h':
            circuit = quantum_processor.apply_hadamard(circuit, operation['qubit'])
        elif operation['type'] == 'cx':
            circuit = quantum_processor.apply_cnot(circuit, operation['control'], operation['target'])
    
    counts = quantum_processor.execute_circuit(circuit, shots)
    return jsonify({'counts': counts})

if __name__ == '__main__':
    app.run(port=5000) 