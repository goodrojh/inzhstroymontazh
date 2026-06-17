# Minimal static file server (no Node/Python needed)
param([int]$Port = 8080)
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$mime = @{
  '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='application/javascript; charset=utf-8';
  '.json'='application/json; charset=utf-8'; '.svg'='image/svg+xml'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg';
  '.png'='image/png'; '.webp'='image/webp'; '.mp4'='video/mp4'; '.woff2'='font/woff2'; '.ico'='image/x-icon'; '.txt'='text/plain; charset=utf-8'
}
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root on http://localhost:$Port/"
while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $path = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
    if ([string]::IsNullOrEmpty($path)) { $path = 'index.html' }
    $full = Join-Path $root $path
    if ((Test-Path $full -PathType Container)) { $full = Join-Path $full 'index.html' }
    if (Test-Path $full -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($full).ToLower()
      $ct = $mime[$ext]; if (-not $ct) { $ct = 'application/octet-stream' }
      $bytes = [System.IO.File]::ReadAllBytes($full)
      $ctx.Response.ContentType = $ct
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found: ' + $path)
      $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
    }
    $ctx.Response.OutputStream.Close()
  } catch { }
}
