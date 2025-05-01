@extends('layouts.admin')

@section('title', 'AI Models')

@section('content')
    <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">All AI Models</h5>
            <div>
                <button class="btn btn-sm btn-quantum" data-bs-toggle="modal" data-bs-target="#createModelModal">
                    <i class="fas fa-plus"></i> Train New Model
                </button>
            </div>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Model ID</th>
                            <th>Owner</th>
                            <th>Accuracy</th>
                            <th>Training Time</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($aiModels as $model)
                            <tr>
                                <td>{{ substr($model->model_id, 0, 15) }}...</td>
                                <td>{{ substr($model->owner, 0, 15) }}...</td>
                                <td>{{ number_format($model->training_result['final_accuracy'] * 100, 2) }}%</td>
                                <td>{{ number_format($model->training_result['training_time'], 2) }}s</td>
                                <td>{{ $model->created_at->format('Y-m-d H:i:s') }}</td>
                                <td>
                                    <button class="btn btn-sm btn-quantum" data-bs-toggle="modal" data-bs-target="#modelModal{{ $model->id }}">
                                        <i class="fas fa-eye"></i> View
                                    </button>
                                    <button class="btn btn-sm btn-primary predict-btn" data-model-id="{{ $model->model_id }}">
                                        <i class="fas fa-brain"></i> Predict
                                    </button>
                                </td>
                            </tr>
                            
                            <!-- Model Modal -->
                            <div class="modal fade" id="modelModal{{ $model->id }}" tabindex="-1" aria-labelledby="modelModalLabel{{ $model->id }}" aria-hidden="true">
                                <div class="modal-dialog modal-lg">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title" id="modelModalLabel{{ $model->id }}">AI Model Details</h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div class="modal-body">
                                            <div class="row mb-3">
                                                <div class="col-md-4 fw-bold">Model ID:</div>
                                                <div class="col-md-8">{{ $model->model_id }}</div>
                                            </div>
                                            <div class="row mb-3">
                                                <div class="col-md-4 fw-bold">Owner:</div>
                                                <div class="col-md-8">{{ $model->owner }}</div>
                                            </div>
                                            <div class="row mb-3">
                                                <div class="col-md-4 fw-bold">Created At:</div>
                                                <div class="col-md-8">{{ $model->created_at->format('Y-m-d H:i:s') }}</div>
                                            </div>
                                            
                                            <h6 class="mt-4 mb-3">Configuration</h6>
                                            <div class="card">
                                                <div class="card-body">
                                                    <pre>{{ json_encode($model->config, JSON_PRETTY_PRINT) }}</pre>
                                                </div>
                                            </div>
                                            
                                            <h6 class="mt-4 mb-3">Training Results</h6>
                                            <div class="row">
                                                <div class="col-md-4">
                                                    <div class="card">
                                                        <div class="card-body text-center">
                                                            <h6 class="card-title">Accuracy</h6>
                                                            <p class="card-text fs-4">{{ number_format($model->training_result['final_accuracy'] * 100, 2) }}%</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-md-4">
                                                    <div class="card">
                                                        <div class="card-body text-center">
                                                            <h6 class="card-title">Loss</h6>
                                                            <p class="card-text fs-4">{{ number_format($model->training_result['final_loss'], 4) }}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-md-4">
                                                    <div class="card">
                                                        <div class="card-body text-center">
                                                            <h6 class="card-title">Training Time</h6>
                                                            <p class="card-text fs-4">{{ number_format($model->training_result['training_time'], 2) }}s</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="modal-footer">
                                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        @empty
                            <tr>
                                <td colspan="6" class="text-center">No AI models found</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            
            <div class="d-flex justify-content-center mt-4">
                {{ $aiModels->links() }}
            </div>
        </div>
    </div>
    
    <!-- Create Model Modal -->
    <div class="modal fade" id="createModelModal" tabindex="-1" aria-labelledby="createModelModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="createModelModalLabel">Train New AI Model</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="createModelForm">
                        <div class="mb-3">
                            <label for="owner_address" class="form-label">Owner Address</label>
                            <input type="text" class="form-control" id="owner_address" name="owner_address" required>
                        </div>
                        <div class="mb-3">
                            <label for="num_qubits" class="form-label">Number of Qubits</label>
                            <input type="number" class="form-control" id="num_qubits" name="num_qubits" min="4" max="20" value="8" required>
                        </div>
                        <div class="mb-3">
                            <label for="layers" class="form-label">Number of Layers</label>
                            <input type="number" class="form-control" id="layers" name="layers" min="1" max="5" value="2" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-quantum" id="trainModelBtn">Train</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Prediction Modal -->
    <div class="modal fade" id="predictionModal" tabindex="-1" aria-labelledby="predictionModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="predictionModalLabel">Make Prediction</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="predictionForm">
                        <input type="hidden" id="prediction_model_id" name="model_id">
                        <div class="mb-3">
                            <label for="input_data" class="form-label">Input Data (comma-separated numbers)</label>
                            <input type="text" class="form-control" id="input_data" name="input_data" placeholder="1.0, 2.5, 3.7, 4.2, 5.0" required>
                        </div>
                    </form>
                    
                    <div id="predictionResult" class="mt-4 d-none">
                        <h6>Prediction Result</h6>
                        <div class="card">
                            <div class="card-body">
                                <pre id="predictionOutput"></pre>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-quantum" id="makePredictionBtn">Predict</button>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
<script>
    // Train new model
    document.getElementById('trainModelBtn').addEventListener('click', function() {
        const ownerAddress = document.getElementById('owner_address').value;
        const numQubits = parseInt(document.getElementById('num_qubits').value);
        const layers = parseInt(document.getElementById('layers').value);
        
        // Generate random training data
        const trainingData = [];
        for (let i = 0; i < 10; i++) {
            const input = Array.from({length: 5}, () => Math.random() * 10);
            const output = [Math.random()];
            trainingData.push({input, output});
        }
        
        fetch('/api/ai/train', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': '{{ csrf_token() }}'
            },
            body: JSON.stringify({
                owner_address: ownerAddress,
                model_config: {
                    num_qubits: numQubits,
                    layers: layers
                },
                training_data: trainingData
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                alert('AI model trained successfully!\nModel ID: ' + data.model_id);
                window.location.reload();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while training the AI model.');
        });
    });
    
    // Predict with model
    const predictButtons = document.querySelectorAll('.predict-btn');
    predictButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modelId = this.getAttribute('data-model-id');
            document.getElementById('prediction_model_id').value = modelId;
            document.getElementById('predictionResult').classList.add('d-none');
            
            const predictionModal = new bootstrap.Modal(document.getElementById('predictionModal'));
            predictionModal.show();
        });
    });
    
    document.getElementById('makePredictionBtn').addEventListener('click', function() {
        const modelId = document.getElementById('prediction_model_id').value;
        const inputDataStr = document.getElementById('input_data').value;
        
        // Parse input data
        const inputData = inputDataStr.split(',').map(val => parseFloat(val.trim()));
        
        fetch('/api/ai/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': '{{ csrf_token() }}'
            },
            body: JSON.stringify({
                model_id: modelId,
                input_data: inputData
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                document.getElementById('predictionOutput').textContent = JSON.stringify(data.prediction, null, 2);
                document.getElementById('predictionResult').classList.remove('d-none');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while making the prediction.');
        });
    });
</script>
@endsection