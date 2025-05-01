<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quantum Blockchain PHP Backend</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        :root {
            --primary-color: #6a11cb;
            --secondary-color: #2575fc;
            --dark-color: #343a40;
            --light-color: #f8f9fa;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 2rem;
        }
        
        .container {
            max-width: 800px;
        }
        
        .logo {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .card {
            background-color: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 10px;
            backdrop-filter: blur(10px);
            padding: 2rem;
            margin-bottom: 2rem;
            color: white;
        }
        
        .btn-quantum {
            background-color: white;
            color: var(--primary-color);
            border: none;
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
            font-weight: bold;
            transition: all 0.3s;
        }
        
        .btn-quantum:hover {
            background-color: var(--light-color);
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        .api-endpoint {
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 5px;
            padding: 0.5rem 1rem;
            margin-bottom: 0.5rem;
        }
        
        .api-endpoint code {
            color: #f8f9fa;
        }
        
        .api-method {
            display: inline-block;
            padding: 0.2rem 0.5rem;
            border-radius: 3px;
            margin-right: 0.5rem;
            font-size: 0.8rem;
            font-weight: bold;
        }
        
        .api-method.get {
            background-color: #28a745;
        }
        
        .api-method.post {
            background-color: #007bff;
        }
    </style>
</head>
<body>
    <div class="container text-center">
        <div class="logo">
            <i class="fas fa-atom fa-spin"></i>
        </div>
        
        <h1 class="mb-4">Quantum Blockchain PHP Backend</h1>
        
        <div class="card">
            <h2 class="mb-4">Welcome to the Quantum Blockchain API</h2>
            <p class="lead mb-4">
                This is a Laravel-based RESTful API backend for the Quantum Blockchain project.
                It provides endpoints for blockchain operations, account management, transaction processing,
                mining, AI model training, and security analysis.
            </p>
            
            <div class="d-flex justify-content-center gap-3 mb-4">
                <a href="/admin" class="btn btn-quantum">
                    <i class="fas fa-tachometer-alt me-2"></i> Admin Dashboard
                </a>
                <a href="https://github.com/quantum-blockchain/php-backend" class="btn btn-quantum">
                    <i class="fab fa-github me-2"></i> GitHub Repository
                </a>
            </div>
        </div>
        
        <div class="card">
            <h3 class="mb-4">API Endpoints</h3>
            
            <div class="text-start">
                <h5>Blockchain</h5>
                <div class="api-endpoint">
                    <span class="api-method get">GET</span>
                    <code>/api/blockchain/stats</code> - Get blockchain statistics
                </div>
                <div class="api-endpoint">
                    <span class="api-method get">GET</span>
                    <code>/api/blockchain/blocks</code> - Get blockchain blocks
                </div>
                <div class="api-endpoint">
                    <span class="api-method get">GET</span>
                    <code>/api/blockchain/pending-transactions</code> - Get pending transactions
                </div>
                
                <h5 class="mt-4">Accounts</h5>
                <div class="api-endpoint">
                    <span class="api-method get">GET</span>
                    <code>/api/accounts/{address}/balance</code> - Get account balance
                </div>
                <div class="api-endpoint">
                    <span class="api-method post">POST</span>
                    <code>/api/accounts/create</code> - Create a new account
                </div>
                <div class="api-endpoint">
                    <span class="api-method get">GET</span>
                    <code>/api/accounts</code> - Get all accounts
                </div>
                
                <h5 class="mt-4">Transactions</h5>
                <div class="api-endpoint">
                    <span class="api-method post">POST</span>
                    <code>/api/transactions/create</code> - Create a new transaction
                </div>
                <div class="api-endpoint">
                    <span class="api-method get">GET</span>
                    <code>/api/transactions/{hash}</code> - Get transaction by hash
                </div>
                
                <h5 class="mt-4">Mining</h5>
                <div class="api-endpoint">
                    <span class="api-method post">POST</span>
                    <code>/api/mining/mine-block</code> - Mine a new block
                </div>
                
                <h5 class="mt-4">AI</h5>
                <div class="api-endpoint">
                    <span class="api-method post">POST</span>
                    <code>/api/ai/train</code> - Train an AI model
                </div>
                <div class="api-endpoint">
                    <span class="api-method post">POST</span>
                    <code>/api/ai/predict</code> - Make predictions with an AI model
                </div>
                <div class="api-endpoint">
                    <span class="api-method get">GET</span>
                    <code>/api/ai/models</code> - Get all AI models
                </div>
                <div class="api-endpoint">
                    <span class="api-method get">GET</span>
                    <code>/api/ai/models/{modelId}</code> - Get AI model by ID
                </div>
                
                <h5 class="mt-4">Optimization</h5>
                <div class="api-endpoint">
                    <span class="api-method post">POST</span>
                    <code>/api/optimization/optimize</code> - Optimize blockchain operations
                </div>
                
                <h5 class="mt-4">Security</h5>
                <div class="api-endpoint">
                    <span class="api-method post">POST</span>
                    <code>/api/security/analyze</code> - Analyze blockchain security
                </div>
                <div class="api-endpoint">
                    <span class="api-method get">GET</span>
                    <code>/api/security/latest</code> - Get latest security analysis
                </div>
            </div>
        </div>
        
        <p class="mt-4">
            &copy; {{ date('Y') }} Quantum Blockchain. All rights reserved.
        </p>
    </div>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>