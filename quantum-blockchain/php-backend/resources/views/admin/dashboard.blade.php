@extends('layouts.admin')

@section('title', 'Dashboard')

@section('content')
    <!-- Stats Cards -->
    <div class="row">
        <div class="col-md-3">
            <div class="card stat-card">
                <i class="fas fa-cubes"></i>
                <div class="stat-value">{{ $blockCount }}</div>
                <div class="stat-label">Blocks</div>
            </div>
        </div>
        
        <div class="col-md-3">
            <div class="card stat-card">
                <i class="fas fa-exchange-alt"></i>
                <div class="stat-value">{{ $transactionCount }}</div>
                <div class="stat-label">Transactions</div>
            </div>
        </div>
        
        <div class="col-md-3">
            <div class="card stat-card">
                <i class="fas fa-wallet"></i>
                <div class="stat-value">{{ $accountCount }}</div>
                <div class="stat-label">Accounts</div>
            </div>
        </div>
        
        <div class="col-md-3">
            <div class="card stat-card">
                <i class="fas fa-brain"></i>
                <div class="stat-value">{{ $aiModelCount }}</div>
                <div class="stat-label">AI Models</div>
            </div>
        </div>
    </div>
    
    <!-- Latest Blocks -->
    <div class="card mt-4">
        <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Latest Blocks</h5>
            <a href="{{ route('admin.blocks') }}" class="btn btn-sm btn-quantum">View All</a>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Index</th>
                            <th>Hash</th>
                            <th>Timestamp</th>
                            <th>Transactions</th>
                            <th>Quantum Enhanced</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($latestBlocks as $block)
                            <tr>
                                <td>{{ $block->index }}</td>
                                <td>{{ substr($block->hash, 0, 10) }}...</td>
                                <td>{{ $block->block_timestamp->format('Y-m-d H:i:s') }}</td>
                                <td>{{ $block->transactions->count() }}</td>
                                <td>
                                    @if($block->quantum_enhanced)
                                        <span class="badge badge-quantum">Yes</span>
                                    @else
                                        <span class="badge bg-secondary">No</span>
                                    @endif
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="text-center">No blocks found</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <!-- Pending Transactions -->
    <div class="card mt-4">
        <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Pending Transactions</h5>
            <a href="{{ route('admin.transactions') }}" class="btn btn-sm btn-quantum">View All</a>
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
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($pendingTransactions as $transaction)
                            <tr>
                                <td>{{ substr($transaction->hash, 0, 10) }}...</td>
                                <td>{{ substr($transaction->sender, 0, 10) }}...</td>
                                <td>{{ substr($transaction->recipient, 0, 10) }}...</td>
                                <td>{{ $transaction->amount }}</td>
                                <td>{{ $transaction->type }}</td>
                                <td>
                                    <span class="badge bg-warning">{{ $transaction->status }}</span>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="text-center">No pending transactions</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <!-- Recent Accounts -->
    <div class="card mt-4">
        <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Recent Accounts</h5>
            <a href="{{ route('admin.accounts') }}" class="btn btn-sm btn-quantum">View All</a>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Address</th>
                            <th>Balance</th>
                            <th>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($accounts as $account)
                            <tr>
                                <td>{{ substr($account->address, 0, 15) }}...</td>
                                <td>{{ $account->balance }}</td>
                                <td>{{ $account->created_at->format('Y-m-d H:i:s') }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="3" class="text-center">No accounts found</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
<script>
    // Refresh dashboard every 30 seconds
    setTimeout(function() {
        window.location.reload();
    }, 30000);
</script>
@endsection