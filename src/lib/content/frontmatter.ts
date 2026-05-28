export interface FrontmatterData {
	title: string
	description: string
	tags: string[]
	published: boolean
	createdAt: string
	updatedAt?: string
}

export function serializeFrontmatter(data: FrontmatterData): string {
	const lines = [
		"---",
		`title: "${data.title.replace(/"/g, '\\"')}"`,
		`description: "${data.description.replace(/"/g, '\\"')}"`,
		`tags:`,
		...data.tags.map((t) => `  - "${t}"`),
		`published: ${data.published}`,
		`createdAt: "${data.createdAt}"`,
	]
	if (data.updatedAt) {
		lines.push(`updatedAt: "${data.updatedAt}"`)
	}
	lines.push("---", "")
	return lines.join("\n")
}
