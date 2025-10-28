param(
    [int]$Port = 8000,
    [string]$Root = "."
)

$Root = Resolve-Path $Root
$prefix = "http://localhost:$Port/"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Output "Serving $Root at $prefix. Press Ctrl+C in the terminal to stop."

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $req = $context.Request
        $resp = $context.Response

        $urlPath = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart('/'))
        if ([string]::IsNullOrEmpty($urlPath)) { $urlPath = 'index.html' }
        $localPath = Join-Path $Root $urlPath

        if (-not (Test-Path $localPath)) {
            $resp.StatusCode = 404
            $resp.StatusDescription = 'Not Found'
            $resp.Close()
            continue
        }

        try {
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $mime = switch ($ext) {
                '.html' { 'text/html' }
                '.htm' { 'text/html' }
                '.css' { 'text/css' }
                '.js' { 'application/javascript' }
                '.json' { 'application/json' }
                '.png' { 'image/png' }
                '.jpg' { 'image/jpeg' }
                '.jpeg' { 'image/jpeg' }
                '.gif' { 'image/gif' }
                '.svg' { 'image/svg+xml' }
                '.mp4' { 'video/mp4' }
                default { 'application/octet-stream' }
            }
            $resp.ContentType = $mime
            $resp.ContentLength64 = $bytes.Length
            $resp.OutputStream.Write($bytes, 0, $bytes.Length)
            $resp.Close()
        } catch {
            Write-Error $_
            $resp.StatusCode = 500
            $resp.Close()
        }
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
