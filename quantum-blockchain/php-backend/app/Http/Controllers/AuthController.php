<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',$request->validate([
    'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'User registered successfully',
                'device_name' => 'nullable|string|max:255',
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'device_name' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Delete previous tokens with the same name if they exist
        $user->tokens()->where('name', $request->device_name)->delete();
        
        // Create a new token
        $token = $user->createToken($request->device_name);

        return response()->json([
            'token' => $token->plainTextToken,
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    // Clear login attempts on successful login
            $this->clearLoginAttempts($request);

            $user = User::where('email', $request->email)->firstOrFail();
            
            // Determine token abilities based on user role
            $abilities = ['user'];
            if ($user->isAdmin()) {
                $abilities[] = 'admin';
            }
            if ($user->isAnalyst()) {
                $abilities[] = 'analyst';
            }
            
            // Use device name for token or default to a generated name
            $deviceName = $request->device_name ?? 'Device_' . substr(md5(rand()), 0, 8);
            
            // Revoke previous tokens for this device if it exists
            if ($request->device_name) {
                $user->tokens()->where('name', $deviceName)->delete();
            }
            
            // Only revoke the current token
            $token = $user->createToken($deviceName, $abilitiespublic function user(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Logout from all devices (revoke all tokens).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logoutAll(Request $request): JsonResponse
    {
        try {
            // Revoke all tokens
            $request->user()->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Successfully logged out from all devices'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout from all devices failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all active sessions for the user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function sessions(Request $request): JsonResponse
    {
        try {
            $tokens = $request->user()->tokens;
            $sessions = $tokens->map(function ($token) {
                return [
                    'id' => $token->id,
                    'device_name' => $token->name,
                    'last_used' => $token->last_used_at ? $token->last_used_at->diffForHumans() : 'Never',
                    'created_at' => $token->created_at->diffForHumans(),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'sessions' => $sessions
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve sessions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Revoke a specific session.
     *
     * @param Request $request
     * @param int $tokenId
     * @return JsonResponse
     */
    public function revokeSession(Request $request, int $tokenId): JsonResponse
    {
        try {
            $request->user()->tokens()->where('id', $tokenId)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Session revoked successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to revoke session',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user profile.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function updateProfile(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $request->user()->id,
                'preferences' => 'sometimes|required|array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();
            
            if ($request->has('name')) {
                $user->name = $request->name;
            }
            
            if ($request->has('email')) {
                $user->email = $request->email;
            }
            
            if ($request->has('preferences')) {
                $user->preferences = array_merge($user->preferences ?? [], $request->preferences);
            }
            
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => [
                    'user' => $user
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change user password.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function changePassword(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'password' => 'required|string|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();

            // Check current password
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect',
                ], 401);
            }

            // Check password strength
            if (!$this->isPasswordStrong($request->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Password is not strong enough',
                    'errors' => [
                        'password' => ['Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.']
                    ]
                ], 422);
            }

            $user->password = Hash::make($request->password);
            $user->save();

            // Revoke all tokens to force re-login with new password
            $user->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully. Please login again with your new password.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to change password',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if a password is strong enough.
     *
     * @param string $password
     * @return bool
     */
    private function isPasswordStrong(string $password): bool
    {
        // Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character
        $uppercase = preg_match('/[A-Z]/', $password);
        $lowercase = preg_match('/[a-z]/', $password);
        $number = preg_match('/[0-9]/', $password);
        $specialChar = preg_match('/[^A-Za-z0-9]/', $password);

        return $uppercase && $lowercase && $number && $specialChar;
    }

    /**
     * Check if the user has too many login attempts.
     *
     * @param Request $request
     * @return bool
     */
    private function hasTooManyLoginAttempts(Request $request): bool
    {
        $key = 'login_attempts_' . $request->ip();
        $maxAttempts = 5;
        $decayMinutes = 1;

        $attempts = cache()->get($key, 0);
        
        return $attempts >= $maxAttempts;
    }

    /**
     * Increment the login attempts for the user.
     *
     * @param Request $request
     * @return void
     */
    private function incrementLoginAttempts(Request $request): void
    {
        $key = 'login_attempts_' . $request->ip();
        $decayMinutes = 1;

        $attempts = cache()->get($key, 0);
        cache()->put($key, $attempts + 1, now()->addMinutes($decayMinutes));
    }

    /**
     * Clear the login attempts for the user.
     *
     * @param Request $request
     * @return void
     */
    private function clearLoginAttempts(Request $request): void
    {
        $key = 'login_attempts_' . $request->ip();
        cache()->forget($key);
    }
}
