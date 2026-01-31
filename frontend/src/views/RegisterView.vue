<template>
    <div class="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <!-- Background effects -->
        <div class="absolute inset-0 overflow-hidden">
            <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl"></div>
        </div>

        <div class="w-full max-w-md glass-card relative z-10">
            <!-- Logo -->
            <div class="flex items-center justify-center gap-3 mb-8">
                <div
                    class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg glow-animation">
                    <span class="text-white font-heading text-2xl">C</span>
                </div>
                <span class="text-2xl font-heading text-white">County</span>
            </div>

            <!-- Title -->
            <h1 class="text-2xl md:text-3xl font-heading text-white text-center mb-2">Create account</h1>
            <p class="text-neutral-400 text-center mb-8 font-body">Start managing your finances today</p>

            <!-- Error Message -->
            <div v-if="authStore.error" class="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p class="text-red-400 text-sm text-center">{{ authStore.error }}</p>
            </div>

            <!-- Success Message -->
            <div v-if="success" class="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p class="text-green-400 text-sm text-center">Account created! Redirecting to login...</p>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="space-y-5">
                <div>
                    <label for="fullName" class="block text-sm font-mono text-neutral-400 mb-2">Full Name</label>
                    <input id="fullName" v-model="fullName" type="text" required class="input-field"
                        placeholder="John Doe" />
                </div>

                <div>
                    <label for="email" class="block text-sm font-mono text-neutral-400 mb-2">Email</label>
                    <input id="email" v-model="email" type="email" required class="input-field"
                        placeholder="you@example.com" />
                </div>

                <div>
                    <label for="password" class="block text-sm font-mono text-neutral-400 mb-2">Password</label>
                    <input id="password" v-model="password" type="password" required minlength="8" class="input-field"
                        placeholder="••••••••" />
                    <p class="mt-1 text-xs text-neutral-500">Minimum 8 characters</p>
                </div>

                <button type="submit" :disabled="authStore.isLoading" class="btn-primary w-full py-3">
                    <span v-if="authStore.isLoading" class="flex items-center justify-center gap-2">
                        <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        Creating account...
                    </span>
                    <span v-else>Create Account</span>
                </button>
            </form>

            <!-- Login Link -->
            <p class="mt-8 text-center text-neutral-400 text-sm">
                Already have an account?
                <router-link to="/login" class="text-blue-400 hover:text-blue-300 font-mono">
                    Sign in
                </router-link>
            </p>

            <!-- Back to Home -->
            <router-link to="/"
                class="block mt-4 text-center text-neutral-500 text-sm hover:text-neutral-400 transition-colors">
                ← Back to home
            </router-link>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const fullName = ref('')
const email = ref('')
const password = ref('')
const success = ref(false)

const handleSubmit = async () => {
    const result = await authStore.register(email.value, fullName.value, password.value)
    if (result) {
        success.value = true
        setTimeout(() => {
            router.push('/login')
        }, 2000)
    }
}
</script>
