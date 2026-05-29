import { createPatch, applyPatch as diffApply } from "diff"

export function makePatch(
	docId: string,
	oldContent: string,
	newContent: string,
): string {
	return createPatch(`${docId}.md`, oldContent, newContent)
}

export function applyPatchContent(content: string, patch: string): string {
	const result = diffApply(content, patch)
	if (result === false) {
		throw new Error("Failed to apply patch")
	}
	return result
}