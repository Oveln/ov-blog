<script lang="ts">
	import { Button } from "$lib/components/ui/button"
	import { Input } from "$lib/components/ui/input"

	let code = $state("")
	let error = $state("")
	let loading = $state(false)

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault()
		error = ""
		loading = true

		try {
			const resp = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code }),
			})
			const data = await resp.json()

			if (data.ok) {
				window.location.href = "/dashboard"
			} else {
				console.error("Login failed:", data)
				error = data.error ?? "登录失败"
			}
		} catch (err) {
			console.error("Login error:", err)
			error = "网络错误"
		} finally {
			loading = false
		}
	}
</script>

<svelte:head>
	<title>登录 - Oveln Blog</title>
</svelte:head>

<div class="flex items-center justify-center min-h-[calc(100vh-56px)] px-4">
	<form onsubmit={handleLogin} class="w-full max-w-sm space-y-6">
		<div class="text-center">
			<h1 class="text-2xl font-mono font-bold">Dashboard 登录</h1>
			<p class="text-sm text-muted-foreground mt-1">输入 Authenticator 验证码</p>
		</div>

		{#if error}
			<div class="text-sm text-destructive text-center bg-destructive/10 rounded-md px-3 py-2">
				{error}
			</div>
		{/if}

		<div class="space-y-4">
			<div class="space-y-2">
				<label for="code" class="text-sm font-mono">验证码</label>
				<Input
					id="code"
					bind:value={code}
					placeholder="000000"
					inputmode="numeric"
					autocomplete="one-time-code"
					class="text-center text-2xl tracking-[0.5em] font-mono"
				/>
			</div>
		</div>

		<Button type="submit" class="w-full" disabled={loading}>
			{loading ? "验证中..." : "登录"}
		</Button>
	</form>
</div>
