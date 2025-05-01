"""
Smart Contract Gas Optimization Module for Kontour Coin Blockchain
Provides tools for analyzing and optimizing gas usage in smart contracts
"""

import re
import json
import logging
from typing import Dict, List, Any, Optional, Tuple, Union

# Configure logging
logger = logging.getLogger("kontourcoin-gas-optimizer")

class GasOptimizer:
    """
    Gas Optimization Engine for Kontour Coin
    Analyzes and optimizes gas usage in smart contracts
    """
    
    def __init__(self):
        """Initialize the gas optimization engine"""
        self.optimization_patterns = self._load_optimization_patterns()
        
    def _load_optimization_patterns(self) -> Dict[str, List[Dict[str, Any]]]:
        """Load optimization patterns for different optimization levels"""
        return {
            "minimal": [
                {
                    "pattern": r"uint256\s+(\w+)\s*=\s*0\s*;",
                    "replacement": r"uint256 \1 = 0;",
                    "description": "No change in minimal mode",
                    "gas_saved": 0
                },
                {
                    "pattern": r"for\s*\(\s*uint256\s+i\s*=\s*0\s*;\s*i\s*<\s*(\w+)\.length\s*;\s*i\s*\+\+\s*\)",
                    "replacement": r"for (uint256 i = 0; i < \1.length; i++)",
                    "description": "No change to loops in minimal mode",
                    "gas_saved": 0
                }
            ],
            "balanced": [
                {
                    "pattern": r"uint256\s+(\w+)\s*=\s*0\s*;",
                    "replacement": r"uint128 \1 = 0;",
                    "description": "Reduced integer size where appropriate",
                    "gas_saved": 10000
                },
                {
                    "pattern": r"for\s*\(\s*uint256\s+i\s*=\s*0\s*;\s*i\s*<\s*(\w+)\.length\s*;\s*i\s*\+\+\s*\)",
                    "replacement": r"uint256 _length = \1.length;\nfor (uint256 i = 0; i < _length; i++)",
                    "description": "Cached array length in loops to save gas",
                    "gas_saved": 5000
                },
                {
                    "pattern": r"public\s+(\w+)\s*\(",
                    "replacement": r"external \1(",
                    "description": "Changed public to external for functions not called internally",
                    "gas_saved": 15000
                }
            ],
            "aggressive": [
                {
                    "pattern": r"uint256\s+(\w+)\s*=\s*0\s*;",
                    "replacement": r"uint128 \1 = 0;",
                    "description": "Reduced integer size where appropriate",
                    "gas_saved": 10000
                },
                {
                    "pattern": r"for\s*\(\s*uint256\s+i\s*=\s*0\s*;\s*i\s*<\s*(\w+)\.length\s*;\s*i\s*\+\+\s*\)",
                    "replacement": r"uint256 _length = \1.length;\nfor (uint256 i = 0; i < _length;) {\n// Loop body\nunsafe { unchecked { ++i; } }\n}",
                    "description": "Optimized loops with cached length and unchecked increments",
                    "gas_saved": 15000
                },
                {
                    "pattern": r"public\s+(\w+)\s*\(",
                    "replacement": r"external \1(",
                    "description": "Changed public to external for functions not called internally",
                    "gas_saved": 15000
                },
                {
                    "pattern": r"function\s+(\w+)\s*\(\s*(.*?)\s*\)\s*public\s+view\s+returns\s*\(\s*(.*?)\s*\)",
                    "replacement": r"function \1(\2) external view returns (\3)",
                    "description": "Changed public view functions to external",
                    "gas_saved": 10000
                },
                {
                    "pattern": r"string\s+public",
                    "replacement": r"string private",
                    "description": "Changed public strings to private with getters",
                    "gas_saved": 20000
                }
            ]
        }
    
    def analyze_contract(self, contract_code: str) -> Dict[str, Any]:
        """
        Analyze a smart contract for gas usage
        
        Args:
            contract_code: Solidity contract code
            
        Returns:
            Analysis results
        """
        try:
            # Extract functions from contract
            functions = self._extract_functions(contract_code)
            
            # Calculate gas usage for each function
            gas_usage = self._calculate_gas_usage(functions)
            
            # Generate optimization suggestions
            suggestions = self._generate_suggestions(functions)
            
            return {
                "gas_usage": gas_usage,
                "suggestions": suggestions,
                "function_count": len(functions),
                "contract_size": len(contract_code)
            }
        except Exception as e:
            logger.error(f"Error analyzing contract: {e}")
            raise ValueError(f"Error analyzing contract: {e}")
    
    def optimize_contract(self, contract_code: str, optimization_level: str = "balanced") -> Dict[str, Any]:
        """
        Optimize a smart contract for gas usage
        
        Args:
            contract_code: Solidity contract code
            optimization_level: Optimization level (minimal, balanced, aggressive)
            
        Returns:
            Optimization results
        """
        try:
            # Validate optimization level
            if optimization_level not in ["minimal", "balanced", "aggressive"]:
                optimization_level = "balanced"
            
            # Get optimization patterns for the selected level
            patterns = self.optimization_patterns.get(optimization_level, [])
            
            # Apply optimizations
            optimized_code = contract_code
            applied_optimizations = []
            total_gas_saved = 0
            
            for pattern in patterns:
                # Count matches before optimization
                matches_before = len(re.findall(pattern["pattern"], optimized_code))
                
                if matches_before > 0:
                    # Apply optimization
                    optimized_code = re.sub(pattern["pattern"], pattern["replacement"], optimized_code)
                    
                    # Count matches after optimization
                    matches_after = len(re.findall(pattern["pattern"], optimized_code))
                    
                    # Calculate gas saved
                    optimizations_applied = matches_before - matches_after
                    gas_saved = optimizations_applied * pattern["gas_saved"]
                    total_gas_saved += gas_saved
                    
                    # Record applied optimization
                    if optimizations_applied > 0:
                        applied_optimizations.append({
                            "description": pattern["description"],
                            "count": optimizations_applied,
                            "gas_saved": gas_saved
                        })
            
            # Analyze original and optimized contracts
            original_analysis = self.analyze_contract(contract_code)
            optimized_analysis = self.analyze_contract(optimized_code)
            
            return {
                "original_code": contract_code,
                "optimized_code": optimized_code,
                "optimization_level": optimization_level,
                "applied_optimizations": applied_optimizations,
                "total_gas_saved": total_gas_saved,
                "original_analysis": original_analysis,
                "optimized_analysis": optimized_analysis
            }
        except Exception as e:
            logger.error(f"Error optimizing contract: {e}")
            raise ValueError(f"Error optimizing contract: {e}")
    
    def _extract_functions(self, contract_code: str) -> List[Dict[str, Any]]:
        """Extract functions from contract code"""
        functions = []
        
        # Regular expression to match function declarations and bodies
        function_regex = r"function\s+(\w+)\s*\(([^)]*)\)\s*(public|private|internal|external)?\s*(view|pure|payable)?\s*(?:returns\s*\(([^)]*)\))?\s*{([^}]*)}"
        
        for match in re.finditer(function_regex, contract_code):
            function_name = match.group(1)
            parameters = match.group(2)
            visibility = match.group(3) or "public"
            mutability = match.group(4) or ""
            returns = match.group(5) or ""
            body = match.group(6)
            
            functions.append({
                "name": function_name,
                "parameters": parameters,
                "visibility": visibility,
                "mutability": mutability,
                "returns": returns,
                "body": body,
                "full_match": match.group(0)
            })
        
        return functions
    
    def _calculate_gas_usage(self, functions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate gas usage for each function"""
        gas_usage = {
            "total": 0,
            "by_function": {}
        }
        
        # Gas cost patterns
        gas_cost_patterns = {
            "storage_write": {
                "pattern": r"\w+\s*=\s*",
                "cost": 5000
            },
            "storage_read": {
                "pattern": r"\w+\[\w+\]",
                "cost": 800
            },
            "external_call": {
                "pattern": r"\.\w+\(",
                "cost": 2500
            },
            "event_emit": {
                "pattern": r"emit\s+\w+",
                "cost": 1500
            },
            "require": {
                "pattern": r"require\(",
                "cost": 200
            },
            "loop": {
                "pattern": r"for\s*\(",
                "cost": 300
            }
        }
        
        for function in functions:
            function_name = function["name"]
            body = function["body"]
            
            # Base gas cost for function call
            function_gas = 21000
            
            # Add gas cost for patterns
            for pattern_name, pattern_info in gas_cost_patterns.items():
                matches = len(re.findall(pattern_info["pattern"], body))
                pattern_gas = matches * pattern_info["cost"]
                function_gas += pattern_gas
            
            # Store function gas usage
            gas_usage["by_function"][function_name] = function_gas
            gas_usage["total"] += function_gas
        
        return gas_usage
    
    def _generate_suggestions(self, functions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate optimization suggestions for functions"""
        suggestions = []
        
        # Suggestion patterns
        suggestion_patterns = [
            {
                "pattern": r"for\s*\(\s*\w+\s+\w+\s*=\s*0\s*;\s*\w+\s*<\s*(\w+)\.length\s*;\s*\w+\s*\+\+\s*\)",
                "suggestion": "Cache array length outside the loop to save gas",
                "example": "uint256 length = array.length;\nfor (uint256 i = 0; i < length; i++) { ... }"
            },
            {
                "pattern": r"public\s+(\w+)\s*\(",
                "suggestion": "Use 'external' instead of 'public' for functions not called internally",
                "example": "function exampleFunction() external { ... }"
            },
            {
                "pattern": r"uint256",
                "suggestion": "Use smaller integer types when possible (uint128, uint64, etc.)",
                "example": "uint128 smallerInt = 100;"
            },
            {
                "pattern": r"string\s+public",
                "suggestion": "Use private strings with getters instead of public strings",
                "example": "string private _name;\nfunction name() external view returns (string memory) { return _name; }"
            },
            {
                "pattern": r"\+\+\s*\w+",
                "suggestion": "Use ++i instead of i++ to save gas",
                "example": "for (uint256 i = 0; i < length; ++i) { ... }"
            }
        ]
        
        for function in functions:
            function_name = function["name"]
            body = function["body"]
            
            function_suggestions = []
            
            for pattern_info in suggestion_patterns:
                if re.search(pattern_info["pattern"], body):
                    function_suggestions.append({
                        "suggestion": pattern_info["suggestion"],
                        "example": pattern_info["example"]
                    })
            
            if function_suggestions:
                suggestions.append({
                    "function": function_name,
                    "suggestions": function_suggestions
                })
        
        return suggestions
    
    def estimate_savings(self, gas_saved: int, tx_volume: int = 100, gas_price: int = 50, eth_price: float = 3000) -> Dict[str, Any]:
        """
        Estimate savings from gas optimization
        
        Args:
            gas_saved: Amount of gas saved
            tx_volume: Estimated transaction volume
            gas_price: Gas price in Gwei
            eth_price: ETH price in USD
            
        Returns:
            Estimated savings
        """
        # Calculate ETH saved per transaction
        eth_saved_per_tx = (gas_saved * gas_price) / 1e9
        
        # Calculate total ETH saved
        total_eth_saved = eth_saved_per_tx * tx_volume
        
        # Calculate USD value
        usd_saved = total_eth_saved * eth_price
        
        return {
            "gas_saved": gas_saved,
            "eth_saved_per_tx": eth_saved_per_tx,
            "total_eth_saved": total_eth_saved,
            "usd_saved": usd_saved,
            "tx_volume": tx_volume,
            "gas_price": gas_price,
            "eth_price": eth_price
        }

# Create global gas optimizer instance
gas_optimizer = GasOptimizer()