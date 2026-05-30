<script lang="ts">
	import { ArrowLeft } from "lucide-svelte"

	let qrUrl = $derived("/api/auth/setup?t=" + Date.now())
</script>

<svelte:head>
	<title>TOTP 密钥 - Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center gap-3">
		<a
			href="/dashboard"
			class="inline-flex items-center px-2 py-1 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
		>
			<ArrowLeft size={16} />
		</a>
		<div>
			<h2 class="text-lg font-mono font-bold">TOTP 密钥</h2>
			<p class="text-sm text-muted-foreground mt-1">用 Authenticator App 扫描二维码绑定。更换密钥后需重新扫码。</p>
		</div>
	</div>

	<div class="flex justify-center">
		<img
			src={qrUrl}
			alt="TOTP QR Code"
			class="w-64 h-64 rounded-lg border"
		/>
	</div>
</div>
