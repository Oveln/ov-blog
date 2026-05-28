<script lang="ts">
	const links = [
		{ href: "/", label: "Home" },
		{ href: "/blogs", label: "Blogs" },
		{ href: "/apps", label: "Apps" },
		{ href: "/about", label: "About" },
		{ href: "/dashboard", label: "Dashboard" },
	];
</script>

<nav class="relative z-10 flex max-w-max flex-1 items-center justify-center py-2 mx-auto lg:mx-0">
	<ul class="group flex flex-1 list-none items-center justify-center space-x-1">
		{#each links as item}
			<li>
				<a
					href={item.href}
					class="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-mono font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none pl-0"
				>
					{item.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
