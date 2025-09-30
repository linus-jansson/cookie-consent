# Cookie consent manager for uppsala kommun

## Usage
```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Uppsala kommun</title>
	<script src="@uppsala/cookie-consent"></script>
</head>
<body>
	<!-- Content -->
	<script 
		type="application/blocked-consent"
		data-consent="functional"
		data-src="https://example.com/script_needing_consent.js"
	></script>
	
	<script 
		type="application/blocked-consent"
		data-orig-type="module"
		data-consent="functional"
		data-src="https://example.com/script_esm_needing_consent.js"
	></script>

	<script 
		type="application/blocked-consent"
		data-consent="measurement"
	>
		(async () => {
			const day = 24 * 60 * 60 * 1000;

			try {
				await cookieStore.set({
					name: "cookie2",
					value: "cookie2-value",
					expires: Date.now() + day,
					partitioned: true,
				});
			} catch (error) {
				log(`Error setting cookie2: ${error}`);
			}
		})()
	</script>
</body>
</html>
```

## Available data- attributes
- `data-consent`: (required) the consent category required for this script to run. One of `essential`, `functional`, `measurement`.
- `data-src`: (optional) the URL of an external script to load. If not provided, the script content is assumed to be inline.
- `data-orig-type`: (optional) the original type of the script. If the script is a module, set this to `module`. If not provided, the script is assumed to be a classic script.
- All other regular attributes are kept when the script consented.