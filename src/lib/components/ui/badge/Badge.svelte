<script lang="ts">
	import { cn } from "$lib/utils";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	type Props = HTMLAttributes<HTMLElement> & {
		variant?: "default" | "secondary" | "destructive" | "outline";
		children?: Snippet;
		class?: string;
	};

	let { variant = "default", children, class: className, ...restProps }: Props = $props();

	const variantClasses = {
		default: "bg-primary text-primary-foreground hover:bg-primary/80",
		secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
		destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
		outline: "text-foreground border border-input",
	};
</script>

<div
	class={cn(
		"inline-flex items-center rounded-md border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
		variantClasses[variant],
		className,
	)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</div>
