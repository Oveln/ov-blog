<script lang="ts">
	const links = [
		{ href: "/", label: "Home" },
		{ href: "/blogs", label: "Blogs" },
		{ href: "/apps", label: "Apps" },
		{ href: "/about", label: "About" },
		{ href: "/dashboard", label: "Dashboard" },
	];
</script>

<nav class="relative z-10 flex w-full max-w-full flex-1 items-center justify-center px-1 py-2 mx-auto lg:mx-0">
	<ul class="group flex flex-1 list-none flex-wrap items-center justify-center gap-x-0.5 gap-y-0.5">
		{#each links as item}
			<li>
				<a
					href={item.href}
					class="nav-link inline-flex h-10 w-max items-center justify-center px-2.5 py-2 text-xs font-mono font-medium focus:outline-none sm:px-4 sm:text-sm"
				>
					<span class="animated-underline">{item.label}</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>
