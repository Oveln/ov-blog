declare module "qrcode-svg" {
	interface QRCodeOptions {
		content: string
		padding?: number
		width?: number
		height?: number
		color?: string
		background?: string
		ecl?: string
	}
	class QRCode {
		constructor(options: string | QRCodeOptions)
		svg(): string
	}
	export default QRCode
}

declare module "qrcode-terminal" {
	function generate(text: string, opts?: { small?: boolean }): void
	export = { generate }
}
