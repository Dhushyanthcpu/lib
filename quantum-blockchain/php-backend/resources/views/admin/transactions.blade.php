@extends('layouts.admin')

@section('title', 'Transactions')

@section('content')
    <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">All Transactions</h5>
            <div>
                <button class="btn btn-sm btn-quantum" data-bs-toggle="modal" data-bs-target="#createTransactionModal">
                    <i class="fas fa-plus"></i> Create Transaction
                </button>
            </div>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Hash</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Amount</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Block</th>
                            <th>Timestamp</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($transactions as $transaction)
                            <tr>
                                <td>{{ substr($transaction->hash, 0, 10) }}...</td>
                                <td>{{ substr($transaction->sender, 0, 10) }}...</td>
                                <td>{{ substr($transaction->recipient, 0, 10) }}...</td>
                                <td>{{ $transaction->amount }}</td>
                                <td>{{ $transaction->type }}</td>
                                <td>
                                    @if($transaction->status === 'confirmed')
                                        <span class="badge bg-success">{{ $transaction->status }}</span>
                                    @elseif($transaction->status === 'pending')
                                        <span class="badge bg-warning">{{ $transaction->status }}</span>
                                    @else
                                        <span class="badge bg-danger">{{ $transaction->status }}</span>
                                    @endif
                                </td>
                                <td>
                                    @if($transaction->block)
                                        {{ $transaction->block->index }}
                                    @else
                                        -
                                    @endif
                                </td>
                                <td>{{ $transaction->transaction_timestamp->format('Y-m-d H:i:s') }}</td>
                                <td>
                                    <button class="btn btn-sm btn-quantum" data-bs-toggle="modal" data-bs-target="#transactionModal{{ $transaction->id }}">
                                        <i class="fas fa-eye"></i> View
                                    </button>
                                </td>
                            </tr>
                            
                            <!-- Transaction Modal -->
                            <div class="modal fade" id="transactionModal{{ $transaction->id }}" tabindex="-1" aria-labelledby="transactionModalLabel{{ $transaction->id }}" aria-hidden="true">
                                <div class="modal-dialog">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title" id="transactionModalLabel{{ $transaction->id }}">Transaction Details</h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div class="modal-body">
                                            <div class="row mb-3">
                                                <div class="col-md-4 fw-bold">Hash:</div>
                                                <div class="col-md-8">{{ $transaction->hash }}</div>
                                            </div>
                                            <div class="row mb-3">
                                                <div class="col-md-4 fw-bold">From:</div>
                                                <div class="col-md-8">{{ $transaction->sender }}</div>
                                            </div>
                                            <div class="row mb-3">
                                                <div class="col-md-4 fw-bold">To:</div>
                                                <div class="col-md-8">{{ $transaction->recipient }}</div>
                                            </div>
                                            <div class="row mb-3">
                                                <div class="col-md-4 fw-bold">Amount:</div>
                                                <div class="col-md-8">{{ $transaction->amount }}</div>
                                            </div>
                                            <div class="row mb-3">
                                                <div class="col-md-4 fw-bold">Type:</div>
                                                <div class="col-md-8">{{ $transaction->type }}</div>
                                            </div>
                                            <div class="row mb-3">
                                                <div class="col-md-4 fw-bold">Status:</div>
                                                <div class="col-md-8">
                                                    @if($transaction->status === 'confirmed')
                                                        <span class="badge bg-success">{{ $transaction->status }}</span>
                                                    @elseif($transaction->status === 'pending')
                                                        <span class="badge bg-warning">{{ $transaction->status }}</span>
                                                    @else
                                                        <span class="badge bg-danger">{{ $transaction->status }}</span>
                                                    @endif
                                                </div>
                                            </div>
                                            <div class="row mb-3">
                                                <div class="col-md-4 fw-bold">Block:</div>
                                                <div class="col-md-8">
                                                    @if($transaction->block)
                                                        {{ $transaction->block->index }}
                                                    @else
                                                        -
                                                    @endif
                                                </div>
                                            </div>
                                            <div class="row mb-3">
                                                <div class="col-md-4 fw-bold">Timestamp:</div>
                                                <div class="col-md-8">{{ $transaction->transaction_timestamp->format('Y-m-d H:i:s') }}</div>
                                            </div>
                                            
                                            @if($transaction->data)
                                                <div class="row mb-3">
                                                    <div class="col-md-4 fw-bold">Data:</div>
                                                    <div class="col-md-8">
                                                        <pre>{{ json_encode($transaction->data, JSON_PRETTY_PRINT) }}</pre>
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
                                <td colspan="9" class="text-center">No transactions found</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            
            <div class="d-flex justify-content-center mt-4">
                {{ $transactions->links() }}
            </div>
        </div>
    </div>
    
    <!-- Create Transaction Modal -->
    <div class="modal fade" id="createTransactionModal" tabindex="-1" aria-labelledby="createTransactionModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="createTransactionModalLabel">Create Transaction</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="createTransactionForm" action="/api/transactions/create" method="POST">
                        <div class="mb-3">
                            <label for="sender" class="form-label">From</label>
                            <input type="text" class="form-control" id="sender" name="sender" required>
                        </div>
                        <div class="mb-3">
                            <label for="recipient" class="form-label">To</label>
                            <input type="text" class="form-control" id="recipient" name="recipient" required>
                        </div>
                        <div class="mb-3">
                            <label for="amount" class="form-label">Amount</label>
                            <input type="number" class="form-control" id="amount" name="amount" step="0.00000001" min="0.00000001" required>
                        </div>
                        <div class="mb-3">
                            <label for="transaction_type" class="form-label">Type</label>
                            <select class="form-select" id="transaction_type" name="transaction_type">
                                <option value="transfer">Transfer</option>
                                <option value="contract">Contract</option>
                                <option value="data">Data</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-quantum" id="submitTransaction">Create</button>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
<script>
    document.getElementById('submitTransaction').addEventListener('click', function() {
        const form = document.getElementById('createTransactionForm');
        const formData = new FormData(form);
        
        fetch('/api/transactions/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': '{{ csrf_token() }}'
            },
            body: JSON.stringify(Object.fromEntries(formData))
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                alert('Transaction created successfully!');
                window.location.reload();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while creating the transaction.');
        });
    });
</script>
@endsection