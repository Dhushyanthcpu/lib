@extends('layouts.admin')

@section('title', 'Blocks')

@section('content')
    <div class="card">
        <div class="card-header">
            <h5 class="mb-0">All Blocks</h5>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Index</th>
                            <th>Hash</th>
                            <th>Previous Hash</th>
                            <th>Timestamp</th>
                            <th>Nonce</th>
                            <th>Difficulty</th>
                            <th>Transactions</th>
                            <th>Quantum Enhanced</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($blocks as $block)
                            <tr>
                                <td>{{ $block->index }}</td>
                                <td>{{ substr($block->hash, 0, 10) }}...</td>
                                <td>{{ substr($block->previous_hash, 0, 10) }}...</td>
                                <td>{{ $block->block_timestamp->format('Y-m-d H:i:s') }}</td>
                                <td>{{ $block->nonce }}</td>
                                <td>{{ $block->difficulty }}</td>
                                <td>{{ $block->transactions->count() }}</td>
                                <td>
                                    @if($block->quantum_enhanced)
                                        <span class="badge badge-quantum">Yes</span>
                                    @else
                                        <span class="badge bg-secondary">No</span>
                                    @endif
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-quantum" data-bs-toggle="modal" data-bs-target="#blockModal{{ $block->id }}">
                                        <i class="fas fa-eye"></i> View
                                    </button>
                                </td>
                            </tr>
                            
                            <!-- Block Modal -->
                            <div class="modal fade" id="blockModal{{ $block->id }}" tabindex="-1" aria-labelledby="blockModalLabel{{ $block->id }}" aria-hidden="true">
                                <div class="modal-dialog modal-lg">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title" id="blockModalLabel{{ $block->id }}">Block #{{ $block->index }}</h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div class="modal-body">
                                            <div class="row mb-3">
                                                <div class="col-md-3 fw-bold">Index:</div>
                                                <div class="col-md-9">{{ $block->index }}</div>
                                            </div>
                                            <div class="row mb-3">
                                                <div class="col-md-3 fw-bold">Hash:</div>
                                                <div class="col-md-9">{{ $block->hash }}</div>
                                            </div>
                                            <div class="row mb-3">
                                                <div class="col-md-3 fw-bold">Previous Hash:</div>
                                                <div class="col-md-9">{{ $block->previous_hash }}</div>
                                            </div>
                                            <div class="row mb-3">
                                                <div class="col-md-3 fw-bold">Timestamp:</div>
                                                <div class="col-md-9">{{ $block->block_timestamp->format('Y-m-d H:i:s') }}</div>
                                            </div>
                                            <div class="row mb-3">
                                                <div class="col-md-3 fw-bold">Nonce:</div>
                                                <div class="col-md-9">{{ $block->nonce }}</div>
                                            </div>
                                            <div class="row mb-3">
                                                <div class="col-md-3 fw-bold">Difficulty:</div>
                                                <div class="col-md-9">{{ $block->difficulty }}</div>
                                            </div>
                                            <div class="row mb-3">
                                                <div class="col-md-3 fw-bold">Quantum Enhanced:</div>
                                                <div class="col-md-9">
                                                    @if($block->quantum_enhanced)
                                                        <span class="badge badge-quantum">Yes</span>
                                                    @else
                                                        <span class="badge bg-secondary">No</span>
                                                    @endif
                                                </div>
                                            </div>
                                            
                                            <h6 class="mt-4 mb-3">Transactions</h6>
                                            <div class="table-responsive">
                                                <table class="table">
                                                    <thead>
                                                        <tr>
                                                            <th>Hash</th>
                                                            <th>From</th>
                                                            <th>To</th>
                                                            <th>Amount</th>
                                                            <th>Type</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        @forelse($block->transactions as $transaction)
                                                            <tr>
                                                                <td>{{ substr($transaction->hash, 0, 10) }}...</td>
                                                                <td>{{ substr($transaction->sender, 0, 10) }}...</td>
                                                                <td>{{ substr($transaction->recipient, 0, 10) }}...</td>
                                                                <td>{{ $transaction->amount }}</td>
                                                                <td>{{ $transaction->type }}</td>
                                                            </tr>
                                                        @empty
                                                            <tr>
                                                                <td colspan="5" class="text-center">No transactions in this block</td>
                                                            </tr>
                                                        @endforelse
                                                    </tbody>
                                                </table>
                                            </div>
                                            
                                            @if($block->quantum_enhanced && $block->quantum_metrics)
                                                <h6 class="mt-4 mb-3">Quantum Metrics</h6>
                                                <div class="row">
                                                    <div class="col-md-6">
                                                        <div class="card">
                                                            <div class="card-body">
                                                                <h6 class="card-title">Mining Speedup</h6>
                                                                <p class="card-text">{{ $block->quantum_metrics['mining_speedup']['mean'] }}x</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-6">
                                                        <div class="card">
                                                            <div class="card-body">
                                                                <h6 class="card-title">Verification Accuracy</h6>
                                                                <p class="card-text">{{ $block->quantum_metrics['verification_accuracy']['mean'] * 100 }}%</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            @endif
                                        </div>
                                        <div class="modal-footer">
                                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        @empty
                            <tr>
                                <td colspan="9" class="text-center">No blocks found</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            
            <div class="d-flex justify-content-center mt-4">
                {{ $blocks->links() }}
            </div>
        </div>
    </div>
@endsection