<script lang="ts">
	let qrUrl = $derived("/api/auth/setup?t=" + Date.now())
</script>

<svelte:head>
	<title>设置 - Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h2 class="text-lg font-mono font-bold">TOTP 密钥</h2>
		<p class="text-sm text-muted-foreground mt-1">用 Authenticator App 扫描二维码绑定。更换密钥后需重新扫码。</p>
	</div>

	<div class="flex justify-center">
		<img
			src={qrUrl}
			alt="TOTP QR Code"
			class="w-64 h-64 rounded-lg border"
		/>
	</div>
</div>
