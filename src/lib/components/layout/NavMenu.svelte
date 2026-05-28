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
					class="nav-link inline-flex h-10 w-max items-center justify-center px-4 py-2 text-sm font-mono font-medium focus:outline-none"
				>
					<span class="animated-underline">{item.label}</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>
