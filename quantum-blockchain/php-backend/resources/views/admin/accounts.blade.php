@extends('layouts.admin')

@section('title', 'Accounts')

@section('content')
    <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">All Accounts</h5>
            <div>
                <button class="btn btn-sm btn-quantum" id="createAccountBtn">
                    <i class="fas fa-plus"></i> Create Account
                </button>
            </div>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Address</th>
                            <th>Balance</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($accounts as $account)
                            <tr>
                                <td>{{ substr($account->address, 0, 15) }}...</td>
                                <td>{{ $account->balance }}</td>
                                <td>{{ $account->created_at->format('Y-m-d H:i:s') }}</td>
                                <td>
                                    <button class="btn btn-sm btn-quantum" data-bs-toggle="modal" data-bs-target="#accountModal{{ $account->id }}">
                                        <i class="fas fa-eye"></i> View
                                    </button>
                                </td>
                            </tr>
                            
                            <!-- Account Modal -->
                            <div class="modal fade" id="accountModal{{ $account->id }}" tabindex="-1" aria-labelledby="accountModalLabel{{ $account->id }}" aria-hidden="true">
                                <div class="modal-dialog">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title" id="accountModalLabel{{ $account->id }}">Account Details</h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div class="modal-body">
                                            <div class="row mb-3">
                                                <div class="col-md-4 fw-bold">Address:</div>
                                                <div class="col-md-8">{{ $account->address }}</div>
                                            </div>
                                            <div class="row mb-3">
                                                <div class="col-md-4 fw-bold">Balance:</div>
                                                <div class="col-md-8">{{ $account->balance }}</div>
                                            </div>
                                            <div class="row mb-3">
                                                <div class="col-md-4 fw-bold">Public Key:</div>
                                                <div class="col-md-8">{{ $account->public_key }}</div>
                                            </div>
                                            <div class="row mb-3">
                                                <div class="col-md-4 fw-bold">Created At:</div>
                                                <div class="col-md-8">{{ $account->created_at->format('Y-m-d H:i:s') }}</div>
                                            </div>
                                            <div class="row mb-3">
                                                <div class="col-md-4 fw-bold">Updated At:</div>
                                                <div class="col-md-8">{{ $account->updated_at->format('Y-m-d H:i:s') }}</div>
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
                                <td colspan="4" class="text-center">No accounts found</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            
            <div class="d-flex justify-content-center mt-4">
                {{ $accounts->links() }}
            </div>
        </div>
    </div>
@endsection

@section('scripts')
<script>
    document.getElementById('createAccountBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to create a new account?')) {
            fetch('/api/accounts/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert('Error: ' + data.error);
                } else {
                    alert('Account created successfully!\nAddress: ' + data.address + '\nBalance: ' + data.balance);
                    window.location.reload();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while creating the account.');
            });
        }
    });
</script>
@endsection