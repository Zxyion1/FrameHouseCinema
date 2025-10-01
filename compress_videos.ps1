# Video compression script for FrameHouseCinema
# Compresses videos to 7-second 1080p clips

$inputDir = "images\videos"
$outputDir = "Media\videos"
$maxDuration = 7

# Refresh PATH to include ffmpeg
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "Compressing videos to 7-second 1080p clips..."

Get-ChildItem -Path $inputDir -Filter "*.MP4" | ForEach-Object {
    $inputFile = $_.FullName
    $outputFile = Join-Path $outputDir $_.Name
    
    Write-Host "Processing: $($_.Name)"
    
    # Use ffmpeg to create 7-second 1080p clip with high compression
    & ffmpeg -i $inputFile -t $maxDuration -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 128k -y $outputFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Compressed: $($_.Name)" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed: $($_.Name)" -ForegroundColor Red
    }
}

Write-Host "Compression complete! Checking file sizes..."
Get-ChildItem -Path $outputDir -Filter "*.MP4" | ForEach-Object {
    $sizeMB = [math]::Round($_.Length / 1MB, 2)
    Write-Host "$($_.Name): $sizeMB MB"
}